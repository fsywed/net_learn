"""数据库会话与引擎初始化。

基于 SQLAlchemy 2.0 异步引擎 + asyncpg 驱动，提供 AsyncSession 工厂与 FastAPI 依赖。
"""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.config import settings

# 异步引擎，pool_pre_ping 避免使用已断开的连接
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
)

# 会话工厂
async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI 依赖：提供数据库会话并在请求结束后关闭。"""
    async with async_session_factory() as session:
        yield session
