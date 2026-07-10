"""健康检查路由。"""

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db

router = APIRouter()


@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    """健康检查：返回服务状态并探测数据库连通性。"""
    status = "ok"
    db_ok = True
    try:
        await db.execute(text("SELECT 1"))
    except Exception:
        db_ok = False
        status = "degraded"

    return {
        "status": status,
        "service": "netlearn-backend",
        "database": "ok" if db_ok else "error",
    }
