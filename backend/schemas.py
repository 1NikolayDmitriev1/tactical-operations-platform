from typing import Literal

from pydantic import BaseModel, Field


class TaskModel(BaseModel):
    title: str = Field(min_length=3, max_length=100)
    priority: Literal["low", "medium", "high", "critical"] = "medium"
    description: str | None = None
    latitude: float
    longitude: float
    assigned_to: int | None = None


class PartialTaskModel(BaseModel):
    title: str | None = None
    description: str | None = None
    priority: Literal["low", "medium", "high", "critical"] | None = None
    status: Literal["pending", "in_progress", "completed", "cancelled"] | None = None
    latitude: float | None = None
    longitude: float | None = None
    assigned_to: int | None = None


class UserModel(BaseModel):
    user_name: str = Field(min_length=2, max_length=50)
    password: str = Field(min_length=4)
    role: Literal["commander", "operator"] = "operator"


class UserResponse(BaseModel):
    id: int
    user_name: str
    role: str

    class Config:
        from_attributes = True


class DetectionItem(BaseModel):
    label: str
    confidence: float
    normalized_box: list[float]
    class_id: int


class ReconResponse(BaseModel):
    image_size: dict[str, int]
    count: int
    detections: list[DetectionItem]
