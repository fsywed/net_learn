"""反向代理：把用户请求转发到对应容器。

每个实例有一个唯一 proxy_token，请求路径形如：
    /api/proxy/{instance_id}/{token}/path

后端通过 host_port 访问容器，并把响应透传回浏览器。
这样：
- 浏览器始终访问后端的 443/8001，不需要开放 30000-40000 端口
- 多个用户可以同时跑靶机互不干扰
- 实例停止后代理 URL 自动失效（404）
"""
from __future__ import annotations

import logging

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models import InstanceStatus, TargetInstance

router = APIRouter(prefix="/proxy", tags=["proxy"])
logger = logging.getLogger(__name__)


async def _proxy(request: Request, instance_id: int, token: str, session: AsyncSession):
    """通用反向代理实现。"""
    inst: TargetInstance | None = await session.get(TargetInstance, instance_id)
    if (
        not inst
        or inst.proxy_token != token
        or inst.status not in (InstanceStatus.running.value, InstanceStatus.starting.value)
    ):
        raise HTTPException(status_code=404, detail="实例不存在或已过期")

    # 容器监听 loopback:host_port（这里我们假设后端与 docker 宿主机共享网络）
    target_url = f"http://127.0.0.1:{inst.host_port}{request.url.path.replace(f'/api/proxy/{instance_id}/{token}', '')}"
    if request.url.query:
        target_url += f"?{request.url.query}"

    # 透传 body（流式）
    body = await request.body()
    headers = {k: v for k, v in request.headers.items() if k.lower() not in {"host", "content-length"}}

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            upstream = client.stream(
                request.method,
                target_url,
                content=body,
                headers=headers,
            )
            r = await upstream.__aenter__()
            return StreamingResponse(
                r.aiter_raw(),
                status_code=r.status_code,
                headers={k: v for k, v in r.headers.items() if k.lower() not in {"content-encoding", "transfer-encoding"}},
                media_type=r.headers.get("content-type"),
            )
    except httpx.RequestError as exc:
        logger.warning("代理失败: %s", exc)
        raise HTTPException(status_code=502, detail=f"靶机不可达: {exc}") from exc


# 透传所有方法
@router.api_route("/{instance_id}/{token}/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"])
async def proxy_with_path(
    request: Request,
    instance_id: int,
    token: str,
    path: str,
    session: AsyncSession = Depends(get_session),
):
    return await _proxy(request, instance_id, token, session)


@router.api_route("/{instance_id}/{token}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"])
async def proxy_root(
    request: Request,
    instance_id: int,
    token: str,
    session: AsyncSession = Depends(get_session),
):
    return await _proxy(request, instance_id, token, session)
