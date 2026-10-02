import base64
import json
import os

import httpx
from dotenv import load_dotenv
from fastapi import HTTPException, status

load_dotenv()

MODELS = [
    "gemini-3.8-flash",
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-lite-latest",
]
BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"


def get_api_key() -> str:
    key = os.getenv("GEMINI_API_KEY", "").strip()
    if not key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GEMINI_API_KEY is not configured on server",
        )
    return key


async def _generate_with_fallback(payload: dict) -> tuple[str, str]:
    key = get_api_key()
    last_error = None

    async with httpx.AsyncClient(timeout=20.0) as client:
        for model in MODELS:
            url = f"{BASE_URL}/{model}:generateContent?key={key}"
            try:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        return candidates[0]["content"]["parts"][0]["text"], model
                last_error = f"{model} status {res.status_code}"
            except Exception as e:
                last_error = f"{model} error: {e!s}"

    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail=f"Gemini API error: {last_error}",
    )


async def call_gemini_vision(
    image_bytes: bytes, prompt: str, mime_type: str = "image/jpeg"
) -> tuple[dict, str]:
    b64_data = base64.b64encode(image_bytes).decode("utf-8")
    payload = {
        "contents": [
            {
                "parts": [
                    {"inline_data": {"mime_type": mime_type, "data": b64_data}},
                    {"text": prompt},
                ]
            }
        ],
        "generationConfig": {
            "response_mime_type": "application/json",
            "temperature": 0.2,
        },
    }

    raw_text, model = await _generate_with_fallback(payload)
    return json.loads(raw_text), model


async def call_gemini_text(
    prompt: str, system_prompt: str | None = None
) -> tuple[str, str]:
    contents = []
    if system_prompt:
        contents.append(
            {
                "role": "user",
                "parts": [{"text": f"SYSTEM INSTRUCTIONS:\n{system_prompt}"}],
            }
        )
        contents.append(
            {
                "role": "model",
                "parts": [{"text": "OK"}],
            }
        )
    contents.append({"role": "user", "parts": [{"text": prompt}]})

    payload = {
        "contents": contents,
        "generationConfig": {"temperature": 0.4},
    }

    return await _generate_with_fallback(payload)
