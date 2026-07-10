"""靶机模板相关的 Pydantic 请求/响应模型。"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class TargetTemplateCreateIn(BaseModel):
    """创建靶机模板入参。"""

    name: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    difficulty: Optional[str] = Field(default="medium", pattern="^(easy|medium|hard)$")
    image: str = Field(min_length=1, max_length=255)
    ports: str = Field(min_length=1, max_length=255)
    flag: str = Field(min_length=1, max_length=255)
    status: Optional[str] = Field(default="published", pattern="^(published|unlisted)$")


class TargetTemplateUpdateIn(BaseModel):
    """更新靶机模板入参（全部可选）。"""

    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    difficulty: Optional[str] = Field(default=None, pattern="^(easy|medium|hard)$")
    image: Optional[str] = Field(default=None, min_length=1, max_length=255)
    ports: Optional[str] = Field(default=None, min_length=1, max_length=255)
    flag: Optional[str] = Field(default=None, min_length=1, max_length=255)
    status: Optional[str] = Field(default=None, pattern="^(published|unlisted)$")


class TargetTemplateAdminOut(BaseModel):
    """靶机模板管理员出参，含 flag 字段。"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: Optional[str]
    difficulty: str
    image: str
    ports: str
    flag: str
    status: str
    created_at: datetime
    updated_at: Optional[datetime]


class TargetTemplateOut(BaseModel):
    """靶机模板学员出参，不含 flag 字段。"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: Optional[str]
    difficulty: str
    image: str
    ports: str
    status: str
    created_at: datetime
