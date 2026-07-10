"""管理员用户管理路由：列表、详情、改状态、改角色。"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import require_admin
from app.database import get_db
from app.models.user import User
from app.schemas.admin_user import (
    AdminUserOut,
    UserListOut,
    UserRoleUpdateIn,
    UserStatusUpdateIn,
)

router = APIRouter(prefix="/admin/users", tags=["admin-users"])


async def _get_user_or_404(db: AsyncSession, user_id: int) -> User:
    """按 id 加载用户，不存在则 404。"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在"
        )
    return user


@router.get("/", response_model=UserListOut)
async def list_users(
    role: Optional[str] = Query(default=None),
    status_filter: Optional[str] = Query(default=None, alias="status"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    """用户列表，支持 role / status 过滤与分页，返回 items + total。"""
    # 基础查询与计数查询共用过滤条件
    base = select(User)
    if role is not None:
        base = base.where(User.role == role)
    if status_filter is not None:
        base = base.where(User.status == status_filter)

    # 总数
    total = (
        await db.execute(select(func.count()).select_from(base.subquery()))
    ).scalar_one()

    # 分页数据：按创建时间倒序，limit/offset
    offset = (page - 1) * page_size
    rows = (
        await db.execute(
            base.order_by(User.created_at.desc()).limit(page_size).offset(offset)
        )
    ).scalars().all()

    return UserListOut(items=rows, total=total)


@router.get("/{user_id}", response_model=AdminUserOut)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    """用户详情。"""
    return await _get_user_or_404(db, user_id)


@router.put("/{user_id}/status", response_model=AdminUserOut)
async def update_user_status(
    user_id: int,
    payload: UserStatusUpdateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """更新用户状态（active / disabled）。

    安全校验：
    - 不能禁用自己，避免误锁；
    - 不能禁用最后一个活跃管理员，避免系统无可用管理员。
    """
    # 不能禁用自己（对自身的任何状态变更都不允许，杜绝自锁）
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="不能修改自己的状态"
        )

    user = await _get_user_or_404(db, user_id)

    # 禁用管理员时，确保仍存在其他活跃管理员
    if user.role == "admin" and payload.status == "disabled":
        active_admin_count = (
            await db.execute(
                select(func.count(User.id)).where(
                    User.role == "admin", User.status == "active"
                )
            )
        ).scalar_one()
        if active_admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="不能禁用最后一个活跃管理员",
            )

    user.status = payload.status
    await db.commit()
    await db.refresh(user)
    return user


@router.put("/{user_id}/role", response_model=AdminUserOut)
async def update_user_role(
    user_id: int,
    payload: UserRoleUpdateIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """更新用户角色（student / admin）。

    安全校验：不能降级自己，避免管理员误将自己降级导致锁出。
    """
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="不能修改自己的角色"
        )

    user = await _get_user_or_404(db, user_id)
    user.role = payload.role
    await db.commit()
    await db.refresh(user)
    return user
