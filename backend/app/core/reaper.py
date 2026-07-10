"""靶机实例超时自动回收。"""

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.docker_scheduler import stop_and_remove
from app.models.instance import TargetInstance


async def reap_expired_instances(db: AsyncSession) -> int:
    """回收所有 status=running 且已过期（expires_at < now）的实例。

    逐个停止并删除容器，更新状态为 stopped；返回回收数量。
    """
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(TargetInstance).where(
            TargetInstance.status == "running",
            TargetInstance.expires_at < now,
        )
    )
    expired = result.scalars().all()

    count = 0
    for instance in expired:
        # 先清理容器，再更新状态；容器清理失败不阻塞状态流转
        if instance.container_id:
            try:
                await stop_and_remove(instance.container_id)
            except Exception:
                pass
        instance.status = "stopped"
        instance.stopped_at = now
        count += 1

    if count:
        await db.commit()
    return count
