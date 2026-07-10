"""Flag 提交记录数据模型。"""

from datetime import datetime
from typing import Optional

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Submission(Base):
    """提交记录表：记录学员对某靶机模板的 Flag 提交与判定结果。

    不使用 (user_id, template_id) 上的数据库唯一约束。原因：
    同一用户同一模板在通关前可多次提交错误 Flag，仅「首次正确」后拒绝再提交。
    该语义由业务逻辑（查询是否已存在 is_correct=True 的提交）实现，而非 DB 约束。
    """

    __tablename__ = "submissions"

    # 主键：自增大整数，避免后期溢出
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    # 提交者，外键 + 索引，加速按用户查询
    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id"), nullable=False, index=True
    )
    # 对应靶机模板，外键 + 索引，加速按模板查询
    template_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("target_templates.id"), nullable=False, index=True
    )
    # 对应靶机实例（可空：学员未必从实例入口提交）
    instance_id: Mapped[Optional[int]] = mapped_column(
        BigInteger, ForeignKey("target_instances.id"), nullable=True
    )
    # 学员提交的 Flag 原文（保留原始输入以便审计）
    flag: Mapped[str] = mapped_column(String(255), nullable=False)
    # 是否正确
    is_correct: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false"
    )
    # 提交时间：数据库侧默认当前时间
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
