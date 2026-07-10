"""Docker 容器调度封装。

Docker SDK 为同步阻塞接口，本模块通过 asyncio.to_thread 将其包装为 async 友好。
所有靶机容器接入隔离网络 netlearn-net（不存在则尝试创建，失败回退默认 bridge）。
"""

import asyncio
import random
import secrets

import docker
from docker import DockerClient
from docker.errors import APIError, ImageNotFound, NotFound

from app.config import settings

# 靶机隔离网络名称
NETWORK_NAME = "netlearn-net"


def get_client() -> DockerClient:
    """创建 Docker 客户端。DOCKER_HOST 为空时使用默认本地 socket。"""
    if settings.DOCKER_HOST:
        return docker.DockerClient(base_url=settings.DOCKER_HOST)
    return docker.from_env()


def build_container_name(user_id: int, template_id: int) -> str:
    """生成靶机容器名：netlearn-{user_id}-{template_id}-{短随机}。"""
    return f"netlearn-{user_id}-{template_id}-{secrets.token_hex(4)}"


def _ensure_network(client: DockerClient) -> str:
    """确保隔离网络存在，返回可用网络名；创建失败回退默认 bridge。"""
    try:
        client.networks.get(NETWORK_NAME)
        return NETWORK_NAME
    except NotFound:
        try:
            client.networks.create(NETWORK_NAME, driver="bridge")
            return NETWORK_NAME
        except APIError:
            return "bridge"


def _allocate_ports(
    container_ports: list[int], used: set[int]
) -> dict[int, int]:
    """在配置范围内为每个容器端口随机分配一个未占用的主机端口。

    返回 {容器端口: 主机端口}。可用端口不足时抛出 RuntimeError。
    """
    available = [
        p
        for p in range(settings.HOST_PORT_RANGE_START, settings.HOST_PORT_RANGE_END + 1)
        if p not in used
    ]
    if len(available) < len(container_ports):
        raise RuntimeError("主机端口范围内可用端口不足")
    chosen = random.sample(available, len(container_ports))
    return dict(zip(container_ports, chosen))


def _create_container_sync(
    image: str,
    container_ports: list[int],
    container_name: str,
    used_host_ports: set[int] | None,
) -> dict:
    """同步创建并启动容器：拉镜像、分配端口、建容器、接入网络、启动。"""
    client = get_client()

    # 本地不存在则拉取镜像
    try:
        client.images.get(image)
    except ImageNotFound:
        client.images.pull(image)

    port_map = _allocate_ports(container_ports, used_host_ports or set())
    # Docker 端口绑定格式：{"容器端口/tcp": [{"HostPort": "主机端口"}]}
    bindings = {f"{c}/tcp": [{"HostPort": str(h)}] for c, h in port_map.items()}
    network_name = _ensure_network(client)

    container = None
    try:
        container = client.containers.create(
            image, name=container_name, ports=bindings
        )
        # 接入隔离网络（默认 bridge 无需显式连接）
        if network_name != "bridge":
            try:
                client.networks.get(network_name).connect(container)
            except APIError:
                pass
        container.start()
        container.reload()
    except Exception as exc:
        # 清理可能已创建但启动失败的半成品容器
        if container is not None:
            try:
                container.remove(force=True)
            except Exception:
                pass
        raise RuntimeError(f"容器创建/启动失败: {exc}") from exc

    return {
        "container_id": container.id,
        "host_port": port_map[container_ports[0]],
        "port_map": port_map,
    }


async def create_container(
    image: str,
    container_ports: list[int],
    container_name: str,
    used_host_ports: set[int] | None = None,
) -> dict:
    """异步创建并启动靶机容器。

    used_host_ports 为 DB 中已占用的主机端口集合，分配时避开。
    返回 {container_id, host_port(第一个端口), port_map}。
    """
    return await asyncio.to_thread(
        _create_container_sync, image, container_ports, container_name, used_host_ports
    )


def _stop_and_remove_sync(container_id: str) -> None:
    """同步停止并删除容器（force=True），容器不存在则跳过。"""
    client = get_client()
    try:
        container = client.containers.get(container_id)
    except NotFound:
        return
    try:
        container.stop(timeout=5)
    except Exception:
        pass
    try:
        container.remove(force=True)
    except Exception:
        pass


async def stop_and_remove(container_id: str) -> None:
    """异步停止并删除容器（force=True）。"""
    await asyncio.to_thread(_stop_and_remove_sync, container_id)


def _list_active_sync() -> list:
    """同步列出 netlearn- 前缀的运行中容器。"""
    client = get_client()
    return client.containers.list(filters={"name": "netlearn-"})


async def list_active_instances() -> list:
    """异步列出运行中靶机容器（可选辅助）。"""
    return await asyncio.to_thread(_list_active_sync)
