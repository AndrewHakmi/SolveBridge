from __future__ import annotations

import uuid

from fastapi import APIRouter
from sqlalchemy import select

from app.api.deps import SessionDep
from app.models.subscription import CompanySubscription
from app.schemas.subscriptions import CompanySubscriptionCreate, CompanySubscriptionOut


router = APIRouter()


@router.post("", response_model=CompanySubscriptionOut)
async def create_subscription(payload: CompanySubscriptionCreate, session: SessionDep):
    sub = CompanySubscription(organization_id=payload.organization_id, plan_code=payload.plan_code, status="active")
    session.add(sub)
    await session.commit()
    await session.refresh(sub)
    return CompanySubscriptionOut(
        id=sub.id,
        organization_id=sub.organization_id,
        plan_code=sub.plan_code,
        status=sub.status,
        started_at=sub.started_at.isoformat(),
        ends_at=sub.ends_at.isoformat() if sub.ends_at else None,
    )


@router.get("", response_model=list[CompanySubscriptionOut])
async def list_subscriptions(session: SessionDep, organization_id: uuid.UUID | None = None):
    stmt = select(CompanySubscription).order_by(CompanySubscription.started_at.desc())
    if organization_id:
        stmt = stmt.where(CompanySubscription.organization_id == organization_id)
    rows = (await session.execute(stmt)).scalars().all()
    return [
        CompanySubscriptionOut(
            id=s.id,
            organization_id=s.organization_id,
            plan_code=s.plan_code,
            status=s.status,
            started_at=s.started_at.isoformat(),
            ends_at=s.ends_at.isoformat() if s.ends_at else None,
        )
        for s in rows
    ]

