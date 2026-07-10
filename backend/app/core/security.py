"""安全工具：密码哈希与 JWT 签发/解析。"""

from datetime import datetime, timedelta, timezone

from jose import jwt
from passlib.context import CryptContext

from app.config import settings

# bcrypt 哈希上下文，集中一处供 auth 与 bootstrap 复用
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(user) -> str:
    """为指定用户签发 JWT，payload 包含 sub(用户id)、role、exp。"""
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXP_MINUTES)
    payload = {
        "sub": str(user.id),
        "role": user.role,
        "exp": expire,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALG)


def decode_token(token: str) -> dict:
    """解析并校验 JWT，返回 payload 字典。"""
    return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
