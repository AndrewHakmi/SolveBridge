from __future__ import annotations

import uuid

from pydantic import BaseModel, Field


class ComplianceProfileUpsert(BaseModel):
    user_id: uuid.UUID
    npd_status: str = "unknown"
    pdn_consent: bool = False
    metadata: dict = Field(default_factory=dict)


class ComplianceProfileOut(BaseModel):
    user_id: uuid.UUID
    npd_status: str
    npd_verified_at: str | None
    pdn_consent: bool
    pdn_consent_at: str | None
    metadata: dict

