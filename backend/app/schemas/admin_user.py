"""管理员视角的用户相关 Pydantic 模型。"""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr


class AdminUserOut(BaseModel):
    """管理员视角的用户信息（与 UserOut 字段一致，单独定义以解耦演进）。"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    role: str
    status: str
    score: int
    created_at: datetime


class UserStatusUpdateIn(BaseModel):
    """更新用户状态入参：active / disabled。"""

    status: Literal["active", "disabled"]


class UserRoleUpdateIn(BaseModel):
    """更新用户角色入参：student / admin。"""

    role: Literal["student", "admin"]


class UserListOut(BaseModel):
    """用户分页列表响应：items + total。"""

    items: list[AdminUserOut]
    total: int
