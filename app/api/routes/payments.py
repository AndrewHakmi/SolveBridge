from __future__ import annotations

from fastapi import APIRouter

from app.api.deps import SessionDep
from app.models.payment import PaymentIntent
from app.schemas.payments import PaymentIntentCreate, PaymentIntentOut


router = APIRouter()


@router.post("/intents", response_model=PaymentIntentOut)
async def create_intent(payload: PaymentIntentCreate, session: SessionDep):
    intent = PaymentIntent(task_id=payload.task_id, provider=payload.provider, amount_rub=payload.amount_rub)
    session.add(intent)
    await session.commit()
    await session.refresh(intent)
    return PaymentIntentOut(
        id=intent.id,
        task_id=intent.task_id,
        provider=intent.provider,
        amount_rub=intent.amount_rub,
        status=intent.status,
        external_id=intent.external_id,
    )
