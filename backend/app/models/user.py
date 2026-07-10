"""用户数据模型。"""

from datetime import datetime

from sqlalchemy import BigInteger, DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class User(Base):
    """用户表：账号、密码哈希、角色、状态与积分。"""

    __tablename__ = "users"

    # 主键：自增大整数，避免后期溢出
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    # 登录邮箱，建唯一索引加速查重
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    # bcrypt 哈希后的密码
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    # 角色：student / admin，字符串形式便于扩展
    role: Mapped[str] = mapped_column(
        String(32), nullable=False, default="student", server_default="student"
    )
    # 状态：active / disabled
    status: Mapped[str] = mapped_column(
        String(32), nullable=False, default="active", server_default="active"
    )
    # 学习积分
    score: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default="0"
    )
    # 创建时间：数据库侧默认当前时间
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    # 更新时间：每次更新自动刷新
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        server_default=func.now(),
        onupdate=func.now(),
    )
