"""管理员引导：首次启动时确保存在一个 admin 账号。"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.security import pwd_context
from app.models.user import User


async def ensure_admin_bootstrap(db: AsyncSession) -> None:
    """若 users 表不存在 admin 角色用户，则按配置创建一个。"""
    result = await db.execute(select(User).where(User.role == "admin").limit(1))
    if result.scalar_one_or_none() is not None:
        return

    admin = User(
        email=settings.ADMIN_BOOTSTRAP_EMAIL,
        password_hash=pwd_context.hash(settings.ADMIN_BOOTSTRAP_PASSWORD),
        role="admin",
        status="active",
        score=0,
    )
    db.add(admin)
    await db.commit()
