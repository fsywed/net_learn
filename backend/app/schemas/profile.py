"""个人中心相关的 Pydantic 响应模型。"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ProfileOut(BaseModel):
    """学员基本信息出参。"""

    model_config = ConfigDict(from_attributes=True)

    email: str
    role: str
    score: int
    created_at: datetime


class SolvedItem(BaseModel):
    """通关记录条目：模板与难度、通关时间。"""

    template_id: int
    template_name: str
    difficulty: str
    solved_at: datetime


class ActivityItem(BaseModel):
    """最近活动条目：一次 Flag 提交及其正误标记。"""

    type: str
    template_id: int
    template_name: str
    description: str
    created_at: datetime


class ProfileSummary(BaseModel):
    """个人中心汇总：基本信息、通关数、积分、最近通关与活动。"""

    user_info: ProfileOut
    solved_count: int
    score: int
    recent_solved: list[SolvedItem]
    recent_activity: list[ActivityItem]
