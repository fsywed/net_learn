"""后台 reaper：定期清理过期实例（停止容器 + 释放限流）。"""
from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone

from sqlalchemy import select

from app.config import settings
from app.database import session_scope
from app.limiter import limiter
from app.models import InstanceStatus, TargetInstance
from app.scheduler import stop_container

logger = logging.getLogger(__name__)


async def reap_once() -> int:
    """扫描一次过期实例，停止并标记为 stopped。返回处理数量。"""
    now = datetime.now(timezone.utc)
    count = 0
    async with session_scope() as session:
        stmt = select(TargetInstance).where(
            TargetInstance.status.in_([InstanceStatus.running.value, InstanceStatus.starting.value]),
            TargetInstance.expires_at < now,
        )
        res = await session.execute(stmt)
        for inst in res.scalars():
            logger.info("reaper 销毁实例 %s (过期于 %s)", inst.container_name, inst.expires_at)
            await stop_container(inst.container_name)
            inst.status = InstanceStatus.stopped.value
            inst.stopped_at = now
            limiter.release(inst.client_ip)
            count += 1
        await session.commit()
    return count


async def reaper_loop() -> None:
    """长时循环：间隔扫一次。"""
    interval = max(10, settings.REAPER_INTERVAL_SECONDS)
    while True:
        try:
            n = await reap_once()
            if n:
                logger.info("reaper 清理了 %d 个过期实例", n)
        except Exception as exc:  # noqa: BLE001
            logger.exception("reaper 异常: %s", exc)
        await asyncio.sleep(interval)
