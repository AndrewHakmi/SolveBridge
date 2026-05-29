from __future__ import annotations

import re
import uuid
from typing import Annotated, Literal

from pydantic import BaseModel, Field, field_validator

_EMAIL_RE = re.compile(r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$')

SelfRegistrableRole = Literal['student', 'executor', 'client']


def _validate_email(v: str) -> str:
    v = v.strip().lower()
    if not _EMAIL_RE.match(v):
        raise ValueError('Некорректный формат email')
    return v


class UserCreate(BaseModel):
    email: Annotated[str, Field(max_length=320)]
    display_name: Annotated[str | None, Field(max_length=200)] = None

    @field_validator('email')
    @classmethod
    def email_format(cls, v: str) -> str:
        return _validate_email(v)


class UserOut(BaseModel):
    id: uuid.UUID
    email: str
    display_name: str | None


class RegisterRequest(BaseModel):
    email: Annotated[str, Field(max_length=320)]
    password: Annotated[str, Field(min_length=6, max_length=128)]
    display_name: Annotated[str | None, Field(max_length=200)] = None
    # Only these three roles are self-registerable; admin/partner/mentor are assigned by staff
    role: SelfRegistrableRole = 'student'

    @field_validator('email')
    @classmethod
    def email_format(cls, v: str) -> str:
        return _validate_email(v)


class LoginRequest(BaseModel):
    email: Annotated[str, Field(max_length=320)]
    password: Annotated[str, Field(max_length=128)]

    @field_validator('email')
    @classmethod
    def email_format(cls, v: str) -> str:
        return _validate_email(v)


class AuthOut(BaseModel):
    id: uuid.UUID
    email: str
    display_name: str | None
    role: str
