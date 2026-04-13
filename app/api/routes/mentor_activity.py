from __future__ import annotations

import uuid

from fastapi import APIRouter
from sqlalchemy import select

from app.api.deps import SessionDep
from app.models.mentor_activity import MentorActivityLog
from app.schemas.mentor_activity import MentorActivityCreate, MentorActivityOut


router = APIRouter()


@router.post("", response_model=MentorActivityOut)
async def create_activity(payload: MentorActivityCreate, session: SessionDep):
    log = MentorActivityLog(
        mentor_id=payload.mentor_id,
        team_id=payload.team_id,
        project_id=payload.project_id,
        action_type=payload.action_type,
        duration_minutes=payload.duration_minutes,
        complexity_weight=payload.complexity_weight,
    )
    session.add(log)
    await session.commit()
    await session.refresh(log)
    return MentorActivityOut(
        id=log.id,
        mentor_id=log.mentor_id,
        team_id=log.team_id,
        project_id=log.project_id,
        action_type=log.action_type,
        duration_minutes=log.duration_minutes,
        complexity_weight=log.complexity_weight,
    )


@router.get("/mentor/{mentor_id}", response_model=list[MentorActivityOut])
async def list_by_mentor(mentor_id: uuid.UUID, session: SessionDep):
    rows = (await session.execute(select(MentorActivityLog).where(MentorActivityLog.mentor_id == mentor_id))).scalars().all()
    return [
        MentorActivityOut(
            id=r.id,
            mentor_id=r.mentor_id,
            team_id=r.team_id,
            project_id=r.project_id,
            action_type=r.action_type,
            duration_minutes=r.duration_minutes,
            complexity_weight=r.complexity_weight,
        )
        for r in rows
    ]

