from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from app.api.deps import SessionDep
from app.models.verification import StudentVerification
from app.schemas.verifications import (
    StudentVerificationCreate,
    StudentVerificationOut,
    StudentVerificationReview,
)

router = APIRouter()


def _out(r: StudentVerification) -> StudentVerificationOut:
    return StudentVerificationOut(
        id=r.id,
        student_id=r.student_id,
        university_org_id=r.university_org_id,
        status=r.status,
        document_ref=r.document_ref,
        created_at=r.created_at,
        verified_at=r.verified_at,
    )


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
    return _out(row)


@router.get("/students/{student_id}", response_model=list[StudentVerificationOut])
async def list_student_verifications(student_id: uuid.UUID, session: SessionDep):
    rows = (
        await session.execute(
            select(StudentVerification)
            .where(StudentVerification.student_id == student_id)
            .order_by(StudentVerification.created_at.desc())
        )
    ).scalars().all()
    return [_out(r) for r in rows]


@router.get("/university/{org_id}", response_model=list[StudentVerificationOut])
async def list_university_verifications(org_id: uuid.UUID, session: SessionDep):
    """Return all verification requests sent to a given university."""
    rows = (
        await session.execute(
            select(StudentVerification)
            .where(StudentVerification.university_org_id == org_id)
            .order_by(StudentVerification.created_at.desc())
        )
    ).scalars().all()
    return [_out(r) for r in rows]


@router.patch("/{verification_id}/review", response_model=StudentVerificationOut)
async def review_verification(
    verification_id: uuid.UUID,
    payload: StudentVerificationReview,
    session: SessionDep,
):
    """University approves or rejects a student verification request."""
    row = await session.get(StudentVerification, verification_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Verification not found")
    if row.status != "pending":
        raise HTTPException(status_code=409, detail="Already reviewed")

    row.status = "approved" if payload.action == "approve" else "rejected"
    if payload.action == "approve":
        row.verified_at = datetime.now(timezone.utc)

    await session.commit()
    await session.refresh(row)
    return _out(row)
