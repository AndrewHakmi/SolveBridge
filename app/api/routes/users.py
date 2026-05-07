from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from app.api.deps import SessionDep
from app.models.user import User
from app.schemas.users import UserCreate, UserOut


router = APIRouter()


def _to_out(user: User) -> UserOut:
    return UserOut(id=user.id, email=user.email, display_name=user.display_name)


@router.get("", response_model=list[UserOut])
async def list_users(session: SessionDep):
    rows = (await session.execute(select(User).order_by(User.created_at.desc()))).scalars().all()
    return [_to_out(u) for u in rows]


@router.post("", response_model=UserOut)
async def create_user(payload: UserCreate, session: SessionDep):
    existing = (await session.execute(select(User).where(User.email == payload.email))).scalar_one_or_none()
    if existing:
        return _to_out(existing)
    user = User(email=payload.email, display_name=payload.display_name)
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return _to_out(user)


@router.get("/{user_id}", response_model=UserOut)
async def get_user(user_id: uuid.UUID, session: SessionDep):
    user = (await session.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return _to_out(user)
