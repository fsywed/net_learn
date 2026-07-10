"""initial empty migration

Revision ID: 0001
Revises:
Create Date: 2026-07-10 00:00:00.000000

初始迁移：暂不创建任何业务表，alembic 版本表会在首次执行时自动建立。
后续 Task 添加模型后，使用 `alembic revision --autogenerate` 生成业务表迁移。

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# Alembic 修订标识
revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 初始空迁移：仅建立 alembic 版本基线
    pass


def downgrade() -> None:
    pass
