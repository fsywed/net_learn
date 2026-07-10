"""靶机实例数据模型。"""

from datetime import datetime
from typing import Optional

from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class TargetInstance(Base):
    """靶机实例表：记录学员启动的容器、端口映射与生命周期。"""

    __tablename__ = "target_instances"

    # 主键：自增大整数，避免后期溢出
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    # 归属用户，外键 + 索引，加速按用户查询
    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id"), nullable=False, index=True
    )
    # 基于哪个靶机模板启动
    template_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("target_templates.id"), nullable=False
    )
    # Docker 容器 ID（调度失败时可能为空，仅作 error 留痕）
    container_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    # 映射到主机的主要端口（第一个容器端口对应的主机端口；调度失败时可能为空）
    host_port: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    # 完整端口映射 JSON 字符串，如 {"80":30001,"22":30002}（调度失败时可能为空）
    container_ports: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    # 实例状态：running / stopped / error
    status: Mapped[str] = mapped_column(
        String(32), nullable=False, default="running", server_default="running"
    )
    # 过期时间，到期后由后台任务自动回收
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    # 停止时间，仅停止后填充
    stopped_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
