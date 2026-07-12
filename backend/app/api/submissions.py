"""Flag 提交与校验。"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.deps import get_client_ip
from app.limiter import limiter
from app.models import TargetInstance
from app.schemas import FlagResult, FlagSubmission

router = APIRouter(prefix="/submissions", tags=["submissions"])


@router.post("", response_model=FlagResult)
async def submit_flag(
    sub: FlagSubmission,
    request: Request,
    session: AsyncSession = Depends(get_session),
) -> FlagResult:
    """校验 Flag。

    安全：
    - 只允许 IP 归属者提交（避免横向爆破）
    - 提交频率限流
    - 不返回正确 Flag，避免枚举
    """
    client_ip = get_client_ip(request)
    if not limiter.can_submit(client_ip):
        raise HTTPException(status_code=429, detail="提交过于频繁，请稍后再试")

    inst = await session.get(TargetInstance, sub.instance_id)
    if not inst or inst.client_ip != client_ip:
        raise HTTPException(status_code=404, detail="实例不存在")

    limiter.record_submit(client_ip)

    if sub.flag.strip() == inst.flag:
        return FlagResult(correct=True, message="Flag 正确！")
    return FlagResult(correct=False, message="Flag 错误，再试一次")
