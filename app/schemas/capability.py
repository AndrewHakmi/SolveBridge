from __future__ import annotations

import uuid

from pydantic import BaseModel


class CapabilityUpsert(BaseModel):
    entity_type: str
    entity_id: uuid.UUID
    skill_code: str
    skill_name: str | None = None
    proficiency_level: float
    evidence_artifact_id: uuid.UUID


class CapabilityOut(BaseModel):
    id: uuid.UUID
    entity_type: str
    entity_id: uuid.UUID
    skill_id: int
    proficiency_level: float
    evidence_artifact_id: uuid.UUID

