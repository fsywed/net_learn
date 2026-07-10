"""管理员统计路由：全局概览与通关排行榜。"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import require_admin
from app.database import get_db
from app.models.instance import TargetInstance
from app.models.submission import Submission
from app.models.target import TargetTemplate
from app.models.user import User

router = APIRouter(prefix="/admin/stats", tags=["admin-stats"])


class OverviewOut(BaseModel):
    """全局统计概览。

    字段命名与前端 OverviewStats 契约保持一致，避免管理后台统计卡片取不到值。
    """

    users_total: int
    students: int
    admins: int
    targets_total: int
    targets_published: int
    instances_total: int
    instances_running: int
    submissions_total: int
    solved_total: int


class LeaderboardItem(BaseModel):
    """通关排行榜条目。"""

    user_id: int
    email: str
    solved_count: int
    score: int


@router.get("/overview", response_model=OverviewOut)
async def get_overview(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    """全局统计：用户、模板、实例、提交概览。"""
    # 用户统计：总数 / 学员数 / 管理员数
    user_total, student_count, admin_count = (
        await db.execute(
            select(
                func.count(User.id),
                func.count(User.id).filter(User.role == "student"),
                func.count(User.id).filter(User.role == "admin"),
            )
        )
    ).one()

    # 模板统计：总数 / 已上架数
    template_total, published_count = (
        await db.execute(
            select(
                func.count(TargetTemplate.id),
                func.count(TargetTemplate.id).filter(
                    TargetTemplate.status == "published"
                ),
            )
        )
    ).one()

    # 实例统计：总数 / 运行中数
    instance_total, running_count = (
        await db.execute(
            select(
                func.count(TargetInstance.id),
                func.count(TargetInstance.id).filter(
                    TargetInstance.status == "running"
                ),
            )
        )
    ).one()

    # 提交统计：总数 / 通关总数
    submission_total, solved_total = (
        await db.execute(
            select(
                func.count(Submission.id),
                func.count(Submission.id).filter(Submission.is_correct.is_(True)),
            )
        )
    ).one()

    return OverviewOut(
        users_total=user_total,
        students=student_count,
        admins=admin_count,
        targets_total=template_total,
        targets_published=published_count,
        instances_total=instance_total,
        instances_running=running_count,
        submissions_total=submission_total,
        solved_total=solved_total,
    )


@router.get("/leaderboard", response_model=list[LeaderboardItem])
async def get_leaderboard(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    """通关排行榜：按通关数 + 积分排序的前 20 名学员。"""
    # 按用户聚合通关数（仅学员、仅正确提交），先按通关数再按积分倒序
    solved_count_col = func.count(Submission.id).label("solved_count")
    rows = (
        await db.execute(
            select(User.id, User.email, User.score, solved_count_col)
            .join(Submission, Submission.user_id == User.id)
            .where(User.role == "student", Submission.is_correct.is_(True))
            .group_by(User.id, User.email, User.score)
            .order_by(solved_count_col.desc(), User.score.desc())
            .limit(20)
        )
    ).all()

    return [
        LeaderboardItem(
            user_id=uid,
            email=email,
            solved_count=cnt,
            score=score,
        )
        for uid, email, score, cnt in rows
    ]
