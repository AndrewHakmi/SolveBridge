from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "cmp_adi_enf_0001"
down_revision = "bmc_marketplace_mvp"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "compliance_profiles",
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id"), primary_key=True, nullable=False),
        sa.Column("npd_status", sa.String(length=20), nullable=False, server_default="unknown"),
        sa.Column("npd_verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("pdn_consent", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("pdn_consent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("metadata", postgresql.JSONB(), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_compliance_profiles_npd_status", "compliance_profiles", ["npd_status"])

    op.add_column("anti_disintermediation_rules", sa.Column("mentor_required", sa.Boolean(), nullable=False, server_default=sa.text("true")))


def downgrade() -> None:
    op.drop_column("anti_disintermediation_rules", "mentor_required")
    op.drop_index("ix_compliance_profiles_npd_status", table_name="compliance_profiles")
    op.drop_table("compliance_profiles")
