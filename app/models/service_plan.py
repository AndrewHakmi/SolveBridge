from __future__ import annotations

from sqlalchemy import Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ServicePlan(Base):
    __tablename__ = "service_plans"

    code: Mapped[str] = mapped_column(String(30), primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    monthly_price_rub: Mapped[int] = mapped_column(Integer, nullable=False)
    sla_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    features_json: Mapped[dict] = mapped_column("features", JSONB, nullable=False, default=dict)

