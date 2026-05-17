from __future__ import annotations

import uuid

from pydantic import BaseModel


class RatingCreate(BaseModel):
    task_id: uuid.UUID
    rater_id: uuid.UUID
    ratee_id: uuid.UUID
    dimension: str
    score: float
    comment: str | None = None


class RatingOut(BaseModel):
    id: uuid.UUID
    task_id: uuid.UUID
    rater_id: uuid.UUID
    ratee_id: uuid.UUID
    dimension: str
    score: float
    comment: str | None
    created_at: str

