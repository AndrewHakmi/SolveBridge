from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import SessionDep
from app.models.project import Project
from app.schemas.projects import ProjectCreate, ProjectOut


router = APIRouter()


def _to_out(project: Project) -> ProjectOut:
    return ProjectOut(
        id=project.id,
        title=project.title,
        owner_team_id=project.owner_team_id,
        client_id=project.client_id,
        status=project.status,
        mentor_score=project.mentor_score,
        client_score=project.client_score,
        peer_score=project.peer_score,
        artifact_score=project.artifact_score,
        success_rate=project.success_rate,
    )


@router.get("", response_model=list[ProjectOut])
async def list_projects(session: SessionDep):
    rows = (await session.execute(select(Project).order_by(Project.created_at.desc()))).scalars().all()
    return [_to_out(p) for p in rows]


@router.post("", response_model=ProjectOut)
async def create_project(payload: ProjectCreate, session: SessionDep):
    project = Project(title=payload.title, owner_team_id=payload.owner_team_id, client_id=payload.client_id)
    session.add(project)
    await session.commit()
    await session.refresh(project)
    return _to_out(project)


@router.get("/{project_id}", response_model=ProjectOut)
async def get_project(project_id: uuid.UUID, session: SessionDep):
    project = (await session.execute(select(Project).where(Project.id == project_id))).scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return _to_out(project)

