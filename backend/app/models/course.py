"""课程与章节数据模型。"""

from datetime import datetime
from typing import List, Optional

from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Course(Base):
    """课程表：标题、描述、发布状态与章节集合。"""

    __tablename__ = "courses"

    # 主键：自增大整数，避免后期溢出
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    # 课程标题
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    # 课程描述（可空）
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    # 发布状态：published / draft
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

    # 章节集合：async 下禁止隐式懒加载，查询时显式 selectinload；
    # 删除课程时由数据库 ON DELETE CASCADE 清理章节（passive_deletes）
    chapters: Mapped[List["Chapter"]] = relationship(
        back_populates="course",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by=["Chapter.order", "Chapter.id"],
        lazy="raise",
    )


class Chapter(Base):
    """章节表：归属课程、标题、Markdown 正文与排序。"""

    __tablename__ = "chapters"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    # 所属课程，外键级联删除并建索引加速按课程查询
    course_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # 章节标题
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    # Markdown 原文，查询接口直接透传，前端负责渲染
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    # 排序权重，默认 0
    order: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default="0"
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

    # 反向关系：同样禁止隐式懒加载，需要时显式 selectinload
    course: Mapped["Course"] = relationship(back_populates="chapters", lazy="raise")
