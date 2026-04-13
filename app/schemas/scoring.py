from __future__ import annotations

import uuid

from pydantic import BaseModel


class ProjectScoresIn(BaseModel):
    project_id: uuid.UUID
    mentor_score: float | None = None
    client_score: float | None = None
    peer_score: float | None = None
    artifact_score: float | None = None


class ProjectScoresOut(BaseModel):
    project_id: uuid.UUID
    success_rate: float | None

