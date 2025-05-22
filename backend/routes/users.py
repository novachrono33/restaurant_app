from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv
from datetime import timedelta

from backend.schemas import UserCreate, UserRead, Token
from backend.crud import create_user, get_user_by_username
from backend.auth import (
    verify_password,
    create_access_token,
    get_db,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_active_user
)

load_dotenv()

HOSTESS_CODE = os.environ.get("HOSTESS_INVITE_CODE")
ADMIN_CODE   = os.environ.get("ADMIN_INVITE_CODE")

router = APIRouter()

@router.post("/users/", response_model=UserRead, tags=["users"])
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    if not user.is_admin:
        if not HOSTESS_CODE or user.invite_code != HOSTESS_CODE:
            raise HTTPException(status_code=400, detail="Неверный код приглашения для хостес")
    else:
        if not ADMIN_CODE or user.invite_code != ADMIN_CODE:
            raise HTTPException(status_code=400, detail="Неверный код приглашения для админа")

    if get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="Username already registered")

    return create_user(
        db,
        username=user.username,
        full_name=user.full_name,
        password=user.password,
        is_admin=user.is_admin
    )

@router.post("/token", response_model=Token, tags=["users"])
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = get_user_by_username(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(data={"sub": user.username}, expires_delta=expires)
    return {"access_token": token, "token_type": "bearer"}

@router.get("/users/me", response_model=UserRead, tags=["users"])
def read_users_me(current_user = Depends(get_current_active_user)):
    return current_user
