from __future__ import annotations

import uuid

from pydantic import BaseModel


class PaymentIntentCreate(BaseModel):
    task_id: uuid.UUID
    provider: str
    amount_rub: int


class PaymentIntentOut(BaseModel):
    id: uuid.UUID
    task_id: uuid.UUID
    provider: str
    amount_rub: int
    status: str
    external_id: str | None

