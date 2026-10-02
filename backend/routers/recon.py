from io import BytesIO

from fastapi import APIRouter, Query, UploadFile
from PIL import ExifTags, Image
from schemas import DetectionItem, ReconResponse, VisionAnalysisResponse
from services.gemini import call_gemini_vision

router = APIRouter(prefix="/api/ai", tags=["recon"])


def extract_gps(img: Image.Image) -> tuple[float, float] | None:
    try:
        exif = img._getexif()
        if not exif:
            return None
        gps_info = {}
        for tag, val in exif.items():
            name = ExifTags.TAGS.get(tag, tag)
            if name == "GPSInfo":
                for sub_tag in val:
                    sub_name = ExifTags.GPSTAGS.get(sub_tag, sub_tag)
                    gps_info[sub_name] = val[sub_tag]
        if "GPSLatitude" not in gps_info or "GPSLongitude" not in gps_info:
            return None

        def _to_deg(v):
            return float(v[0]) + float(v[1]) / 60.0 + float(v[2]) / 3600.0

        lat = _to_deg(gps_info["GPSLatitude"])
        if gps_info.get("GPSLatitudeRef") == "S":
            lat = -lat
        lng = _to_deg(gps_info["GPSLongitude"])
        if gps_info.get("GPSLongitudeRef") == "W":
            lng = -lng
        return round(lat, 6), round(lng, 6)
    except Exception:
        return None


@router.post("/vision-analyze", response_model=VisionAnalysisResponse)
async def vision_analyze(
    file: UploadFile,
    lang: str = Query("en", description="Language of response ('en' or 'ua')"),
):
    data = await file.read()
    pil_img = Image.open(BytesIO(data))
    orig_w, orig_h = pil_img.size

    coords = extract_gps(pil_img)

    # downscale if needed
    rgb_img = pil_img.convert("RGB")
    if max(rgb_img.size) > 1920:
        rgb_img.thumbnail((1920, 1920), Image.Resampling.LANCZOS)
    buf = BytesIO()
    rgb_img.save(buf, format="JPEG", quality=85)
    jpeg_bytes = buf.getvalue()

    target_language = "Ukrainian" if lang == "ua" else "English"
    prompt = f"""You are a senior tactical aerial reconnaissance intelligence analyst (C4ISR).
Analyze this aerial/satellite recon photograph.
1. Identify the military target complex and overall assessment.
2. Detect all military infrastructure, buildings, warehouses, hangars, and vehicles, with 2D bounding boxes.

CRITICAL REQUIREMENT: Output MUST be written strictly in {target_language}.
All text fields in the returned JSON (title, summary, detected_features, recommendation, label) MUST be in {target_language}.

Respond EXCLUSIVELY with a valid JSON object matching this schema:
{{
  "title": "Short tactical target title (e.g. Military Depot Complex / Ammo Storage)",
  "priority": "critical",
  "summary": "Concise tactical assessment of the identified facility (2-3 sentences)",
  "detected_features": ["feature 1", "feature 2"],
  "recommendation": "Tactical strike recommendation for commanders",
  "detected_objects": [
    {{
      "box_2d": [ymin, xmin, ymax, xmax],
      "label": "Name of object",
      "confidence": 0.95
    }}
  ]
}}
Note: "box_2d" coordinates must be normalized integers from 0 to 1000 ([ymin, xmin, ymax, xmax]).
Note: "priority" must be strictly one of: "low", "medium", "high", "critical"."""

    parsed_result, model_used = await call_gemini_vision(jpeg_bytes, prompt)

    priority = parsed_result.get("priority", "high").lower()
    if priority not in ("low", "medium", "high", "critical"):
        priority = "high"

    detections: list[DetectionItem] = []
    for idx, obj in enumerate(parsed_result.get("detected_objects", [])):
        raw_box = obj.get("box_2d")
        if isinstance(raw_box, (list, tuple)) and len(raw_box) == 4:
            ymin, xmin, ymax, xmax = raw_box
            x1 = max(0.0, min(1.0, round(float(xmin) / 1000.0, 4)))
            y1 = max(0.0, min(1.0, round(float(ymin) / 1000.0, 4)))
            x2 = max(0.0, min(1.0, round(float(xmax) / 1000.0, 4)))
            y2 = max(0.0, min(1.0, round(float(ymax) / 1000.0, 4)))
            conf = float(obj.get("confidence", 0.9))
            lbl = str(obj.get("label", f"Target #{idx + 1}")).strip()
            detections.append(
                DetectionItem(
                    label=lbl,
                    confidence=conf,
                    normalized_box=[x1, y1, x2, y2],
                    class_id=idx + 1,
                )
            )

    return VisionAnalysisResponse(
        title=parsed_result.get("title", "Military Facility"),
        priority=priority,
        summary=parsed_result.get("summary", ""),
        detected_features=parsed_result.get("detected_features", []),
        recommendation=parsed_result.get("recommendation", ""),
        has_exif_coords=coords is not None,
        latitude=coords[0] if coords else None,
        longitude=coords[1] if coords else None,
        model_used=model_used,
        detections=detections,
        image_size={"width": orig_w, "height": orig_h},
    )


@router.post("/detect", response_model=ReconResponse)
async def analyze_alias(file: UploadFile, confidence: float = 0.25):
    res = await vision_analyze(file=file, lang="en")
    filtered = [d for d in res.detections if d.confidence >= confidence]
    return ReconResponse(
        image_size=res.image_size,
        count=len(filtered),
        detections=filtered,
    )
