from __future__ import annotations

import uuid
from typing import Annotated, Literal

from pydantic import BaseModel, Field

OrgType = Literal['university', 'infrastructure', 'government', 'company']


class OrganizationCreate(BaseModel):
    type: OrgType
    name: Annotated[str, Field(min_length=1, max_length=200)]
    region: Annotated[str | None, Field(max_length=100)] = None
    metadata: dict = Field(default_factory=dict)


class OrganizationOut(BaseModel):
    id: uuid.UUID
    type: str
    name: str
    region: str | None
    metadata: dict
