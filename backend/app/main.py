"""FastAPI 应用入口。

注册 CORS、路由前缀（/api）、生命周期（建表与管理员引导）。
"""

import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import api_router
from app.core.bootstrap import ensure_admin_bootstrap
from app.core.seed import seed_demo_data
from app.database import async_session_factory, engine
from app.models.base import Base


async def _reaper_loop() -> None:
    """后台循环：每 60 秒回收过期靶机实例。"""
    # 延迟导入 reaper，保持 main 模块导入图精简
    from app.core.reaper import reap_expired_instances

    while True:
        try:
            # 每轮获取独立 db session
            async with async_session_factory() as session:
                await reap_expired_instances(session)
        except Exception:
            # 单次回收异常不应终止后台循环
            pass
        await asyncio.sleep(60)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期：启动时建表、引导管理员账号并启动超时回收后台任务。"""
    # 开发期简化：直接创建所有业务表；生产环境应使用 alembic 迁移
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # 创建默认管理员账号（若不存在）
    async with async_session_factory() as session:
        await ensure_admin_bootstrap(session)
        # 插入演示数据（示例课程、章节与靶机模板），按名称幂等
        await seed_demo_data(session)
    # 启动靶机实例超时自动回收后台任务
    reaper_task = asyncio.create_task(_reaper_loop())
    yield
    # 优雅关闭：取消回收后台任务
    reaper_task.cancel()
    try:
        await reaper_task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title="NetLearn API",
    description="在线网络安全学习平台后端接口",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS：开发环境允许前端开发服务器跨域访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 所有业务路由统一挂在 /api 前缀下
app.include_router(api_router, prefix="/api")
