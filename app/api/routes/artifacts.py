from __future__ import annotations

import uuid
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import select

from app.api.deps import SessionDep
from app.models.artifact import Artifact, ArtifactType
from app.schemas.artifacts import ArtifactCreate, ArtifactOut, ArtifactUpdate


router = APIRouter()


def _to_out(artifact: Artifact) -> ArtifactOut:
    return ArtifactOut(
        id=artifact.id,
        project_id=artifact.project_id,
        owner_team_id=artifact.owner_team_id,
        type_id=artifact.type_id,
        content_hash=artifact.content_hash,
        reusability_index=artifact.reusability_index,
        mentorship_seal=artifact.mentorship_seal,
        metadata=artifact.metadata_json,
        git_url=artifact.git_url,
    )


@router.get("", response_model=list[ArtifactOut])
async def list_artifacts(
    session: SessionDep,
    project_id: Optional[uuid.UUID] = Query(default=None),
):
    stmt = select(Artifact).order_by(Artifact.created_at.desc())
    if project_id is not None:
        stmt = stmt.where(Artifact.project_id == project_id)
    rows = (await session.execute(stmt)).scalars().all()
    return [_to_out(a) for a in rows]


@router.post("", response_model=ArtifactOut)
async def create_artifact(payload: ArtifactCreate, session: SessionDep):
    type_row = (
        await session.execute(select(ArtifactType).where(ArtifactType.code == payload.type_code))
    ).scalar_one_or_none()
    if not type_row:
        raise HTTPException(status_code=400, detail="Unknown artifact type")

    artifact = Artifact(
        project_id=payload.project_id,
        owner_team_id=payload.owner_team_id,
        type_id=type_row.id,
        content_hash=payload.content_hash,
        reusability_index=payload.reusability_index,
        metadata_json=payload.metadata,
        git_url=payload.git_url,
    )
    session.add(artifact)
    await session.commit()
    await session.refresh(artifact)
    return _to_out(artifact)


@router.get("/{artifact_id}", response_model=ArtifactOut)
async def get_artifact(artifact_id: uuid.UUID, session: SessionDep):
    artifact = (await session.execute(select(Artifact).where(Artifact.id == artifact_id))).scalar_one_or_none()
    if not artifact:
        raise HTTPException(status_code=404, detail="Artifact not found")
    return _to_out(artifact)


@router.patch("/{artifact_id}", response_model=ArtifactOut)
async def update_artifact(artifact_id: uuid.UUID, payload: ArtifactUpdate, session: SessionDep):
    artifact = (await session.execute(select(Artifact).where(Artifact.id == artifact_id))).scalar_one_or_none()
    if not artifact:
        raise HTTPException(status_code=404, detail="Artifact not found")

    if payload.reusability_index is not None:
        artifact.reusability_index = payload.reusability_index
    if payload.git_url is not None:
        artifact.git_url = payload.git_url
    if payload.metadata is not None:
        artifact.metadata_json = payload.metadata
    if payload.mentorship_seal is not None:
        artifact.mentorship_seal = payload.mentorship_seal

    await session.commit()
    await session.refresh(artifact)
    return _to_out(artifact)

