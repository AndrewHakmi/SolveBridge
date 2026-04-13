from __future__ import annotations

from fastapi import APIRouter
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert

from app.api.deps import SessionDep
from app.models.capability import CapabilityEdge
from app.models.skill import Skill
from app.schemas.capability import CapabilityOut, CapabilityUpsert


router = APIRouter()


@router.put("", response_model=CapabilityOut)
async def upsert_capability(payload: CapabilityUpsert, session: SessionDep):
    skill = (await session.execute(select(Skill).where(Skill.code == payload.skill_code))).scalar_one_or_none()
    if not skill:
        skill = Skill(code=payload.skill_code, name=payload.skill_name or payload.skill_code)
        session.add(skill)
        await session.flush()

    stmt = (
        insert(CapabilityEdge)
        .values(
            entity_type=payload.entity_type,
            entity_id=payload.entity_id,
            skill_id=skill.id,
            proficiency_level=payload.proficiency_level,
            evidence_artifact_id=payload.evidence_artifact_id,
        )
        .on_conflict_do_update(
            index_elements=[CapabilityEdge.entity_type, CapabilityEdge.entity_id, CapabilityEdge.skill_id],
            set_={
                "proficiency_level": payload.proficiency_level,
                "evidence_artifact_id": payload.evidence_artifact_id,
            },
        )
        .returning(CapabilityEdge)
    )
    row = (await session.execute(stmt)).scalar_one()
    await session.commit()
    return CapabilityOut(
        id=row.id,
        entity_type=row.entity_type,
        entity_id=row.entity_id,
        skill_id=row.skill_id,
        proficiency_level=row.proficiency_level,
        evidence_artifact_id=row.evidence_artifact_id,
    )

