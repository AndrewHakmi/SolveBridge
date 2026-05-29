from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "add_auth_columns"
down_revision = "cmp_adi_enf_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("password_hash", sa.String(200), nullable=True))
    op.add_column(
        "users",
        sa.Column("role", sa.String(40), nullable=False, server_default="student"),
    )


def downgrade() -> None:
    op.drop_column("users", "role")
    op.drop_column("users", "password_hash")
