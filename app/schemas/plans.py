from __future__ import annotations

from pydantic import BaseModel


class ServicePlanOut(BaseModel):
    code: str
    name: str
    monthly_price_rub: int
    sla_minutes: int
    features: dict

