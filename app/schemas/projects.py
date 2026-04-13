from __future__ import annotations

import uuid

from pydantic import BaseModel


class ProjectCreate(BaseModel):
    title: str
    owner_team_id: uuid.UUID | None = None
    client_id: uuid.UUID | None = None


class ProjectOut(BaseModel):
    id: uuid.UUID
    title: str
    owner_team_id: uuid.UUID | None
    client_id: uuid.UUID | None
    status: str
    mentor_score: float | None
    client_score: float | None
    peer_score: float | None
    artifact_score: float | None
    success_rate: float | None

