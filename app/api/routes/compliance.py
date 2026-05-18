from __future__ import annotations

import datetime as dt
import uuid

from fastapi import APIRouter
from sqlalchemy import select

from app.api.deps import SessionDep
from app.models.compliance import ComplianceProfile
from app.schemas.compliance import ComplianceProfileOut, ComplianceProfileUpsert


router = APIRouter()


def _to_out(row: ComplianceProfile) -> ComplianceProfileOut:
    return ComplianceProfileOut(
        user_id=row.user_id,
        npd_status=row.npd_status,
        npd_verified_at=row.npd_verified_at.isoformat() if row.npd_verified_at else None,
        pdn_consent=row.pdn_consent,
        pdn_consent_at=row.pdn_consent_at.isoformat() if row.pdn_consent_at else None,
        metadata=row.metadata_json,
    )


@router.get("/profiles/{user_id}", response_model=ComplianceProfileOut | None)
async def get_profile(user_id: uuid.UUID, session: SessionDep):
    row = (await session.execute(select(ComplianceProfile).where(ComplianceProfile.user_id == user_id))).scalar_one_or_none()
    if not row:
        return None
    return _to_out(row)


@router.put("/profiles", response_model=ComplianceProfileOut)
async def upsert_profile(payload: ComplianceProfileUpsert, session: SessionDep):
    row = (await session.execute(select(ComplianceProfile).where(ComplianceProfile.user_id == payload.user_id))).scalar_one_or_none()
    now = dt.datetime.now(dt.timezone.utc)
    if not row:
        row = ComplianceProfile(
            user_id=payload.user_id,
            npd_status=payload.npd_status,
            pdn_consent=payload.pdn_consent,
            pdn_consent_at=now if payload.pdn_consent else None,
            metadata_json=payload.metadata,
            npd_verified_at=now if payload.npd_status == "verified" else None,
        )
        session.add(row)
        await session.commit()
        await session.refresh(row)
        return _to_out(row)

    row.metadata_json = payload.metadata

    if row.pdn_consent != payload.pdn_consent:
        row.pdn_consent = payload.pdn_consent
        row.pdn_consent_at = now if payload.pdn_consent else None

    if row.npd_status != payload.npd_status:
        row.npd_status = payload.npd_status
        row.npd_verified_at = now if payload.npd_status == "verified" else None

    await session.commit()
    await session.refresh(row)
    return _to_out(row)

