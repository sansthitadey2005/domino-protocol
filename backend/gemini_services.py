from google import genai

PROJECT_ID = "domino-protocol-12567"
LOCATION = "global"
MODEL = "gemini-2.5-flash"

client = genai.Client(
    vertexai=True,
    project=PROJECT_ID,
    location=LOCATION,
)


def ask_gemini(prompt: str) -> str:
    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
    )

    return response.text or ""