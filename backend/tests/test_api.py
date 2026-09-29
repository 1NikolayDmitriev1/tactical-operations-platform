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
    """should return 401 without token"""
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
    # login
    login_res = client.post(
        "/api/auth/login",
        json={"user_name": "GHOST-7", "password": "tactical_pass"},
    )
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "token" in login_data
    token = login_data["token"]

    # fetch tasks with token
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
