"""课程相关的 Pydantic 请求/响应模型。"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class ChapterBrief(BaseModel):
    """课程概览中的章节摘要。"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    order: int


class CourseCreateIn(BaseModel):
    """创建课程入参。"""

    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None


class CourseUpdateIn(BaseModel):
    """更新课程入参（全部可选）。"""

    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(default=None, pattern="^(published|draft)$")


class CourseOut(BaseModel):
    """课程出参，含章节概览。"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: Optional[str]
    status: str
    created_at: datetime
    chapters: List[ChapterBrief] = []


class ChapterCreateIn(BaseModel):
    """创建章节入参。"""

    course_id: int
    title: str = Field(min_length=1, max_length=255)
    content: Optional[str] = None
    order: Optional[int] = 0


class ChapterUpdateIn(BaseModel):
    """更新章节入参（全部可选）。"""

    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    content: Optional[str] = None
    order: Optional[int] = None


class ChapterOut(BaseModel):
    """章节出参，content 透传 Markdown 原文。"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    course_id: int
    title: str
    content: Optional[str]
    order: int
    created_at: datetime
