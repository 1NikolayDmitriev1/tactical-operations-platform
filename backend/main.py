import os

from database import engine
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from routers.auth import router as auth_router
from routers.recon import router as recon_router
from routers.tasks import router as tasks_router

load_dotenv()

# Initialize Database Schema
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Tactical Operations Platform (TOP) API",
    description="Military C4ISR Situational Awareness Web API",
    version="1.0.0",
)

# CORS Configuration (Restricted to Frontend Origin)
allowed_origins = os.environ.get(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Modular Routers
app.include_router(auth_router)
app.include_router(tasks_router)
app.include_router(recon_router)


@app.get("/api/health", tags=["system"])
def health_check():
    return {"status": "operational", "system": "TOP-C4ISR"}
