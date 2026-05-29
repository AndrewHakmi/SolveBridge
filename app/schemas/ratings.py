from __future__ import annotations

import uuid
from typing import Annotated, Literal

from pydantic import BaseModel, Field

RatingDimension = Literal['quality', 'communication', 'timeliness', 'overall']


class RatingCreate(BaseModel):
    task_id: uuid.UUID
    rater_id: uuid.UUID
    ratee_id: uuid.UUID
    dimension: RatingDimension
    score: Annotated[float, Field(ge=0.0, le=5.0)]
    comment: Annotated[str | None, Field(max_length=2000)] = None


class RatingOut(BaseModel):
    id: uuid.UUID
    task_id: uuid.UUID
    rater_id: uuid.UUID
    ratee_id: uuid.UUID
    dimension: str
    score: float
    comment: str | None
    created_at: str
