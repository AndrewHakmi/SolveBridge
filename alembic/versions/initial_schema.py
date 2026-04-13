from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector
from sqlalchemy.dialects import postgresql

revision = "initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("email", sa.String(length=320), unique=True, nullable=False),
        sa.Column("display_name", sa.String(length=200), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    op.create_table(
        "teams",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    op.create_table(
        "projects",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("title", sa.String(length=300), nullable=False),
        sa.Column("client_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("owner_team_id", sa.Uuid(), sa.ForeignKey("teams.id"), nullable=True),
        sa.Column("status", sa.String(length=40), nullable=False, server_default="created"),
        sa.Column("mentor_score", sa.Float(), nullable=True),
        sa.Column("client_score", sa.Float(), nullable=True),
        sa.Column("peer_score", sa.Float(), nullable=True),
        sa.Column("artifact_score", sa.Float(), nullable=True),
        sa.Column("success_rate", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    op.create_table(
        "artifact_types",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("code", sa.String(length=50), unique=True, nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
    )

    op.execute(
        "INSERT INTO artifact_types (id, code, name) VALUES "
        "(1, 'code', 'Code'), (2, 'research', 'Research'), (3, 'prototype', 'Prototype') "
        "ON CONFLICT DO NOTHING"
    )

    op.create_table(
        "artifacts",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("project_id", sa.Uuid(), sa.ForeignKey("projects.id"), nullable=False),
        sa.Column("owner_team_id", sa.Uuid(), sa.ForeignKey("teams.id"), nullable=False),
        sa.Column("type_id", sa.Integer(), sa.ForeignKey("artifact_types.id"), nullable=False),
        sa.Column("content_hash", sa.String(length=128), nullable=False),
        sa.Column("reusability_index", sa.Float(), nullable=False, server_default="0"),
        sa.Column("mentorship_seal", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("metadata", postgresql.JSONB(), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("git_url", sa.String(length=1000), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_artifacts_project_id", "artifacts", ["project_id"])
    op.create_index("ix_artifacts_owner_team_id", "artifacts", ["owner_team_id"])
    op.create_index("ux_artifacts_content_hash", "artifacts", ["content_hash"], unique=False)

    op.create_table(
        "skills",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("code", sa.String(length=80), unique=True, nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
    )

    op.create_table(
        "capability_graph",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("entity_type", sa.String(length=10), nullable=False),
        sa.Column("entity_id", sa.Uuid(), nullable=False),
        sa.Column("skill_id", sa.Integer(), sa.ForeignKey("skills.id"), nullable=False),
        sa.Column("proficiency_level", sa.Float(), nullable=False),
        sa.Column("evidence_artifact_id", sa.Uuid(), sa.ForeignKey("artifacts.id"), nullable=False),
        sa.Column("last_updated", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index(
        "ux_capability_entity_skill",
        "capability_graph",
        ["entity_type", "entity_id", "skill_id"],
        unique=True,
    )

    op.create_table(
        "mentor_activity_logs",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("mentor_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("team_id", sa.Uuid(), sa.ForeignKey("teams.id"), nullable=False),
        sa.Column("project_id", sa.Uuid(), sa.ForeignKey("projects.id"), nullable=True),
        sa.Column("action_type", sa.String(length=30), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), nullable=False),
        sa.Column("complexity_weight", sa.Float(), nullable=False, server_default="1"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_mentor_activity_mentor_id", "mentor_activity_logs", ["mentor_id"])
    op.create_index("ix_mentor_activity_team_id", "mentor_activity_logs", ["team_id"])
    op.create_index("ix_mentor_activity_project_id", "mentor_activity_logs", ["project_id"])

    op.create_table(
        "project_vectors",
        sa.Column("project_id", sa.Uuid(), sa.ForeignKey("projects.id"), primary_key=True, nullable=False),
        sa.Column("embedding", sa.Text(), nullable=True),
        sa.Column("embedding_v", Vector(1536), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index(
        "ix_project_vectors_embedding_v",
        "project_vectors",
        ["embedding_v"],
        postgresql_using="ivfflat",
    )


def downgrade() -> None:
    op.drop_index("ix_project_vectors_embedding_v", table_name="project_vectors")
    op.drop_table("project_vectors")
    op.drop_index("ix_mentor_activity_project_id", table_name="mentor_activity_logs")
    op.drop_index("ix_mentor_activity_team_id", table_name="mentor_activity_logs")
    op.drop_index("ix_mentor_activity_mentor_id", table_name="mentor_activity_logs")
    op.drop_table("mentor_activity_logs")
    op.drop_index("ux_capability_entity_skill", table_name="capability_graph")
    op.drop_table("capability_graph")
    op.drop_table("skills")
    op.drop_index("ux_artifacts_content_hash", table_name="artifacts")
    op.drop_index("ix_artifacts_owner_team_id", table_name="artifacts")
    op.drop_index("ix_artifacts_project_id", table_name="artifacts")
    op.drop_table("artifacts")
    op.drop_table("artifact_types")
    op.drop_table("projects")
    op.drop_table("teams")
    op.drop_table("users")

