from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class TaskModel(BaseModel):
    title: str = Field(min_length=3, max_length=100)
    priority: Literal["low", "medium", "high", "critical"] = "medium"
    description: str | None = None
    latitude: float | None = None
    longitude: float | None = None
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
    # TODO: role system


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_name: str
    role: str | None = None


class DetectionItem(BaseModel):
    label: str
    confidence: float
    normalized_box: list[float]
    class_id: int = 0


class ReconResponse(BaseModel):
    image_size: dict[str, int]
    count: int
    detections: list[DetectionItem]


class VisionAnalysisResponse(BaseModel):
    title: str
    priority: Literal["low", "medium", "high", "critical"]
    summary: str
    detected_features: list[str]
    recommendation: str
    has_exif_coords: bool = False
    latitude: float | None = None
    longitude: float | None = None
    model_used: str = "gemini-3.8-flash"
    detections: list[DetectionItem] = []
    image_size: dict[str, int] = {"width": 0, "height": 0}
