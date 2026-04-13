from __future__ import annotations

from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from app.api.deps import SessionDep
from app.models.project import Project
from app.schemas.scoring import ProjectScoresIn, ProjectScoresOut
from app.services.scoring import compute_success_rate


router = APIRouter()


@router.post("/projects", response_model=ProjectScoresOut)
async def set_project_scores(payload: ProjectScoresIn, session: SessionDep):
    project = (await session.execute(select(Project).where(Project.id == payload.project_id))).scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if payload.mentor_score is not None:
        project.mentor_score = payload.mentor_score
    if payload.client_score is not None:
        project.client_score = payload.client_score
    if payload.peer_score is not None:
        project.peer_score = payload.peer_score
    if payload.artifact_score is not None:
        project.artifact_score = payload.artifact_score

    project.success_rate = compute_success_rate(
        project.mentor_score,
        project.client_score,
        project.peer_score,
        project.artifact_score,
    )

    await session.commit()
    return ProjectScoresOut(project_id=project.id, success_rate=project.success_rate)

