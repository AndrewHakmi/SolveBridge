from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "bmc_marketplace_mvp"
down_revision = "initial_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "organizations",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("type", sa.String(length=30), nullable=False),
        sa.Column("name", sa.String(length=300), nullable=False),
        sa.Column("region", sa.String(length=120), nullable=True),
        sa.Column("metadata", postgresql.JSONB(), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_organizations_type", "organizations", ["type"])

    op.create_table(
        "service_plans",
        sa.Column("code", sa.String(length=30), primary_key=True, nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("monthly_price_rub", sa.Integer(), nullable=False),
        sa.Column("sla_minutes", sa.Integer(), nullable=False),
        sa.Column("features", postgresql.JSONB(), nullable=False, server_default=sa.text("'{}'::jsonb")),
    )
    op.execute(
        "INSERT INTO service_plans (code, name, monthly_price_rub, sla_minutes, features) VALUES "
        "('self', 'Self‑Service', 8000, 240, '{\"support\":\"tickets\",\"tier\":\"self\"}'), "
        "('managed', 'Managed', 8000, 60, '{\"support\":\"manager\",\"tier\":\"managed\"}'), "
        "('enterprise', 'Enterprise', 25000, 60, '{\"support\":\"account\",\"tier\":\"enterprise\"}') "
        "ON CONFLICT DO NOTHING"
    )

    op.create_table(
        "company_subscriptions",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("organization_id", sa.Uuid(), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("plan_code", sa.String(length=30), sa.ForeignKey("service_plans.code"), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="active"),
        sa.Column("started_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("ends_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_company_subscriptions_org", "company_subscriptions", ["organization_id"])

    op.create_table(
        "tasks",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("organization_id", sa.Uuid(), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("title", sa.String(length=300), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("category", sa.String(length=60), nullable=False, server_default="general"),
        sa.Column("budget_amount_rub", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="open"),
        sa.Column("required_skills", postgresql.JSONB(), nullable=False, server_default=sa.text("'[]'::jsonb")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("due_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_tasks_org", "tasks", ["organization_id"])
    op.create_index("ix_tasks_status", "tasks", ["status"])
    op.create_index("ix_tasks_category", "tasks", ["category"])

    op.create_table(
        "task_applications",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("task_id", sa.Uuid(), sa.ForeignKey("tasks.id"), nullable=False),
        sa.Column("applicant_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("proposed_amount_rub", sa.Integer(), nullable=True),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="submitted"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_task_applications_task", "task_applications", ["task_id"])
    op.create_index("ix_task_applications_applicant", "task_applications", ["applicant_id"])
    op.create_index(
        "ux_task_applications_task_applicant",
        "task_applications",
        ["task_id", "applicant_id"],
        unique=True,
    )

    op.create_table(
        "task_assignments",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("task_id", sa.Uuid(), sa.ForeignKey("tasks.id"), nullable=False),
        sa.Column("executor_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("mentor_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="assigned"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("delivered_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ux_task_assignments_task", "task_assignments", ["task_id"], unique=True)
    op.create_index("ix_task_assignments_executor", "task_assignments", ["executor_id"])

    op.create_table(
        "disputes",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("task_id", sa.Uuid(), sa.ForeignKey("tasks.id"), nullable=False),
        sa.Column("opened_by_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("reason", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="open"),
        sa.Column("sla_deadline", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_disputes_task", "disputes", ["task_id"])
    op.create_index("ix_disputes_status", "disputes", ["status"])

    op.create_table(
        "ratings",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("task_id", sa.Uuid(), sa.ForeignKey("tasks.id"), nullable=False),
        sa.Column("rater_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("ratee_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("dimension", sa.String(length=20), nullable=False),
        sa.Column("score", sa.Float(), nullable=False),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_ratings_task", "ratings", ["task_id"])
    op.create_index("ix_ratings_ratee", "ratings", ["ratee_id"])

    op.create_table(
        "student_verifications",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("student_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("university_org_id", sa.Uuid(), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="pending"),
        sa.Column("document_ref", sa.String(length=1000), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_student_verifications_student", "student_verifications", ["student_id"])
    op.create_index("ix_student_verifications_university", "student_verifications", ["university_org_id"])

    op.create_table(
        "anti_disintermediation_rules",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("company_org_id", sa.Uuid(), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("executor_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("required_task_count", sa.Integer(), nullable=False, server_default="3"),
        sa.Column("completed_task_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index(
        "ux_anti_disintermediation_company_executor",
        "anti_disintermediation_rules",
        ["company_org_id", "executor_id"],
        unique=True,
    )

    op.create_table(
        "payment_intents",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("task_id", sa.Uuid(), sa.ForeignKey("tasks.id"), nullable=False),
        sa.Column("provider", sa.String(length=30), nullable=False),
        sa.Column("amount_rub", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="created"),
        sa.Column("external_id", sa.String(length=200), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_payment_intents_task", "payment_intents", ["task_id"])


def downgrade() -> None:
    op.drop_index("ix_payment_intents_task", table_name="payment_intents")
    op.drop_table("payment_intents")
    op.drop_index("ux_anti_disintermediation_company_executor", table_name="anti_disintermediation_rules")
    op.drop_table("anti_disintermediation_rules")
    op.drop_index("ix_student_verifications_university", table_name="student_verifications")
    op.drop_index("ix_student_verifications_student", table_name="student_verifications")
    op.drop_table("student_verifications")
    op.drop_index("ix_ratings_ratee", table_name="ratings")
    op.drop_index("ix_ratings_task", table_name="ratings")
    op.drop_table("ratings")
    op.drop_index("ix_disputes_status", table_name="disputes")
    op.drop_index("ix_disputes_task", table_name="disputes")
    op.drop_table("disputes")
    op.drop_index("ix_task_assignments_executor", table_name="task_assignments")
    op.drop_index("ux_task_assignments_task", table_name="task_assignments")
    op.drop_table("task_assignments")
    op.drop_index("ux_task_applications_task_applicant", table_name="task_applications")
    op.drop_index("ix_task_applications_applicant", table_name="task_applications")
    op.drop_index("ix_task_applications_task", table_name="task_applications")
    op.drop_table("task_applications")
    op.drop_index("ix_tasks_category", table_name="tasks")
    op.drop_index("ix_tasks_status", table_name="tasks")
    op.drop_index("ix_tasks_org", table_name="tasks")
    op.drop_table("tasks")
    op.drop_index("ix_company_subscriptions_org", table_name="company_subscriptions")
    op.drop_table("company_subscriptions")
    op.drop_table("service_plans")
    op.drop_index("ix_organizations_type", table_name="organizations")
    op.drop_table("organizations")

