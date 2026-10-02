from datetime import datetime, timezone

from fastapi import APIRouter
from pydantic import BaseModel
from services.gemini import call_gemini_text

router = APIRouter(prefix="/api/sitrep", tags=["sitrep"])


class TaskItem(BaseModel):
    title: str = ""
    description: str | None = ""
    priority: str = "medium"
    status: str = "pending"
    latitude: float | None = None
    longitude: float | None = None

    model_config = {"extra": "ignore"}


class SitrepRequest(BaseModel):
    operator: str = "OPERATOR"
    tasks: list[TaskItem] = []
    lang: str = "ua"


class SitrepResponse(BaseModel):
    report: str
    model: str


def build_system_prompt(lang: str) -> str:
    target_language = "Ukrainian" if lang == "ua" else "English"
    return f"""You are a Senior Tactical Operations Staff Officer (C4ISR).
Analyze the reconnaissance data and plotted targets, then generate an official military Situation Report (SITREP) conforming to NATO / AFU operational standards.

CRITICAL REQUIREMENT: The entire generated report MUST be written strictly in {target_language}.

Format as clean Markdown:
- Use ## for section headings (e.g. ## 1. HEADER).
- Wrap coordinates in backticks (e.g. `48.1234, 37.5678`).
- Use **bold** for key assets, priorities, and statuses.

Structure:
1. HEADER: Classification, DTG timestamp, Operator Callsign, Sector.
2. SITUATION ASSESSMENT: Enemy force concentration, detected armor, air defense, or logistics assets.
3. FIRES & KILL CHAIN PRIORITIZATION: Recommended engagement sequence with tactical reasoning.
4. TARGET ROSTER: Index, target title, grid coordinates, priority, status.
5. COMMAND DIRECTIVES: Actionable instructions for UAV, artillery, and electronic warfare units.

Keep it concise, strictly military terminology, no introductory fluff."""


def build_user_prompt(req: SitrepRequest) -> str:
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    target_language = "Ukrainian" if req.lang == "ua" else "English"

    targets_desc = []
    for i, t in enumerate(req.tasks, 1):
        coord_str = (
            f"`{t.latitude:.4f}, {t.longitude:.4f}`"
            if t.latitude is not None and t.longitude is not None
            else "unassigned"
        )
        desc = t.description or "none"
        targets_desc.append(
            f"- Target #{i}: {t.title or 'Target'} (priority: {t.priority}, status: {t.status}, coordinates: {coord_str}). Description: {desc}"
        )

    targets_text = (
        "\n".join(targets_desc) if targets_desc else "No targets detected on map."
    )
    return (
        f"Operator callsign: {req.operator}\n"
        f"Current timestamp: {now_str}\n"
        f"Active reconnaissance targets plotted on map:\n{targets_text}\n\n"
        f"Generate the official military SITREP dispatch conforming to instructions. Language: {target_language}."
    )


@router.post("/generate", response_model=SitrepResponse)
async def generate_sitrep(req: SitrepRequest):
    user_prompt = build_user_prompt(req)
    system_prompt = build_system_prompt(req.lang)

    report, model_name = await call_gemini_text(
        prompt=user_prompt,
        system_prompt=system_prompt,
    )

    return SitrepResponse(report=report, model=model_name)
