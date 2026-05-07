from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from app.api.deps import SessionDep
from app.models.team import Team
from app.schemas.teams import TeamCreate, TeamOut


router = APIRouter()


def _to_out(team: Team) -> TeamOut:
    return TeamOut(id=team.id, name=team.name)


@router.get("", response_model=list[TeamOut])
async def list_teams(session: SessionDep):
    rows = (await session.execute(select(Team).order_by(Team.created_at.desc()))).scalars().all()
    return [_to_out(t) for t in rows]


@router.post("", response_model=TeamOut)
async def create_team(payload: TeamCreate, session: SessionDep):
    team = Team(name=payload.name)
    session.add(team)
    await session.commit()
    await session.refresh(team)
    return _to_out(team)


@router.get("/{team_id}", response_model=TeamOut)
async def get_team(team_id: uuid.UUID, session: SessionDep):
    team = (await session.execute(select(Team).where(Team.id == team_id))).scalar_one_or_none()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return _to_out(team)
