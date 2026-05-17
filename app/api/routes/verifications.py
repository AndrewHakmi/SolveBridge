from __future__ import annotations

import uuid

from fastapi import APIRouter
from sqlalchemy import select

from app.api.deps import SessionDep
from app.models.verification import StudentVerification
from app.schemas.verifications import StudentVerificationCreate, StudentVerificationOut


router = APIRouter()


@router.post("/students", response_model=StudentVerificationOut)
async def create_student_verification(payload: StudentVerificationCreate, session: SessionDep):
    row = StudentVerification(
        student_id=payload.student_id,
        university_org_id=payload.university_org_id,
        document_ref=payload.document_ref,
        status="pending",
    )
    session.add(row)
    await session.commit()
    await session.refresh(row)
    return StudentVerificationOut(
        id=row.id,
        student_id=row.student_id,
        university_org_id=row.university_org_id,
        status=row.status,
        document_ref=row.document_ref,
    )


@router.get("/students/{student_id}", response_model=list[StudentVerificationOut])
async def list_student_verifications(student_id: uuid.UUID, session: SessionDep):
    rows = (
        await session.execute(
            select(StudentVerification).where(StudentVerification.student_id == student_id).order_by(StudentVerification.created_at.desc())
        )
    ).scalars().all()
    return [
        StudentVerificationOut(
            id=r.id,
            student_id=r.student_id,
            university_org_id=r.university_org_id,
            status=r.status,
            document_ref=r.document_ref,
        )
        for r in rows
    ]

