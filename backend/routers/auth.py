import os
from datetime import datetime, timedelta, timezone
from typing import Annotated

import bcrypt
import jwt
import models
from database import get_db
from fastapi import APIRouter, Depends, Header, HTTPException, status
from schemas import UserModel, UserResponse
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/auth", tags=["auth"])
SECRET_KEY = os.environ.get("SECRET_KEY", "tactical_default_secret_key_2026")
DbSession = Annotated[Session, Depends(get_db)]


def verify_token(authorization: Annotated[str | None, Header()] = None) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No authorization token provided",
        )
    token = authorization.split(" ")[1]
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid security token",
        )


# TODO: role system


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserModel, db: DbSession):
    existing = (
        db.query(models.User)
        .filter(models.User.user_name == user_data.user_name)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Callsign already taken",
        )

    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(user_data.password.encode("utf-8"), salt).decode("utf-8")

    new_user = models.User(
        user_name=user_data.user_name,
        password=hashed,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "ok",
        "user": UserResponse.model_validate(new_user),
    }


@router.post("/login")
def login_user(user_data: UserModel, db: DbSession):
    user = (
        db.query(models.User)
        .filter(models.User.user_name == user_data.user_name)
        .first()
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid callsign or security key",
        )

    if not bcrypt.checkpw(user_data.password.encode("utf-8"), user.password.encode("utf-8")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid callsign or security key",
        )

    token = jwt.encode(
        {
            "id": user.id,
            "user_name": user.user_name,
            "role": user.role,
            "exp": datetime.now(timezone.utc) + timedelta(hours=24),
        },
        SECRET_KEY,
        algorithm="HS256",
    )

    return {
        "message": "ok",
        "token": token,
        "user": UserResponse.model_validate(user),
    }


@router.get("/operators", response_model=list[UserResponse])
def get_operators(
    db: DbSession,
    user: Annotated[dict, Depends(verify_token)],
):
    return db.query(models.User).all()
