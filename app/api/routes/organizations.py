from __future__ import annotations

from fastapi import APIRouter
from sqlalchemy import select

from app.api.deps import SessionDep
from app.models.organization import Organization
from app.schemas.organizations import OrganizationCreate, OrganizationOut


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
async def list_orgs(session: SessionDep, type: str | None = None):
    stmt = select(Organization)
    if type:
        stmt = stmt.where(Organization.type == type)
    rows = (await session.execute(stmt.order_by(Organization.name))).scalars().all()
    return [
        OrganizationOut(id=o.id, type=o.type, name=o.name, region=o.region, metadata=o.metadata_json)
        for o in rows
    ]
