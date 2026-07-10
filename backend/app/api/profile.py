"""学员个人中心路由：汇总信息、最近通关、最近活动。"""

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.database import get_db
from app.models.submission import Submission
from app.models.target import TargetTemplate
from app.models.user import User
from app.schemas.profile import (
    ActivityItem,
    ProfileOut,
    ProfileSummary,
    SolvedItem,
)

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/", response_model=ProfileSummary)
async def get_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """个人中心汇总：基本信息、通关数、最近通关（10 条）、最近活动（20 条）。"""
    user_info = ProfileOut.model_validate(current_user)

    # 通关数：该用户 is_correct=True 的提交数量
    solved_count = (
        await db.execute(
            select(func.count(Submission.id)).where(
                Submission.user_id == current_user.id,
                Submission.is_correct.is_(True),
            )
        )
    ).scalar_one()

    # 最近通关记录（最多 10 条，含模板名称与难度）
    recent_solved_rows = (
        await db.execute(
            select(Submission, TargetTemplate.name, TargetTemplate.difficulty)
            .join(TargetTemplate, Submission.template_id == TargetTemplate.id)
            .where(
                Submission.user_id == current_user.id,
                Submission.is_correct.is_(True),
            )
            .order_by(Submission.created_at.desc())
            .limit(10)
        )
    ).all()
    recent_solved = [
        SolvedItem(
            template_id=sub.template_id,
            template_name=name,
            difficulty=difficulty,
            solved_at=sub.created_at,
        )
        for sub, name, difficulty in recent_solved_rows
    ]

    # 最近活动（最近 20 条提交，含模板名称与正误标记）
    recent_activity_rows = (
        await db.execute(
            select(Submission, TargetTemplate.name)
            .join(TargetTemplate, Submission.template_id == TargetTemplate.id)
            .where(Submission.user_id == current_user.id)
            .order_by(Submission.created_at.desc())
            .limit(20)
        )
    ).all()
    recent_activity = [
        ActivityItem(
            type="solve" if sub.is_correct else "attempt",
            template_id=sub.template_id,
            template_name=name,
            description="Flag 正确，通关" if sub.is_correct else "Flag 错误",
            created_at=sub.created_at,
        )
        for sub, name in recent_activity_rows
    ]

    return ProfileSummary(
        user_info=user_info,
        solved_count=solved_count,
        score=current_user.score,
        recent_solved=recent_solved,
        recent_activity=recent_activity,
    )
