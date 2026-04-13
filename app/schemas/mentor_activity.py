from __future__ import annotations

import uuid

from pydantic import BaseModel


class MentorActivityCreate(BaseModel):
    mentor_id: uuid.UUID
    team_id: uuid.UUID
    project_id: uuid.UUID | None = None
    action_type: str
    duration_minutes: int
    complexity_weight: float = 1.0


class MentorActivityOut(BaseModel):
    id: uuid.UUID
    mentor_id: uuid.UUID
    team_id: uuid.UUID
    project_id: uuid.UUID | None
    action_type: str
    duration_minutes: int
    complexity_weight: float

