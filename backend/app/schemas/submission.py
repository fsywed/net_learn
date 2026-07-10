"""Flag 提交相关的 Pydantic 请求/响应模型。"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class FlagSubmitIn(BaseModel):
    """提交 Flag 的请求体。"""

    flag: str = Field(..., description="学员提交的 Flag")


class SubmissionOut(BaseModel):
    """提交记录出参；通关列表场景下附带 template_name。"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    template_id: int
    is_correct: bool
    created_at: datetime
    # 通关列表 join 模板名称时填充
    template_name: Optional[str] = None


class SubmitResultOut(BaseModel):
    """提交结果：判定、提示、本次得分、是否此前已通关。"""

    is_correct: bool
    message: str
    score_awarded: int
    already_solved: bool
