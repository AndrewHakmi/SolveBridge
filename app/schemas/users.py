from __future__ import annotations

import uuid

from pydantic import BaseModel


class UserCreate(BaseModel):
    email: str
    display_name: str | None = None


class UserOut(BaseModel):
    id: uuid.UUID
    email: str
    display_name: str | None
