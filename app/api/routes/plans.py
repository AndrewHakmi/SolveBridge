from __future__ import annotations

from fastapi import APIRouter
from sqlalchemy import select

from app.api.deps import SessionDep
from app.models.service_plan import ServicePlan
from app.schemas.plans import ServicePlanOut


router = APIRouter()


@router.get("", response_model=list[ServicePlanOut])
async def list_plans(session: SessionDep):
    rows = (await session.execute(select(ServicePlan).order_by(ServicePlan.monthly_price_rub))).scalars().all()
    return [
        ServicePlanOut(
            code=p.code,
            name=p.name,
            monthly_price_rub=p.monthly_price_rub,
            sla_minutes=p.sla_minutes,
            features=p.features_json,
        )
        for p in rows
    ]

