"""数据库 ORM 模型：靶机实例表。"""
from __future__ import annotations

import enum
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Integer, String, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """SQLAlchemy 2.0 声明基类。"""
    pass


class InstanceStatus(str, enum.Enum):
    starting = "starting"
    running = "running"
    stopping = "stopping"
    stopped = "stopped"
    error = "error"


class TargetInstance(Base):
    """用户启动的靶机实例：含容器 ID、端口映射、过期时间。"""
    __tablename__ = "target_instances"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    template_id: Mapped[int] = mapped_column(Integer, index=True)
    container_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    container_name: Mapped[str] = mapped_column(String(128), unique=True)
    host_port: Mapped[int] = mapped_column(Integer)  # 容器对外暴露的随机端口
    container_port: Mapped[int] = mapped_column(Integer)  # 容器内服务的固定端口
    status: Mapped[str] = mapped_column(String(16), default=InstanceStatus.starting.value)
    flag: Mapped[str] = mapped_column(String(128))  # 动态生成的 Flag
    client_ip: Mapped[str] = mapped_column(String(64), index=True)
    proxy_token: Mapped[str] = mapped_column(String(64), index=True)  # 代理访问令牌
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    expires_at: Mapped[datetime] = mapped_column(DateTime, index=True)
    stopped_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
