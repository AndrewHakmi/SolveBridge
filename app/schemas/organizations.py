from __future__ import annotations

import uuid

from pydantic import BaseModel, Field


class OrganizationCreate(BaseModel):
    type: str
    name: str
    region: str | None = None
    metadata: dict = Field(default_factory=dict)


class OrganizationOut(BaseModel):
    id: uuid.UUID
    type: str
    name: str
    region: str | None
    metadata: dict

