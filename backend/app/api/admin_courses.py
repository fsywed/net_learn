"""管理员课程/章节 CRUD 路由。"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.deps import require_admin
from app.database import get_db
from app.models.course import Chapter, Course
from app.models.user import User
from app.schemas.course import (
    ChapterCreateIn,
    ChapterOut,
    ChapterUpdateIn,
    CourseCreateIn,
    CourseOut,
    CourseUpdateIn,
)

router = APIRouter(prefix="/admin/courses", tags=["admin-courses"])


async def _get_course_or_404(db: AsyncSession, course_id: int) -> Course:
    """按 id 加载课程（含章节概览），不存在则 404。"""
    result = await db.execute(
        select(Course)
        .where(Course.id == course_id)
        .options(selectinload(Course.chapters))
    )
    course = result.scalar_one_or_none()
    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="课程不存在"
        )
    return course


async def _ensure_course_exists(db: AsyncSession, course_id: int) -> None:
    """仅校验课程存在（不加载章节），不存在则 404。"""
    result = await db.execute(select(Course.id).where(Course.id == course_id))
    if result.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="课程不存在"
        )


async def _get_chapter_or_404(db: AsyncSession, chapter_id: int) -> Chapter:
    """按 id 加载章节，不存在则 404。"""
    result = await db.execute(select(Chapter).where(Chapter.id == chapter_id))
    chapter = result.scalar_one_or_none()
    if chapter is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="章节不存在"
        )
    return chapter


@router.post("/", response_model=CourseOut, status_code=status.HTTP_201_CREATED)
async def create_course(
    payload: CourseCreateIn,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    """管理员创建课程。"""
    course = Course(title=payload.title, description=payload.description)
    db.add(course)
    await db.commit()
    # 重新加载以附带章节概览（新建课程章节为空，但保持一致的加载方式）
    return await _get_course_or_404(db, course.id)


@router.put("/{course_id}", response_model=CourseOut)
async def update_course(
    course_id: int,
    payload: CourseUpdateIn,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    """管理员更新课程字段（仅更新提交字段）。"""
    course = await _get_course_or_404(db, course_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(course, field, value)
    await db.commit()
    # expire_on_commit=False，章节概览仍可用，直接返回
    return course


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(
    course_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    """管理员删除课程，章节由数据库 ON DELETE CASCADE 级联删除。"""
    course = await _get_course_or_404(db, course_id)
    await db.delete(course)
    await db.commit()


@router.post(
    "/{course_id}/chapters",
    response_model=ChapterOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_chapter(
    course_id: int,
    payload: ChapterCreateIn,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    """管理员为指定课程创建章节。"""
    # 路径与正文中的 course_id 必须一致
    if payload.course_id != course_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="course_id 与路径不一致",
        )
    await _ensure_course_exists(db, course_id)
    chapter = Chapter(
        course_id=course_id,
        title=payload.title,
        content=payload.content,
        order=payload.order if payload.order is not None else 0,
    )
    db.add(chapter)
    await db.commit()
    await db.refresh(chapter)
    return chapter


@router.put("/chapters/{chapter_id}", response_model=ChapterOut)
async def update_chapter(
    chapter_id: int,
    payload: ChapterUpdateIn,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    """管理员更新章节字段（仅更新提交字段）。"""
    chapter = await _get_chapter_or_404(db, chapter_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(chapter, field, value)
    await db.commit()
    await db.refresh(chapter)
    return chapter


@router.delete("/chapters/{chapter_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chapter(
    chapter_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    """管理员删除章节。"""
    chapter = await _get_chapter_or_404(db, chapter_id)
    await db.delete(chapter)
    await db.commit()
