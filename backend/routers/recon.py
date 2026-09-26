from io import BytesIO

from fastapi import APIRouter, UploadFile
from PIL import Image
from schemas import ReconResponse
from ultralytics import YOLO

router = APIRouter(prefix="/api/ai", tags=["recon"])
model = YOLO("yolov8n.pt")


@router.post("/detect", response_model=ReconResponse)
async def analyze(file: UploadFile, confidence: float = 0.25):
    data = await file.read()
    pil_img = Image.open(BytesIO(data)).convert("RGB")
    results = model.predict(source=pil_img, conf=confidence)
    width, height = pil_img.size

    detections = []
    for box in results[0].boxes:
        x1, y1, x2, y2 = box.xyxy[0].tolist()
        detections.append(
            {
                "label": model.names[int(box.cls[0])],
                "confidence": round(float(box.conf[0]), 2),
                "normalized_box": [
                    round(x1 / width, 4),
                    round(y1 / height, 4),
                    round(x2 / width, 4),
                    round(y2 / height, 4),
                ],
                "class_id": int(box.cls[0]),
            }
        )

    return {
        "image_size": {"width": width, "height": height},
        "count": len(detections),
        "detections": detections,
    }
