"""应用配置模块。

使用 pydantic-settings 从环境变量加载配置，所有可配置项集中在此处。
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """全局配置项，字段与对应的环境变量同名。"""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # 数据库与缓存
    DATABASE_URL: str = "postgresql+asyncpg://netlearn:netlearn@db:5432/netlearn"
    REDIS_URL: str = "redis://redis:6379/0"

    # JWT 鉴权
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALG: str = "HS256"
    JWT_EXP_MINUTES: int = 1440

    # 靶机调度（Docker）
    DOCKER_HOST: str | None = None

    # 实例配额与生命周期
    INSTANCE_MAX_PER_USER: int = 1
    INSTANCE_TTL_MINUTES: int = 60

    # 主机端口分配范围（靶机端口映射）
    HOST_PORT_RANGE_START: int = 30000
    HOST_PORT_RANGE_END: int = 30100

    # 管理员引导账号
    ADMIN_BOOTSTRAP_EMAIL: str = "admin@netlearn.local"
    ADMIN_BOOTSTRAP_PASSWORD: str = "admin123456"


@lru_cache
def get_settings() -> Settings:
    """返回单例 Settings，避免重复解析环境变量。"""
    return Settings()


settings = get_settings()
