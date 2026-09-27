from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import json

from .gemini_services import ask_gemini


app = FastAPI(title="Domino Protocol API")


# ---------------------------------------------------------
# REQUEST MODELS
# ---------------------------------------------------------

class PromptRequest(BaseModel):
    prompt: str


class AnalyzeRequest(BaseModel):
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

@app.post("/analyze", response_model=AnalysisResponse)
def analyze(request: AnalyzeRequest):

    prompt = f"""
You are the Domino Protocol analysis engine.

Analyze the following input according to the Domino Protocol.

INPUT:
{request.text}

Return ONLY valid JSON.

The JSON MUST use exactly this structure:

{{
    "summary": "A concise summary of the input.",
    "entities": [
        "Important entity or concept 1",
        "Important entity or concept 2"
    ],
    "relationships": [
        "Relationship between entities 1",
        "Relationship between entities 2"
    ],
    "dependencies": [
        "Dependency 1",
        "Dependency 2"
    ],
    "risks": [
        "Risk 1",
        "Risk 2"
    ],
    "actions": [
        "Recommended action 1",
        "Recommended action 2"
    ]
}}

Rules:

1. summary must be a concise explanation.
2. entities must contain important people, organizations, systems,
   technologies, concepts, or objects mentioned in the input.
3. relationships must describe meaningful connections between entities.
4. dependencies must describe things that depend on other things.
5. risks must identify potential problems, vulnerabilities, or concerns.
6. actions must contain practical next steps.
7. Every field must be present.
8. entities, relationships, dependencies, risks, and actions must be JSON arrays.
9. Do not use Markdown.
10. Do not put ``` around the JSON.
11. Do not add any text before or after the JSON.
"""

    try:
        answer = ask_gemini(prompt)

        # Remove accidental Markdown code fences if Gemini returns them.
        cleaned_answer = answer.strip()

        if cleaned_answer.startswith("```json"):
            cleaned_answer = cleaned_answer[7:]

        elif cleaned_answer.startswith("```"):
            cleaned_answer = cleaned_answer[3:]

        if cleaned_answer.endswith("```"):
            cleaned_answer = cleaned_answer[:-3]

        cleaned_answer = cleaned_answer.strip()

        # Convert Gemini's JSON text into a Python dictionary.
        result = json.loads(cleaned_answer)

        # Make sure all required fields exist.
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

        # Validate the structure using Pydantic.
        validated_result = AnalysisResponse.model_validate(result)

        return validated_result

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