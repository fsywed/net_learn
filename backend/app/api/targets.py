"""学员靶机模板查询路由。"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.database import get_db
from app.models.target import TargetTemplate
from app.models.user import User
from app.schemas.target import TargetTemplateOut

router = APIRouter(prefix="/targets", tags=["targets"])


@router.get("/", response_model=list[TargetTemplateOut])
async def list_templates(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """学员查看已上架靶机模板列表（仅 published，不返回 flag）。"""
    result = await db.execute(
        select(TargetTemplate)
        .where(TargetTemplate.status == "published")
        .order_by(TargetTemplate.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{template_id}", response_model=TargetTemplateOut)
async def get_template(
    template_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """学员查看靶机模板详情（仅 published，不返回 flag）。"""
    result = await db.execute(
        select(TargetTemplate).where(
            TargetTemplate.id == template_id,
            TargetTemplate.status == "published",
        )
    )
    template = result.scalar_one_or_none()
    if template is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="靶机模板不存在"
        )
    return template
