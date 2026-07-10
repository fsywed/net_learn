"""学员靶机实例调度路由：启动、销毁、列表、详情。"""

import json
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.deps import get_current_user
from app.core.docker_scheduler import (
    build_container_name,
    create_container,
    stop_and_remove,
)
from app.database import get_db
from app.models.instance import TargetInstance
from app.models.target import TargetTemplate
from app.models.user import User
from app.schemas.instance import InstanceOut, InstanceStartOut

router = APIRouter(prefix="/instances", tags=["instances"])


def _parse_template_ports(ports: str) -> list[int]:
    """把模板 ports 字符串（如 "80,22"）解析为整数列表。"""
    result: list[int] = []
    for chunk in ports.split(","):
        chunk = chunk.strip()
        if chunk:
            try:
                result.append(int(chunk))
            except ValueError:
                continue
    return result


async def _get_instance_or_404(
    db: AsyncSession, instance_id: int
) -> TargetInstance:
    """按 id 加载实例，不存在则 404。"""
    result = await db.execute(
        select(TargetInstance).where(TargetInstance.id == instance_id)
    )
    instance = result.scalar_one_or_none()
    if instance is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="靶机实例不存在"
        )
    return instance


async def _record_error_instance(
    db: AsyncSession,
    user_id: int,
    template_id: int,
    container_id: Optional[str] = None,
    host_port: Optional[int] = None,
    container_ports: Optional[str] = None,
) -> None:
    """启动失败时写入一条 status=error 的实例留痕（best-effort，写入失败仅回滚）。"""
    err = TargetInstance(
        user_id=user_id,
        template_id=template_id,
        container_id=container_id,
        host_port=host_port,
        container_ports=container_ports,
        status="error",
        expires_at=datetime.now(timezone.utc),
    )
    db.add(err)
    try:
        await db.commit()
    except Exception:
        await db.rollback()


@router.get("/", response_model=list[InstanceOut])
async def list_instances(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """我的实例列表（当前用户的全部实例，按创建时间倒序）。"""
    result = await db.execute(
        select(TargetInstance)
        .where(TargetInstance.user_id == current_user.id)
        .order_by(TargetInstance.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{instance_id}", response_model=InstanceOut)
async def get_instance(
    instance_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """实例详情（校验归属当前用户）。"""
    instance = await _get_instance_or_404(db, instance_id)
    if instance.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="无权查看该实例"
        )
    return instance


@router.post(
    "/{template_id}/start",
    response_model=InstanceStartOut,
    status_code=status.HTTP_201_CREATED,
)
async def start_instance(
    template_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """启动靶机：校验模板与配额，调度 Docker 创建容器并写入实例记录。"""
    # 校验模板存在且已上架
    result = await db.execute(
        select(TargetTemplate).where(
            TargetTemplate.id == template_id,
            TargetTemplate.status == "published",
        )
    )
    template = result.scalar_one_or_none()
    if template is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="靶机模板不存在或未上架"
        )

    # 校验该用户运行中实例数未超配额
    running_count = await db.execute(
        select(func.count(TargetInstance.id)).where(
            TargetInstance.user_id == current_user.id,
            TargetInstance.status == "running",
        )
    )
    if (running_count.scalar() or 0) >= settings.INSTANCE_MAX_PER_USER:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="已达实例配额上限，请先停止已有实例",
        )

    container_ports = _parse_template_ports(template.ports)
    if not container_ports:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="靶机模板未配置有效端口",
        )

    # 查询已占用主机端口，供调度器分配时避开
    used_result = await db.execute(
        select(TargetInstance.host_port).where(TargetInstance.status == "running")
    )
    used_host_ports = {row[0] for row in used_result.all()}

    container_name = build_container_name(current_user.id, template_id)
    try:
        info = await create_container(
            template.image,
            container_ports,
            container_name,
            used_host_ports=used_host_ports,
        )
    except Exception:
        # 调度失败：半成品容器已在调度器内清理；记录 error 实例留痕并返回 500
        await _record_error_instance(db, current_user.id, template_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="靶机启动失败，请稍后重试",
        )

    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=settings.INSTANCE_TTL_MINUTES)
    port_map_json = json.dumps({str(c): h for c, h in info["port_map"].items()})

    instance = TargetInstance(
        user_id=current_user.id,
        template_id=template_id,
        container_id=info["container_id"],
        host_port=info["host_port"],
        container_ports=port_map_json,
        status="running",
        expires_at=expires_at,
    )
    db.add(instance)
    try:
        await db.commit()
    except Exception:
        # DB 写入失败：回滚并清理已启动的容器
        await db.rollback()
        await stop_and_remove(info["container_id"])
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="实例记录写入失败，已回滚",
        )
    await db.refresh(instance)

    remaining = int((expires_at - now).total_seconds())
    return InstanceStartOut(
        instance=InstanceOut.model_validate(instance),
        access_host="localhost",
        access_port=info["host_port"],
        expires_at=expires_at,
        remaining_seconds=remaining,
    )


@router.delete("/{instance_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_instance(
    instance_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """销毁靶机（校验归属当前用户），停止并删除容器，更新状态为 stopped。"""
    instance = await _get_instance_or_404(db, instance_id)
    if instance.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="无权操作该实例"
        )

    # 调用 Docker 清理容器；清理失败不阻塞状态更新
    if instance.container_id:
        try:
            await stop_and_remove(instance.container_id)
        except Exception:
            pass

    instance.status = "stopped"
    instance.stopped_at = datetime.now(timezone.utc)
    await db.commit()
