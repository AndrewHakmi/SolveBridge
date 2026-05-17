from __future__ import annotations

import uuid

from pydantic import BaseModel


class DisputeCreate(BaseModel):
    opened_by_id: uuid.UUID
    reason: str
    sla_minutes: int = 48 * 60


class DisputeOut(BaseModel):
    id: uuid.UUID
    task_id: uuid.UUID
    opened_by_id: uuid.UUID
    reason: str
    status: str
    sla_deadline: str

