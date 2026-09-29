import os

import models
from database import engine
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.auth import router as auth_router
from routers.recon import router as recon_router
from routers.tasks import router as tasks_router

load_dotenv()

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TOP API",
    version="1.0.0",
)

# cors
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

app.include_router(auth_router)
app.include_router(tasks_router)
app.include_router(recon_router)


@app.get("/api/health", tags=["system"])
def health_check():
    return {"status": "operational", "system": "TOP-C4ISR"}
