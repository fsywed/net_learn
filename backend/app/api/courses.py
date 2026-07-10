"""学员课程查询路由。"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.deps import get_current_user
from app.database import get_db
from app.models.course import Chapter, Course
from app.models.user import User
from app.schemas.course import ChapterOut, CourseOut

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("/", response_model=list[CourseOut])
async def list_courses(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """学员查看已发布课程列表（含章节概览）。"""
    result = await db.execute(
        select(Course)
        .where(Course.status == "published")
        .options(selectinload(Course.chapters))
        .order_by(Course.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{course_id}", response_model=CourseOut)
async def get_course(
    course_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """学员查看课程详情（仅已发布）。"""
    result = await db.execute(
        select(Course)
        .where(Course.id == course_id, Course.status == "published")
        .options(selectinload(Course.chapters))
    )
    course = result.scalar_one_or_none()
    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="课程不存在"
        )
    return course


@router.get("/{course_id}/chapters/{chapter_id}", response_model=ChapterOut)
async def get_chapter(
    course_id: int,
    chapter_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """学员查看章节详情（含 Markdown 原文，仅限已发布课程）。"""
    result = await db.execute(
        select(Chapter)
        .join(Course, Chapter.course_id == Course.id)
        .where(
            Chapter.id == chapter_id,
            Chapter.course_id == course_id,
            Course.status == "published",
        )
    )
    chapter = result.scalar_one_or_none()
    if chapter is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="章节不存在"
        )
    return chapter
