from __future__ import annotations

import datetime as dt
import uuid

from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert

from app.api.deps import SessionDep
from app.models.dispute import Dispute
from app.models.task import Task, TaskApplication, TaskAssignment
from app.schemas.disputes import DisputeCreate, DisputeOut
from app.schemas.tasks import (
    TaskApplicationCreate,
    TaskApplicationOut,
    TaskAssignIn,
    TaskAssignmentOut,
    TaskCreate,
    TaskOut,
)


router = APIRouter()


@router.post("", response_model=TaskOut)
async def create_task(payload: TaskCreate, session: SessionDep):
    task = Task(
        organization_id=payload.organization_id,
        title=payload.title,
        description=payload.description,
        category=payload.category,
        budget_amount_rub=payload.budget_amount_rub,
        required_skills_json=payload.required_skills,
    )
    session.add(task)
    await session.commit()
    await session.refresh(task)
    return TaskOut(
        id=task.id,
        organization_id=task.organization_id,
        title=task.title,
        description=task.description,
        category=task.category,
        budget_amount_rub=task.budget_amount_rub,
        status=task.status,
        required_skills=task.required_skills_json,
    )


@router.get("", response_model=list[TaskOut])
async def list_tasks(session: SessionDep, status: str | None = None):
    stmt = select(Task)
    if status:
        stmt = stmt.where(Task.status == status)
    rows = (await session.execute(stmt.order_by(Task.created_at.desc()))).scalars().all()
    return [
        TaskOut(
            id=t.id,
            organization_id=t.organization_id,
            title=t.title,
            description=t.description,
            category=t.category,
            budget_amount_rub=t.budget_amount_rub,
            status=t.status,
            required_skills=t.required_skills_json,
        )
        for t in rows
    ]


@router.get("/{task_id}", response_model=TaskOut)
async def get_task(task_id: uuid.UUID, session: SessionDep):
    task = (await session.execute(select(Task).where(Task.id == task_id))).scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return TaskOut(
        id=task.id,
        organization_id=task.organization_id,
        title=task.title,
        description=task.description,
        category=task.category,
        budget_amount_rub=task.budget_amount_rub,
        status=task.status,
        required_skills=task.required_skills_json,
    )


@router.post("/{task_id}/apply", response_model=TaskApplicationOut)
async def apply_to_task(task_id: uuid.UUID, payload: TaskApplicationCreate, session: SessionDep):
    task = (await session.execute(select(Task).where(Task.id == task_id))).scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.status not in {"open"}:
        raise HTTPException(status_code=409, detail="Task is not open for applications")

    stmt = (
        insert(TaskApplication)
        .values(
            task_id=task_id,
            applicant_id=payload.applicant_id,
            proposed_amount_rub=payload.proposed_amount_rub,
            message=payload.message,
            status="submitted",
        )
        .on_conflict_do_update(
            index_elements=[TaskApplication.task_id, TaskApplication.applicant_id],
            set_={
                "proposed_amount_rub": payload.proposed_amount_rub,
                "message": payload.message,
                "status": "submitted",
            },
        )
        .returning(TaskApplication)
    )
    row = (await session.execute(stmt)).scalar_one()
    await session.commit()
    return TaskApplicationOut(
        id=row.id,
        task_id=row.task_id,
        applicant_id=row.applicant_id,
        proposed_amount_rub=row.proposed_amount_rub,
        message=row.message,
        status=row.status,
    )


@router.get("/{task_id}/applications", response_model=list[TaskApplicationOut])
async def list_applications(task_id: uuid.UUID, session: SessionDep):
    rows = (
        await session.execute(select(TaskApplication).where(TaskApplication.task_id == task_id).order_by(TaskApplication.created_at.desc()))
    ).scalars().all()
    return [
        TaskApplicationOut(
            id=r.id,
            task_id=r.task_id,
            applicant_id=r.applicant_id,
            proposed_amount_rub=r.proposed_amount_rub,
            message=r.message,
            status=r.status,
        )
        for r in rows
    ]


@router.post("/{task_id}/assign", response_model=TaskAssignmentOut)
async def assign_task(task_id: uuid.UUID, payload: TaskAssignIn, session: SessionDep):
    task = (await session.execute(select(Task).where(Task.id == task_id))).scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.status not in {"open", "assigned"}:
        raise HTTPException(status_code=409, detail="Task cannot be assigned in current state")

    existing = (await session.execute(select(TaskAssignment).where(TaskAssignment.task_id == task_id))).scalar_one_or_none()
    if existing:
        existing.executor_id = payload.executor_id
        existing.mentor_id = payload.mentor_id
        existing.status = "assigned"
        assignment = existing
    else:
        assignment = TaskAssignment(
            task_id=task_id,
            executor_id=payload.executor_id,
            mentor_id=payload.mentor_id,
            status="assigned",
        )
        session.add(assignment)

    task.status = "assigned"
    await session.commit()
    await session.refresh(assignment)
    return TaskAssignmentOut(
        id=assignment.id,
        task_id=assignment.task_id,
        executor_id=assignment.executor_id,
        mentor_id=assignment.mentor_id,
        status=assignment.status,
    )


@router.get("/{task_id}/assignment", response_model=TaskAssignmentOut | None)
async def get_assignment(task_id: uuid.UUID, session: SessionDep):
    row = (await session.execute(select(TaskAssignment).where(TaskAssignment.task_id == task_id))).scalar_one_or_none()
    if not row:
        return None
    return TaskAssignmentOut(
        id=row.id,
        task_id=row.task_id,
        executor_id=row.executor_id,
        mentor_id=row.mentor_id,
        status=row.status,
    )


@router.post("/{task_id}/disputes", response_model=DisputeOut)
async def open_dispute(task_id: uuid.UUID, payload: DisputeCreate, session: SessionDep):
    task = (await session.execute(select(Task).where(Task.id == task_id))).scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    deadline = dt.datetime.now(dt.timezone.utc) + dt.timedelta(minutes=payload.sla_minutes)
    dispute = Dispute(
        task_id=task_id,
        opened_by_id=payload.opened_by_id,
        reason=payload.reason,
        status="open",
        sla_deadline=deadline,
    )
    session.add(dispute)
    if task.status not in {"disputed", "completed", "canceled"}:
        task.status = "disputed"
    await session.commit()
    await session.refresh(dispute)
    return DisputeOut(
        id=dispute.id,
        task_id=dispute.task_id,
        opened_by_id=dispute.opened_by_id,
        reason=dispute.reason,
        status=dispute.status,
        sla_deadline=dispute.sla_deadline.isoformat(),
    )


@router.get("/{task_id}/disputes", response_model=list[DisputeOut])
async def list_disputes(task_id: uuid.UUID, session: SessionDep):
    rows = (
        await session.execute(select(Dispute).where(Dispute.task_id == task_id).order_by(Dispute.created_at.desc()))
    ).scalars().all()
    return [
        DisputeOut(
            id=d.id,
            task_id=d.task_id,
            opened_by_id=d.opened_by_id,
            reason=d.reason,
            status=d.status,
            sla_deadline=d.sla_deadline.isoformat(),
        )
        for d in rows
    ]

