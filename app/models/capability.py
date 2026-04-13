from __future__ import annotations

import uuid

from sqlalchemy import DateTime, Float, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.common import UUIDPrimaryKeyMixin


class CapabilityEdge(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "capability_graph"

    entity_type: Mapped[str] = mapped_column(String(10), nullable=False)
    entity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id"), nullable=False)
    proficiency_level: Mapped[float] = mapped_column(Float, nullable=False)
    evidence_artifact_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("artifacts.id"), nullable=False)
    last_updated: Mapped[object] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

