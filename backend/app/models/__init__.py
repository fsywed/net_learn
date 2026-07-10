# 数据库模型包，导入各业务模型以注册到 Base.metadata。
from app.models.user import User
from app.models.course import Course, Chapter
from app.models.target import TargetTemplate
from app.models.instance import TargetInstance
from app.models.submission import Submission

__all__ = [
    "User",
    "Course",
    "Chapter",
    "TargetTemplate",
    "TargetInstance",
    "Submission",
]
