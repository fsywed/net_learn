"""用户相关的 Pydantic 请求/响应模型。"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRegisterIn(BaseModel):
    """注册入参：邮箱与密码。"""

    email: EmailStr
    password: str = Field(min_length=6, max_length=64)


class LoginIn(BaseModel):
    """登录入参：邮箱与密码。"""

    email: EmailStr
    password: str


class UserOut(BaseModel):
    """用户信息出参（不含敏感字段）。"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    role: str
    status: str
    score: int
    created_at: datetime


class TokenOut(BaseModel):
    """登录/注册成功后返回的令牌。"""

    access_token: str
    token_type: str = "bearer"
    role: str
