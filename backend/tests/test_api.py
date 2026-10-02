import os
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

import pytest
from dotenv import load_dotenv
from fastapi.testclient import TestClient

load_dotenv(backend_dir / ".env")

from main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert data["system"] == "TOP-C4ISR"


def test_get_tasks_unauthorized_rejected():
    response = client.get("/api/tasks")
    assert response.status_code == 401
    assert "detail" in response.json()


def test_auth_login_invalid_credentials():
    response = client.post(
        "/api/auth/login",
        json={"user_name": "NON_EXISTENT_CALLSIGN", "password": "wrong_password"},
    )
    assert response.status_code == 400
    assert "Invalid callsign" in response.json()["detail"]


def test_auth_login_and_task_lifecycle():
    login_res = client.post(
        "/api/auth/login",
        json={"user_name": "GHOST-7", "password": "tactical_pass"},
    )
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "token" in login_data
    token = login_data["token"]

    headers = {"Authorization": f"Bearer {token}"}
    tasks_res = client.get("/api/tasks", headers=headers)
    assert tasks_res.status_code == 200
    tasks = tasks_res.json()
    assert isinstance(tasks, list)
    assert len(tasks) >= 1
    first_task = tasks[0]
    assert "latitude" in first_task
    assert "longitude" in first_task
    assert "priority" in first_task


def test_new_operator_task_isolation():
    import uuid

    random_callsign = f"OP-{uuid.uuid4().hex[:6].upper()}"
    reg_res = client.post(
        "/api/auth/register",
        json={"user_name": random_callsign, "password": "secure_pass_123"},
    )
    assert reg_res.status_code == 201

    login_res = client.post(
        "/api/auth/login",
        json={"user_name": random_callsign, "password": "secure_pass_123"},
    )
    assert login_res.status_code == 200
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/tasks", headers=headers)
    assert res.status_code == 200
    assert len(res.json()) == 0


def test_recon_detect_endpoint():
    import io

    from PIL import Image

    img = Image.new("RGB", (100, 100), color="blue")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    res = client.post("/api/ai/detect", files={"file": ("test.jpg", buf, "image/jpeg")})
    assert res.status_code in (200, 502, 503)
    if res.status_code == 200:
        data = res.json()
        assert "detections" in data
        assert "count" in data
        assert "image_size" in data


def test_create_task_without_coordinates():
    login_res = client.post(
        "/api/auth/login",
        json={"user_name": "GHOST-7", "password": "tactical_pass"},
    )
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    create_res = client.post(
        "/api/tasks",
        headers=headers,
        json={
            "title": "Unlocated Recon Target",
            "description": "Visual detection from aerial feed without GPS",
            "priority": "critical",
            "status": "pending",
            "latitude": None,
            "longitude": None,
        },
    )
    assert create_res.status_code == 201
    created = create_res.json()
    task_data = created["data"]
    assert task_data["title"] == "Unlocated Recon Target"
    assert task_data["latitude"] is None
    assert task_data["longitude"] is None
    assert task_data["priority"] == "critical"


def test_sitrep_generate_prompt_construction():
    from routers.sitrep import (
        SitrepRequest,
        TaskItem,
        build_system_prompt,
        build_user_prompt,
    )

    req = SitrepRequest(
        operator="GHOST-7",
        tasks=[
            TaskItem(
                title="Command Bunker",
                priority="critical",
                status="in_progress",
                latitude=48.12,
                longitude=37.34,
            ),
            TaskItem(
                title="Unknown Target",
                priority="high",
                status="pending",
                latitude=None,
                longitude=None,
            ),
        ],
        lang="en",
    )
    system_prompt = build_system_prompt(req.lang)
    assert "Senior Tactical Operations Staff Officer" in system_prompt
    assert "English" in system_prompt

    user_prompt = build_user_prompt(req)
    assert "GHOST-7" in user_prompt
    assert "Command Bunker" in user_prompt
    assert "Unknown Target" in user_prompt
    assert "unassigned" in user_prompt
    assert "critical" in user_prompt
