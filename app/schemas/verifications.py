from __future__ import annotations

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class StudentVerificationCreate(BaseModel):
    student_id: uuid.UUID
    university_org_id: uuid.UUID
    document_ref: str | None = None


class StudentVerificationOut(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    university_org_id: uuid.UUID
    status: str
    document_ref: str | None
    created_at: datetime | None = None
    verified_at: datetime | None = None


class StudentVerificationReview(BaseModel):
    action: Literal["approve", "reject"]

