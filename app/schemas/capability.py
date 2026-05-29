from __future__ import annotations

import uuid
from typing import Annotated, Literal

from pydantic import BaseModel, Field

EntityType = Literal['user', 'team']


class CapabilityUpsert(BaseModel):
    entity_type: EntityType
    entity_id: uuid.UUID
    skill_code: Annotated[str, Field(min_length=1, max_length=50)]
    skill_name: Annotated[str | None, Field(max_length=100)] = None
    proficiency_level: Annotated[float, Field(ge=0.0, le=1.0)]
    evidence_artifact_id: uuid.UUID


class CapabilityOut(BaseModel):
    id: uuid.UUID
    entity_type: str
    entity_id: uuid.UUID
    skill_id: int
    proficiency_level: float
    evidence_artifact_id: uuid.UUID
