import os
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/sitrep", tags=["sitrep"])

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "qwen/qwen3.8-27b"


class TaskItem(BaseModel):
    title: str = ""
    description: str = ""
    priority: str = "medium"
    status: str = "pending"
    latitude: float = 0.0
    longitude: float = 0.0


class SitrepRequest(BaseModel):
    operator: str = "OPERATOR"
    tasks: list[TaskItem] = []
    lang: str = "ua"


class SitrepResponse(BaseModel):
    report: str
    model: str


def build_system_prompt(lang: str) -> str:
    if lang == "ua":
        return (
            "Ти — старший офіцер оперативного відділу штабу тактичної групи (C4ISR).\n"
            "Твоє завдання — проаналізувати отримані від оператора розвіддані та цілі на карті "
            "і скласти офіційне бойове оперативне зведення (SITREP) за стандартами ЗСУ та NATO STANAG.\n\n"
            "Структура зведення:\n"
            "1. ШАПКА: Гриф таємності, DTG (дата/час UTC), позивний чергового оператора, сектор дій.\n"
            "2. ОЦІНКА ОПЕРАТИВНОЇ ОБСТАНОВКИ: концентрація сил противника, характер дій, виявлена техніка.\n"
            "3. ПРІОРИТЕТИ ВОГНЕВОГО УРАЖЕННЯ (KILL CHAIN): послідовність нейтралізації цілей з тактичним обґрунтуванням.\n"
            "4. ДЕТАЛЬНИЙ ПЕРЕЛІК ЦІЛЕЙ: номер, клас цілі, координати, статус.\n"
            "5. РОЗПОРЯДЖЕННЯ ЧЕРГОВИМ СИЛАМ: вказівки артилерії, підрозділам БПЛА та РЕБ.\n\n"
            "Пиши лаконічно, строго військовою мовою, без вступних привітань та загальних слів."
        )
    return (
        "You are a Senior Tactical Operations Staff Officer (C4ISR).\n"
        "Analyze the reconnaissance data and plotted targets, then generate an official military "
        "Situation Report (SITREP) conforming to NATO operational standards.\n\n"
        "Structure:\n"
        "1. HEADER: Classification, DTG timestamp, Operator Callsign, Sector.\n"
        "2. SITUATION ASSESSMENT: Enemy force concentration, detected armor, air defense, or EW assets.\n"
        "3. FIRES & KILL CHAIN PRIORITIZATION: Recommended engagement sequence with tactical reasoning.\n"
        "4. TARGET ROSTER: Index, type, grid coordinates, status.\n"
        "5. COMMAND DIRECTIVES: Actionable instructions for UAV, artillery, and electronic warfare units.\n\n"
        "Keep it concise, strictly military terminology, no introductory fluff."
    )


def build_user_prompt(req: SitrepRequest) -> str:
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    if req.lang == "ua":
        targets_desc = [
            f"- Ціль #{i}: {t.title} (пріоритет: {t.priority}, статус: {t.status}, координати: {t.latitude:.4f}, {t.longitude:.4f}). Опис: {t.description or 'немає'}"
            for i, t in enumerate(req.tasks, 1)
        ]
        targets_text = (
            "\n".join(targets_desc) if targets_desc else "Цілей не зафіксовано."
        )
        return (
            f"Позивний оператора: {req.operator}\n"
            f"Поточний час: {now_str}\n"
            f"Виявлені розвідкою цілі на карті:\n{targets_text}\n\n"
            "Сформуй бойове донесення SITREP згідно з інструкцією."
        )

    targets_desc = [
        f"- Target #{i}: {t.title} (priority: {t.priority}, status: {t.status}, coordinates: {t.latitude:.4f}, {t.longitude:.4f}). Description: {t.description or 'none'}"
        for i, t in enumerate(req.tasks, 1)
    ]
    targets_text = "\n".join(targets_desc) if targets_desc else "No targets detected."
    return (
        f"Operator callsign: {req.operator}\n"
        f"Current time: {now_str}\n"
        f"Reconnaissance targets plotted on map:\n{targets_text}\n\n"
        "Generate an official military SITREP dispatch conforming to instructions."
    )


@router.post("/generate", response_model=SitrepResponse)
async def generate_sitrep(req: SitrepRequest):
    api_key = os.environ.get("GROQ_API_KEY", "").strip()
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")

    user_prompt = build_user_prompt(req)

    try:
        async with httpx.AsyncClient(timeout=25.0) as client:
            resp = await client.post(
                GROQ_URL,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": GROQ_MODEL,
                    "messages": [
                        {"role": "system", "content": build_system_prompt(req.lang)},
                        {"role": "user", "content": user_prompt},
                    ],
                    "temperature": 0.3,
                    "max_tokens": 1200,
                },
            )

        if resp.status_code != 200:
            raise HTTPException(
                status_code=502, detail=f"Groq API error: {resp.status_code}"
            )

        data = resp.json()
        content = data["choices"][0]["message"]["content"]
        return SitrepResponse(report=content, model=GROQ_MODEL)
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Failed to reach Groq: {exc}")
