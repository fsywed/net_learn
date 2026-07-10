"""Flag 提交与通关记录路由：判定、发分、通关列表。"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.database import get_db
from app.models.submission import Submission
from app.models.target import TargetTemplate
from app.models.user import User
from app.schemas.submission import (
    FlagSubmitIn,
    SubmissionOut,
    SubmitResultOut,
)

router = APIRouter(prefix="/submissions", tags=["submissions"])

# 难度对应积分：easy=10, medium=20, hard=30
DIFFICULTY_SCORE: dict[str, int] = {
    "easy": 10,
    "medium": 20,
    "hard": 30,
}


@router.post(
    "/{template_id}/submit",
    response_model=SubmitResultOut,
)
async def submit_flag(
    template_id: int,
    payload: FlagSubmitIn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """提交 Flag：校验模板、判定、记录提交、首次正确则发分。"""
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

    # 查询该用户是否已通关该模板（已有 is_correct=True 的提交）
    solved_result = await db.execute(
        select(Submission.id).where(
            Submission.user_id == current_user.id,
            Submission.template_id == template_id,
            Submission.is_correct.is_(True),
        )
    )
    if solved_result.scalar_one_or_none() is not None:
        # 已通关：拒绝再次提交，不再发分
        return SubmitResultOut(
            is_correct=True,
            message="该靶机已通关，请勿重复提交",
            score_awarded=0,
            already_solved=True,
        )

    # 比对 Flag：去首尾空白后大小写不敏感比较（训练平台对输入更宽容）
    submitted = (payload.flag or "").strip()
    expected = (template.flag or "").strip()
    is_correct = submitted.lower() == expected.lower()

    # 记录本次提交
    submission = Submission(
        user_id=current_user.id,
        template_id=template_id,
        flag=payload.flag,
        is_correct=is_correct,
    )
    db.add(submission)

    # 首次正确：按难度发分，用 UPDATE ... SET score = score + :delta 避免并发竞态
    score_awarded = 0
    if is_correct:
        score_awarded = DIFFICULTY_SCORE.get(template.difficulty, 0)
        if score_awarded:
            await db.execute(
                update(User)
                .where(User.id == current_user.id)
                .values(score=User.score + score_awarded)
            )

    try:
        await db.commit()
    except Exception:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="提交记录写入失败",
        )

    message = "Flag 正确，通关成功" if is_correct else "Flag 错误，请重试"
    return SubmitResultOut(
        is_correct=is_correct,
        message=message,
        score_awarded=score_awarded,
        already_solved=False,
    )


@router.get("/solved", response_model=list[SubmissionOut])
async def list_solved(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """我的通关记录：当前用户 is_correct=True 的提交，按提交时间倒序。"""
    result = await db.execute(
        select(Submission, TargetTemplate.name)
        .join(TargetTemplate, Submission.template_id == TargetTemplate.id)
        .where(
            Submission.user_id == current_user.id,
            Submission.is_correct.is_(True),
        )
        .order_by(Submission.created_at.desc())
    )
    rows = result.all()
    return [
        SubmissionOut(
            id=sub.id,
            user_id=sub.user_id,
            template_id=sub.template_id,
            is_correct=sub.is_correct,
            created_at=sub.created_at,
            template_name=name,
        )
        for sub, name in rows
    ]
