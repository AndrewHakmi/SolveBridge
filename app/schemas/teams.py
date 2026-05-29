from __future__ import annotations

import uuid
from typing import Annotated

from pydantic import BaseModel, Field


class TeamCreate(BaseModel):
    name: Annotated[str, Field(min_length=1, max_length=200)]


class TeamOut(BaseModel):
    id: uuid.UUID
    name: str
