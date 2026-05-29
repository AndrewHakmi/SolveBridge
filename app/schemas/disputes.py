from __future__ import annotations

import uuid
from typing import Annotated

from pydantic import BaseModel, Field


class DisputeCreate(BaseModel):
    opened_by_id: uuid.UUID
    reason: Annotated[str, Field(min_length=1, max_length=2000)]
    sla_minutes: Annotated[int, Field(ge=60, le=10_080)] = 48 * 60  # 1h..7d


class DisputeOut(BaseModel):
    id: uuid.UUID
    task_id: uuid.UUID
    opened_by_id: uuid.UUID
    reason: str
    status: str
    sla_deadline: str
