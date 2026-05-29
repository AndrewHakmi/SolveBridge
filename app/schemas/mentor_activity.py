from __future__ import annotations

import uuid
from typing import Annotated, Literal

from pydantic import BaseModel, Field

MentorActionType = Literal[
    'code_review', 'meeting', 'feedback', 'pair_programming', 'workshop', 'other'
]


class MentorActivityCreate(BaseModel):
    mentor_id: uuid.UUID
    team_id: uuid.UUID
    project_id: uuid.UUID | None = None
    action_type: MentorActionType
    duration_minutes: Annotated[int, Field(ge=1, le=480)]
    complexity_weight: Annotated[float, Field(ge=0.1, le=5.0)] = 1.0


class MentorActivityOut(BaseModel):
    id: uuid.UUID
    mentor_id: uuid.UUID
    team_id: uuid.UUID
    project_id: uuid.UUID | None
    action_type: str
    duration_minutes: int
    complexity_weight: float
