"""API Schemas：Pydantic v2 输入输出模型。"""
from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class TargetTemplateOut(BaseModel):
    id: int
    name: str
    description: str
    difficulty: str
    category: str
    skills: List[str]
    learn_points: List[str]
    container_port: int


class TargetListResponse(BaseModel):
    items: List[TargetTemplateOut]


class SpawnRequest(BaseModel):
    template_id: int = Field(..., ge=1)


class InstanceOut(BaseModel):
    id: int
    template_id: int
    template_name: str
    status: str
    host_port: int
    container_port: int
    proxy_url: str  # 完整可访问的 URL（含 /proxy/{id}/{token}/ 前缀）
    expires_at: datetime
    remaining_seconds: int


class FlagSubmission(BaseModel):
    instance_id: int
    flag: str = Field(..., min_length=8, max_length=128)


class FlagResult(BaseModel):
    correct: bool
    message: str
