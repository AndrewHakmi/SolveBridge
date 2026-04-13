from __future__ import annotations

import uuid

from pydantic import Field
from pydantic import BaseModel


class ArtifactCreate(BaseModel):
    project_id: uuid.UUID
    owner_team_id: uuid.UUID
    type_code: str
    content_hash: str
    reusability_index: float = 0.0
    metadata: dict = Field(default_factory=dict)
    git_url: str | None = None


class ArtifactOut(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    owner_team_id: uuid.UUID
    type_id: int
    content_hash: str
    reusability_index: float
    mentorship_seal: bool
    metadata: dict
    git_url: str | None

