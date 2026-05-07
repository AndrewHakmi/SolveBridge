from __future__ import annotations

import uuid

from pydantic import BaseModel


class TeamCreate(BaseModel):
    name: str


class TeamOut(BaseModel):
    id: uuid.UUID
    name: str
