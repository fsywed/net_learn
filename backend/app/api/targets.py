"""靶机模板列表 API（公开）。"""
from __future__ import annotations

from fastapi import APIRouter

from app.schemas import TargetListResponse, TargetTemplateOut
from app.templates import list_templates

router = APIRouter(prefix="/targets", tags=["targets"])


@router.get("", response_model=TargetListResponse)
async def list_target_templates() -> TargetListResponse:
    """列出所有可启动的靶机模板。"""
    items = [
        TargetTemplateOut(
            id=t.id,
            name=t.name,
            description=t.description,
            difficulty=t.difficulty,
            category=t.category,
            skills=t.skills,
            learn_points=t.learn_points,
            container_port=t.container_port,
        )
        for t in list_templates()
    ]
    return TargetListResponse(items=items)
