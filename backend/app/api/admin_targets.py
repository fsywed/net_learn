"""管理员靶机模板 CRUD 路由。"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import require_admin
from app.database import get_db
from app.models.target import TargetTemplate
from app.models.user import User
from app.schemas.target import (
    TargetTemplateAdminOut,
    TargetTemplateCreateIn,
    TargetTemplateUpdateIn,
)

router = APIRouter(prefix="/admin/targets", tags=["admin-targets"])


async def _get_template_or_404(db: AsyncSession, template_id: int) -> TargetTemplate:
    """按 id 加载靶机模板，不存在则 404。"""
    result = await db.execute(
        select(TargetTemplate).where(TargetTemplate.id == template_id)
    )
    template = result.scalar_one_or_none()
    if template is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="靶机模板不存在"
        )
    return template


@router.get("/", response_model=list[TargetTemplateAdminOut])
async def list_templates(
    status_filter: Optional[str] = Query(default=None, alias="status"),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    """管理员查看靶机模板列表（全部，含 flag，支持可选 status 过滤）。"""
    stmt = select(TargetTemplate).order_by(TargetTemplate.created_at.desc())
    if status_filter is not None:
        stmt = stmt.where(TargetTemplate.status == status_filter)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{template_id}", response_model=TargetTemplateAdminOut)
async def get_template(
    template_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    """管理员查看靶机模板详情（含 flag）。"""
    return await _get_template_or_404(db, template_id)


@router.post(
    "/", response_model=TargetTemplateAdminOut, status_code=status.HTTP_201_CREATED
)
async def create_template(
    payload: TargetTemplateCreateIn,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    """管理员创建靶机模板。"""
    template = TargetTemplate(**payload.model_dump())
    db.add(template)
    await db.commit()
    await db.refresh(template)
    return template


@router.put("/{template_id}", response_model=TargetTemplateAdminOut)
async def update_template(
    template_id: int,
    payload: TargetTemplateUpdateIn,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    """管理员更新靶机模板字段（仅更新提交字段）。"""
    template = await _get_template_or_404(db, template_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(template, field, value)
    await db.commit()
    await db.refresh(template)
    return template


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template(
    template_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    """管理员删除靶机模板。"""
    template = await _get_template_or_404(db, template_id)
    await db.delete(template)
    await db.commit()
