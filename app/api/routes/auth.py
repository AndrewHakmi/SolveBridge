from __future__ import annotations

from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from app.api.deps import SessionDep
from app.models.user import User
from app.schemas.users import AuthOut, LoginRequest, RegisterRequest
from app.services.hashing import hash_password, verify_password

router = APIRouter()


def _to_auth_out(user: User) -> AuthOut:
    return AuthOut(
        id=user.id,
        email=user.email,
        display_name=user.display_name,
        role=user.role,
    )


@router.post("/register", response_model=AuthOut)
async def register(payload: RegisterRequest, session: SessionDep):
    email = payload.email.strip().lower()
    existing = (
        await session.execute(select(User).where(User.email == email))
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="Этот email уже зарегистрирован")

    user = User(
        email=email,
        display_name=payload.display_name,
        password_hash=hash_password(payload.password),
        role=payload.role,
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return _to_auth_out(user)


@router.post("/login", response_model=AuthOut)
async def login(payload: LoginRequest, session: SessionDep):
    email = payload.email.strip().lower()
    user = (
        await session.execute(select(User).where(User.email == email))
    ).scalar_one_or_none()

    if not user or not user.password_hash:
        raise HTTPException(status_code=401, detail="Неверный email или пароль")

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Неверный email или пароль")

    return _to_auth_out(user)
