from __future__ import annotations

import uuid

from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    organization_id: uuid.UUID
    title: str
    description: str
    category: str = "general"
    budget_amount_rub: int | None = None
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
    proposed_amount_rub: int | None = None
    message: str | None = None


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
    status: str
