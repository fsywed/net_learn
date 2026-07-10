"""靶机模板数据模型。"""

from datetime import datetime
from typing import Optional

from sqlalchemy import BigInteger, DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class TargetTemplate(Base):
    """靶机模板表：描述一个可启动的漏洞靶机镜像与预期 Flag。"""

    __tablename__ = "target_templates"

    # 主键：自增大整数，避免后期溢出
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    # 模板名称
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    # 模板描述（可空）
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    # 难度：easy / medium / hard
    difficulty: Mapped[str] = mapped_column(
        String(32), nullable=False, default="medium", server_default="medium"
    )
    # Docker 镜像地址，如 vulhub/example:latest
    image: Mapped[str] = mapped_column(String(255), nullable=False)
    # 容器内开放端口，逗号分隔，如 80,22
    ports: Mapped[str] = mapped_column(String(255), nullable=False)
    # 预期 Flag 值，仅供管理员与判定逻辑使用
    flag: Mapped[str] = mapped_column(String(255), nullable=False)
    # 发布状态：published（上架，学员可见）/ unlisted（下架，仅管理员可见）
    status: Mapped[str] = mapped_column(
        String(32), nullable=False, default="published", server_default="published"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        server_default=func.now(),
        onupdate=func.now(),
    )
