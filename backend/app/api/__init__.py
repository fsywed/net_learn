"""API 路由聚合模块。"""

from fastapi import APIRouter

from app.api import (
    auth,
    health,
    courses,
    admin_courses,
    targets,
    admin_targets,
    instances,
    submissions,
    profile,
    admin_stats,
    admin_users,
)

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router)
api_router.include_router(courses.router, tags=["courses"])
api_router.include_router(admin_courses.router, tags=["admin-courses"])
api_router.include_router(targets.router, tags=["targets"])
api_router.include_router(admin_targets.router, tags=["admin-targets"])
api_router.include_router(instances.router, tags=["instances"])
api_router.include_router(submissions.router, tags=["submissions"])
api_router.include_router(profile.router, tags=["profile"])
api_router.include_router(admin_stats.router, tags=["admin-stats"])
api_router.include_router(admin_users.router, tags=["admin-users"])
