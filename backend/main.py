import csv
import math
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import json

from .gemini_services import ask_gemini


app = FastAPI(title="Domino Protocol API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# REQUEST MODELS
# ---------------------------------------------------------

class PromptRequest(BaseModel):
    prompt: str


class AnalyzeRequest(BaseModel):
    location: str
    latitude: float
    longitude: float
    text: str


# ---------------------------------------------------------
# RESPONSE MODELS
# ---------------------------------------------------------

class AnalysisResponse(BaseModel):
    summary: str
    entities: List[str]
    relationships: List[str]
    dependencies: List[str]
    risks: List[str]
    actions: List[str]


# ---------------------------------------------------------
# HEALTH CHECK
# ---------------------------------------------------------

@app.get("/")
def health_check():
    return {
        "status": "online",
        "project": "domino-protocol-12567",
    }


# ---------------------------------------------------------
# BASIC GEMINI ENDPOINT
# ---------------------------------------------------------

@app.post("/ask")
def ask(request: PromptRequest):
    answer = ask_gemini(request.prompt)

    return {
        "answer": answer,
    }


# ---------------------------------------------------------
# DOMINO PROTOCOL ANALYSIS
# ---------------------------------------------------------
GEE_FILE = Path(__file__).resolve().parent.parent / "gee" / "combined_risk" / "combined_risk_data.csv"


def get_nearest_gee_data(latitude: float, longitude: float):
    with open(GEE_FILE, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)

        nearest = None
        nearest_distance = float("inf")

        for row in reader:
            try:
                lat = float(row["latitude"])
                lon = float(row["longitude"])

                distance = math.sqrt(
                    (lat - latitude) ** 2 +
                    (lon - longitude) ** 2
                )

                if distance < nearest_distance:
                    nearest_distance = distance
                    nearest = row

            except (ValueError, TypeError):
                continue

    return nearest


@app.get("/gee-data")
def gee_data(latitude: float, longitude: float):
    row = get_nearest_gee_data(latitude, longitude)

    if not row:
        raise HTTPException(
            status_code=404,
            detail="No GEE data found."
        )

    return row
@app.post("/analyze", response_model=AnalysisResponse)
def analyze(request: AnalyzeRequest):

    # ---------------------------------------------
    # 1. Get location-specific GEE data
    # ---------------------------------------------
    gee = get_nearest_gee_data(
        request.latitude,
        request.longitude
    )

    if not gee:
        raise HTTPException(
            status_code=404,
            detail="No geographic data found for this location."
        )

    # ---------------------------------------------
    # 2. Convert available values to numbers
    # ---------------------------------------------
    def num(key):
        try:
            value = gee.get(key, "")
            if value in ("", None):
                return 0.0
            return float(value)
        except (ValueError, TypeError):
            return 0.0

    rainfall = num("rainfall_mm")
    elevation = num("elevation_m")
    population = num("population")
    builtup = num("builtup_area_m2")
    flood_depth = num("coastal_flood_depth_m")
    landcover = num("landcover")

    # ---------------------------------------------
    # 3. Simple transparent risk calculation
    # ---------------------------------------------

    rainfall_score = min(rainfall / 2000 * 100, 100)
    flood_score = min(flood_depth / 6 * 100, 100)

    # Low elevation = greater exposure
    elevation_score = max(0, min((10 - elevation) / 10 * 100, 100))

    population_score = min(population / 100000 * 100, 100)

    risk_score = (
        rainfall_score * 0.35 +
        flood_score * 0.35 +
        elevation_score * 0.15 +
        population_score * 0.15
    )

    risk_score = round(max(0, min(risk_score, 100)), 1)

    if risk_score >= 75:
        risk_level = "HIGH"
    elif risk_score >= 50:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    # ---------------------------------------------
    # 4. Give Gemini the ACTUAL geographic data
    # ---------------------------------------------

    prompt = f"""
You are the Domino Protocol climate-risk analysis engine.

Analyze the selected geographic location using the provided
geospatial data.

LOCATION:
{request.location}

COORDINATES:
Latitude: {request.latitude}
Longitude: {request.longitude}

GEE DATA:
Rainfall: {rainfall} mm
Elevation: {elevation} m
Population indicator: {population}
Built-up area: {builtup} m2
Landcover: {landcover}
Coastal flood depth: {flood_depth} m

CALCULATED RISK:
Risk Score: {risk_score}/100
Risk Level: {risk_level}

USER CONTEXT:
{request.text}

Return ONLY valid JSON.

Use exactly this structure:

{{
    "summary": "Concise explanation of the geographic risk.",
    "entities": [
        "Location",
        "Major environmental factors"
    ],
    "relationships": [
        "Relationship between hazards and exposure"
    ],
    "dependencies": [
        "Important dependencies or vulnerable systems"
    ],
    "risks": [
        "Specific geographic risks"
    ],
    "actions": [
        "Practical recommended actions"
    ]
}}

Do not use Markdown.
Do not add text before or after the JSON.
"""

    try:
        answer = ask_gemini(prompt)

        cleaned_answer = answer.strip()

        if cleaned_answer.startswith("```json"):
            cleaned_answer = cleaned_answer[7:]

        elif cleaned_answer.startswith("```"):
            cleaned_answer = cleaned_answer[3:]

        if cleaned_answer.endswith("```"):
            cleaned_answer = cleaned_answer[:-3]

        result = json.loads(cleaned_answer.strip())

        required_fields = [
            "summary",
            "entities",
            "relationships",
            "dependencies",
            "risks",
            "actions",
        ]

        for field in required_fields:
            if field not in result:
                raise ValueError(f"Missing field: {field}")

        return AnalysisResponse.model_validate(result)

    except json.JSONDecodeError:
        raise HTTPException(
            status_code=502,
            detail={
                "error": "Gemini returned invalid JSON.",
                "raw_response": answer,
            },
        )

    except ValueError as e:
        raise HTTPException(
            status_code=502,
            detail={
                "error": str(e),
                "raw_response": answer,
            },
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Analysis failed.",
                "message": str(e),
            },
        )