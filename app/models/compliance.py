from __future__ import annotations

import uuid

from sqlalchemy import Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ComplianceProfile(Base):
    __tablename__ = "compliance_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    npd_status: Mapped[str] = mapped_column(String(20), nullable=False, default="unknown")
    npd_verified_at: Mapped[object | None] = mapped_column(DateTime(timezone=True), nullable=True)
    pdn_consent: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    pdn_consent_at: Mapped[object | None] = mapped_column(DateTime(timezone=True), nullable=True)
    metadata_json: Mapped[dict] = mapped_column("metadata", JSONB, nullable=False, default=dict)
    updated_at: Mapped[object] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

