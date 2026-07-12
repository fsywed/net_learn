"""Docker 调度器：在宿主机上 spawn / stop 容器。

要求：运行后端的机器上装了 Docker daemon，进程有挂载 docker.sock 的权限。
Fly.io 部署时通过 `fly machine exec` 或 `fly mounts` 共享宿主 docker.sock。
"""
from __future__ import annotations

import logging
import random
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

import docker
from docker.errors import APIError, NotFound

from app.config import settings
from app.templates import TargetTemplate

logger = logging.getLogger(__name__)

_client: Optional[docker.DockerClient] = None


def get_client() -> docker.DockerClient:
    """懒加载 Docker client；连接失败抛 RuntimeError。"""
    global _client
    if _client is not None:
        return _client
    try:
        _client = docker.DockerClient(base_url=settings.DOCKER_HOST or None)
        # 主动 ping 一下确认可达
        _client.ping()
        logger.info("Docker client connected: %s", settings.DOCKER_HOST or "default")
    except Exception as exc:  # noqa: BLE001
        logger.error("Docker 连接失败: %s", exc)
        raise RuntimeError(f"Docker 不可用: {exc}") from exc
    return _client


def _rand_port() -> int:
    """从配置的端口范围随机选一个。"""
    return random.randint(settings.TARGET_PORT_RANGE_START, settings.TARGET_PORT_RANGE_END)


def _rand_flag(template: TargetTemplate) -> str:
    """生成动态 Flag：包含模板 id 和 8 位随机串。"""
    suffix = secrets.token_hex(6)
    return f"{settings.FLAG_PREFIX}t{template.id}_{suffix}{settings.FLAG_SUFFIX}"


async def start_target(
    template: TargetTemplate,
    client_ip: str,
    proxy_token: str,
) -> dict:
    """启动一个靶机容器，返回实例元数据。

    Raises:
        RuntimeError: 镜像拉取失败、容器创建失败等
    """
    client = get_client()
    host_port = _rand_port()
    flag = _rand_flag(template)
    name = f"netlearn-tpl{template.id}-{secrets.token_hex(4)}"

    # 拉镜像（失败回退本地存在的镜像）
    try:
        client.images.pull(template.image)
    except Exception as exc:  # noqa: BLE001
        logger.warning("拉取镜像 %s 失败，尝试本地：%s", template.image, exc)

    # 启动容器
    try:
        container = client.containers.run(
            image=template.image,
            name=name,
            detach=True,
            environment={
                "FLAG": flag,
                "PROXY_TOKEN": proxy_token,
            },
            ports={f"{template.container_port}/tcp": host_port},
            labels={
                "netlearn.target": "1",
                "netlearn.template_id": str(template.id),
                "netlearn.flag": flag,  # 镜像内的启动脚本可以读到
            },
            restart_policy={"Name": "no"},
        )
    except APIError as exc:
        raise RuntimeError(f"启动容器失败: {exc}") from exc

    return {
        "container_id": container.id,
        "container_name": name,
        "host_port": host_port,
        "container_port": template.container_port,
        "flag": flag,
        "expires_at": datetime.now(timezone.utc) + timedelta(seconds=settings.TARGET_DEFAULT_TTL_SECONDS),
    }


async def stop_container(container_name: str) -> None:
    """停止并删除一个容器（best-effort）。"""
    client = get_client()
    try:
        c = client.containers.get(container_name)
        c.stop(timeout=3)
        c.remove(force=True)
    except NotFound:
        pass
    except Exception as exc:  # noqa: BLE001
        logger.warning("停止容器 %s 失败: %s", container_name, exc)
