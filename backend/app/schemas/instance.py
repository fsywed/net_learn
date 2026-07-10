"""靶机实例相关的 Pydantic 请求/响应模型。"""

import json
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator


class InstanceOut(BaseModel):
    """靶机实例出参（全部字段，不含 flag；container_ports 解析为可读映射）。"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    template_id: int
    container_id: Optional[str] = None
    host_port: Optional[int] = None
    container_ports: dict
    status: str
    expires_at: datetime
    created_at: datetime
    stopped_at: Optional[datetime] = None

    @field_validator("container_ports", mode="before")
    @classmethod
    def _parse_container_ports(cls, v):
        """把数据库中的 JSON 字符串解析为可读字典映射。"""
        if isinstance(v, str):
            try:
                return json.loads(v)
            except (ValueError, TypeError):
                return {}
        return v or {}


class InstanceStartOut(BaseModel):
    """启动靶机后的响应：实例信息 + 访问地址 + 过期时间 + 剩余秒数。"""

    instance: InstanceOut
    access_host: str
    access_port: int
    expires_at: datetime
    remaining_seconds: int
