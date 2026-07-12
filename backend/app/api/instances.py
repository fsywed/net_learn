"""实例生命周期 API：启动、查询、停止。"""
from __future__ import annotations

import secrets
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.deps import get_client_ip
from app.limiter import limiter
from app.models import InstanceStatus, TargetInstance
from app.scheduler import start_target, stop_container
from app.schemas import InstanceOut, SpawnRequest
from app.templates import get_template

router = APIRouter(prefix="/instances", tags=["instances"])


def _to_out(inst: TargetInstance) -> InstanceOut:
    """DB 记录转 Pydantic 输出。"""
    now = datetime.now(timezone.utc)
    # SQLite 返回 naive datetime，需要统一为 aware
    exp = inst.expires_at
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    remaining = max(0, int((exp - now).total_seconds()))
    return InstanceOut(
        id=inst.id,
        template_id=inst.template_id,
        template_name=get_template(inst.template_id).name if get_template(inst.template_id) else "未知",
        status=inst.status,
        host_port=inst.host_port,
        container_port=inst.container_port,
        proxy_url=f"/api/proxy/{inst.id}/{inst.proxy_token}/",
        expires_at=inst.expires_at,
        remaining_seconds=remaining,
    )


@router.post("/spawn", response_model=InstanceOut)
async def spawn_instance(
    req: SpawnRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
) -> InstanceOut:
    """启动一个新的靶机实例。

    - IP 限流：每个 IP 最多同时跑 2 个实例
    - 动态端口：从配置范围随机选
    - 动态 Flag：每次启动都不同
    """
    client_ip = get_client_ip(request)

    if not limiter.can_spawn(client_ip):
        raise HTTPException(status_code=429, detail="已达同时运行实例上限，请先停止其他实例")

    template = get_template(req.template_id)
    if not template:
        raise HTTPException(status_code=404, detail="靶机模板不存在")

    proxy_token = secrets.token_urlsafe(16)
    try:
        info = await start_target(template, client_ip=client_ip, proxy_token=proxy_token)
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    inst = TargetInstance(
        template_id=template.id,
        container_id=info["container_id"],
        container_name=info["container_name"],
        host_port=info["host_port"],
        container_port=info["container_port"],
        status=InstanceStatus.running.value,
        flag=info["flag"],
        client_ip=client_ip,
        proxy_token=proxy_token,
        expires_at=info["expires_at"],
    )
    session.add(inst)
    await session.commit()
    await session.refresh(inst)

    limiter.acquire(client_ip)
    return _to_out(inst)


@router.get("/{instance_id}", response_model=InstanceOut)
async def get_instance(
    instance_id: int,
    request: Request,
    session: AsyncSession = Depends(get_session),
) -> InstanceOut:
    """查询实例状态（用于前端倒计时刷新）。"""
    client_ip = get_client_ip(request)
    inst = await session.get(TargetInstance, instance_id)
    if not inst or inst.client_ip != client_ip:
        raise HTTPException(status_code=404, detail="实例不存在")
    return _to_out(inst)


@router.delete("/{instance_id}", response_model=InstanceOut)
async def destroy_instance(
    instance_id: int,
    request: Request,
    session: AsyncSession = Depends(get_session),
) -> InstanceOut:
    """用户主动停止实例。"""
    client_ip = get_client_ip(request)
    inst = await session.get(TargetInstance, instance_id)
    if not inst or inst.client_ip != client_ip:
        raise HTTPException(status_code=404, detail="实例不存在")
    if inst.status == InstanceStatus.running.value:
        await stop_container(inst.container_name, inst.host_port)
        inst.status = InstanceStatus.stopped.value
        await session.commit()
    limiter.release(client_ip)
    return _to_out(inst)


@router.get("", response_model=list[InstanceOut])
async def list_my_instances(
    request: Request,
    session: AsyncSession = Depends(get_session),
) -> list[InstanceOut]:
    """列出当前 IP 正在运行的实例。"""
    client_ip = get_client_ip(request)
    stmt = select(TargetInstance).where(
        TargetInstance.client_ip == client_ip,
        TargetInstance.status.in_([InstanceStatus.starting.value, InstanceStatus.running.value]),
    )
    res = await session.execute(stmt)
    return [_to_out(i) for i in res.scalars()]
