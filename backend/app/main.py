"""FastAPI 入口。"""
from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import instances, proxy, submissions, targets
from app.config import settings
from app.database import engine
from app.models import Base
from app.reaper import reaper_loop

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """启动时建表 + 启 reaper；关闭时取消。"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    task = asyncio.create_task(reaper_loop())
    logger.info("服务启动，reaper 已运行")
    try:
        yield
    finally:
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass


app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    # 暴露给前端
    expose_headers=["*"],
)

# 路由
app.include_router(targets.router, prefix="/api")
app.include_router(instances.router, prefix="/api")
app.include_router(submissions.router, prefix="/api")
app.include_router(proxy.router, prefix="/api")


@app.get("/api/health")
async def health() -> dict:
    return {"status": "ok", "service": settings.APP_NAME}
