from __future__ import annotations

import uuid

from fastapi import APIRouter
from sqlalchemy import select

from app.api.deps import SessionDep
from app.models.rating import Rating
from app.schemas.ratings import RatingCreate, RatingOut


router = APIRouter()


@router.post("", response_model=RatingOut)
async def create_rating(payload: RatingCreate, session: SessionDep):
    row = Rating(
        task_id=payload.task_id,
        rater_id=payload.rater_id,
        ratee_id=payload.ratee_id,
        dimension=payload.dimension,
        score=payload.score,
        comment=payload.comment,
    )
    session.add(row)
    await session.commit()
    await session.refresh(row)
    return RatingOut(
        id=row.id,
        task_id=row.task_id,
        rater_id=row.rater_id,
        ratee_id=row.ratee_id,
        dimension=row.dimension,
        score=row.score,
        comment=row.comment,
        created_at=row.created_at.isoformat(),
    )


@router.get("", response_model=list[RatingOut])
async def list_ratings(session: SessionDep, ratee_id: uuid.UUID | None = None, task_id: uuid.UUID | None = None):
    stmt = select(Rating).order_by(Rating.created_at.desc())
    if ratee_id:
        stmt = stmt.where(Rating.ratee_id == ratee_id)
    if task_id:
        stmt = stmt.where(Rating.task_id == task_id)
    rows = (await session.execute(stmt)).scalars().all()
    return [
        RatingOut(
            id=r.id,
            task_id=r.task_id,
            rater_id=r.rater_id,
            ratee_id=r.ratee_id,
            dimension=r.dimension,
            score=r.score,
            comment=r.comment,
            created_at=r.created_at.isoformat(),
        )
        for r in rows
    ]

