from __future__ import annotations

import uuid

from pydantic import BaseModel


class CompanySubscriptionCreate(BaseModel):
    organization_id: uuid.UUID
    plan_code: str


class CompanySubscriptionOut(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    plan_code: str
    status: str
    started_at: str
    ends_at: str | None

