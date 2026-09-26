import os
from datetime import datetime, timedelta
from io import BytesIO
from typing import Annotated

import bcrypt
import jwt
import models
from database import engine, get_db
from dotenv import load_dotenv
from fastapi import (
    Depends,
    FastAPI,
    Header,
    HTTPException,
    UploadFile,
    status,
)
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from ultralytics import YOLO

load_dotenv()

app = FastAPI()
models.Base.metadata.create_all(bind=engine)
SECRET_KEY = os.environ.get("SECRET_KEY", "tactical_default_secret_key_2026")
DbSession = Annotated[Session, Depends(get_db)]
model = YOLO("yolov8n.pt")
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)


class TaskModel(BaseModel):
    title: str = Field(min_length=3, max_length=100)
    priority: str
    description: str | None = None
    latitude: float
    longitude: float


class UserModel(BaseModel):
    user_name: str
    password: str


class PartialTaskModel(BaseModel):
    title: str | None = None
    description: str | None = None
    priority: str | None = None
    status: str | None = None
    latitude: float | None = None
    longitude: float | None = None


def verify_token(authorization: Annotated[str | None, Header()] = None):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No token provided")

    token = authorization.split(" ")[1]
    return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])


@app.get("/api/tasks")
def get_tasks(db: DbSession, user: Annotated[dict, Depends(verify_token)]):
    return db.query(models.Task).all()


@app.delete("/api/tasks/{task_id}")
def delete_task(
    task_id: int, user: Annotated[dict, Depends(verify_token)], db: DbSession
):
    task = db.get(models.Task, task_id)
    if not task:
        raise HTTPException(404, "Task not found")
    db.delete(task)
    db.commit()
    return {"message": "Task successfully deleted", "task": task_id}


@app.patch("/api/tasks/{task_id}")
def patch_tasks(
    task_id: int,
    task_data: PartialTaskModel,
    user: Annotated[dict, Depends(verify_token)],
    db: DbSession,
):
    task = db.get(models.Task, task_id)
    update_data = task_data.model_dump(exclude_unset=True)
    if not task:
        raise HTTPException(404, "Task not found")
    for key, value in update_data.items():
        setattr(task, key, value)

    db.commit()
    db.refresh(task)
    return task


@app.post("/api/tasks")
def create_task(
    task: TaskModel,
    user: Annotated[dict, Depends(verify_token)],
    db: DbSession,
):
    new_task = models.Task(
        title=task.title,
        priority=task.priority,
        latitude=task.latitude,
        longitude=task.longitude,
        user_id=user["id"],
        description=task.description,
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return {"status": "success", "data": new_task}


@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserModel, db: DbSession):
    user = (
        db.query(models.User)
        .filter(models.User.user_name == user_data.user_name)
        .first()
    )
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this name is already registered",
        )
    salt = bcrypt.gensalt()
    hashed_bytes = bcrypt.hashpw(user_data.password.encode("utf-8"), salt)
    hashed_str = hashed_bytes.decode("utf-8")

    new_user = models.User(user_name=user_data.user_name, password=hashed_str)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User successfully registered", "user": new_user}


@app.post("/api/auth/login")
def login_user(user_data: UserModel, db: DbSession):
    user = (
        db.query(models.User)
        .filter(models.User.user_name == user_data.user_name)
        .first()
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid credentials"
        )

    is_valid = bcrypt.checkpw(
        user_data.password.encode("utf-8"), user.password.encode("utf-8")
    )
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid credentials"
        )
    token = jwt.encode(
        {
            "id": user.id,
            "user_name": user.user_name,
            "exp": datetime.utcnow() + timedelta(hours=24),
        },
        SECRET_KEY,
        algorithm="HS256",
    )
    return {"message": "User successfully login", "token": token}


@app.post("/api/ai/detect")
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
