from __future__ import annotations

import uuid
from typing import Annotated, Literal

from pydantic import BaseModel, Field

TaskStatus = Literal['open', 'assigned', 'completed', 'disputed', 'canceled']
TaskCategory = Literal['general', 'design', 'development', 'research', 'marketing', 'analytics', 'other']


class TaskCreate(BaseModel):
    organization_id: uuid.UUID
    title: Annotated[str, Field(min_length=1, max_length=300)]
    description: Annotated[str, Field(min_length=1, max_length=10_000)]
    category: TaskCategory = 'general'
    budget_amount_rub: Annotated[int | None, Field(ge=0, le=100_000_000)] = None
    required_skills: list[dict] = Field(default_factory=list)


class TaskOut(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    title: str
    description: str
    category: str
    budget_amount_rub: int | None
    status: str
    required_skills: list


class TaskApplicationCreate(BaseModel):
    applicant_id: uuid.UUID
    proposed_amount_rub: Annotated[int | None, Field(ge=0, le=100_000_000)] = None
    message: Annotated[str | None, Field(max_length=2000)] = None


class TaskApplicationOut(BaseModel):
    id: uuid.UUID
    task_id: uuid.UUID
    applicant_id: uuid.UUID
    proposed_amount_rub: int | None
    message: str | None
    status: str


class TaskAssignIn(BaseModel):
    executor_id: uuid.UUID
    mentor_id: uuid.UUID | None = None


class TaskAssignmentOut(BaseModel):
    id: uuid.UUID
    task_id: uuid.UUID
    executor_id: uuid.UUID
    mentor_id: uuid.UUID | None
    status: str


class TaskStatusUpdate(BaseModel):
    status: TaskStatus
