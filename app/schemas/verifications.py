from __future__ import annotations

import uuid

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

