from __future__ import annotations

import uuid

from fastapi import APIRouter
from pydantic import BaseModel, Field
from sqlalchemy import select

from app.api.deps import SessionDep
from app.models.artifact import Artifact, ArtifactType
from app.models.project import Project
from app.services.hashing import sha256_hex


router = APIRouter()


class GitWebhookPayload(BaseModel):
    project_id: uuid.UUID
    owner_team_id: uuid.UUID
    repo_url: str
    commit_sha: str
    event_type: str = "push"
    metadata: dict = Field(default_factory=dict)


@router.post("/webhook")
async def ingest_git_webhook(payload: GitWebhookPayload, session: SessionDep):
    project = (await session.execute(select(Project).where(Project.id == payload.project_id))).scalar_one()
    type_row = (
        await session.execute(select(ArtifactType).where(ArtifactType.code == "code"))
    ).scalar_one()

    content_hash = sha256_hex(f"{payload.repo_url}:{payload.commit_sha}".encode("utf-8"))
    artifact = Artifact(
        project_id=payload.project_id,
        owner_team_id=payload.owner_team_id,
        type_id=type_row.id,
        content_hash=content_hash,
        reusability_index=float(payload.metadata.get("reusability_index", 0.0) or 0.0),
        metadata_json={
            **payload.metadata,
            "repo_url": payload.repo_url,
            "commit_sha": payload.commit_sha,
            "event_type": payload.event_type,
        },
        git_url=payload.repo_url,
    )
    session.add(artifact)

    if project.status == "created":
        project.status = "delivered"

    await session.commit()
    return {"artifact_id": str(artifact.id), "content_hash": artifact.content_hash}

