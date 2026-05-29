from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from sqlalchemy import select

from app.api.deps import SessionDep
from app.models.organization import Organization
from app.schemas.organizations import OrganizationCreate, OrganizationOut, OrgType


router = APIRouter()


@router.post("", response_model=OrganizationOut)
async def create_org(payload: OrganizationCreate, session: SessionDep):
    org = Organization(type=payload.type, name=payload.name, region=payload.region, metadata_json=payload.metadata)
    session.add(org)
    await session.commit()
    await session.refresh(org)
    return OrganizationOut(
        id=org.id,
        type=org.type,
        name=org.name,
        region=org.region,
        metadata=org.metadata_json,
    )


@router.get("", response_model=list[OrganizationOut])
async def list_orgs(session: SessionDep, type: Optional[OrgType] = Query(default=None)):
    stmt = select(Organization)
    if type:
        stmt = stmt.where(Organization.type == type)
    rows = (await session.execute(stmt.order_by(Organization.name))).scalars().all()
    return [
        OrganizationOut(id=o.id, type=o.type, name=o.name, region=o.region, metadata=o.metadata_json)
        for o in rows
    ]


@router.delete("/{org_id}", status_code=204)
async def delete_org(org_id: uuid.UUID, session: SessionDep):
    org = (await session.execute(select(Organization).where(Organization.id == org_id))).scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    await session.delete(org)
    await session.commit()
