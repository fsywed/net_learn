"""应用配置：环境变量驱动的 Pydantic Settings。

Fly.io / Docker 部署下用环境变量注入；本地开发用 .env 文件。
"""
from __future__ import annotations

import secrets
from typing import List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """全局配置：DATABASE_URL/DOCKER_* 来自环境变量，缺省走本地 SQLite + 本机 Docker。"""

    # 服务
    APP_NAME: str = "netlearn-backend"
    APP_ENV: str = "development"
    PUBLIC_BASE_URL: str = "http://localhost:8001"  # 对外暴露的访问入口，代理用
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "https://fsywed.github.io",
    ]

    # 数据库：默认本地 SQLite；Fly.io 部署用 postgres
    DATABASE_URL: str = "sqlite+aiosqlite:///./netlearn.db"

    # Docker
    DOCKER_HOST: str = ""  # 空 = 默认本地 socket；Fly 部署用 unix:///var/run/docker.sock
    TARGET_IMAGE_PREFIX: str = "netlearn/"  # 靶机镜像前缀
    TARGET_PORT_RANGE_START: int = 30000
    TARGET_PORT_RANGE_END: int = 40000
    TARGET_DEFAULT_TTL_SECONDS: int = 1800  # 默认 30 分钟
    TARGET_MAX_PER_IP: int = 2  # 每 IP 同时运行上限

    # 模拟模式：Docker 不可用时用内嵌 HTTP 服务模拟靶机（HF Spaces 等无 Docker 环境）
    SIMULATION_MODE: str = "auto"  # auto / on / off

    # Flag
    FLAG_PREFIX: str = "flag{"
    FLAG_SUFFIX: str = "}"

    # 调度：reaper 检查间隔
    REAPER_INTERVAL_SECONDS: int = 30

    # 安全
    SECRET_KEY: str = Field(default_factory=lambda: secrets.token_urlsafe(32))

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def _split_csv(cls, v):
        if isinstance(v, str):
            return [s.strip() for s in v.split(",") if s.strip()]
        return v


settings = Settings()
