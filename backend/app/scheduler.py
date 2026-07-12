"""Docker 调度器 + 模拟模式。

两种运行模式：
1. docker 模式：通过 docker SDK 在宿主机上 spawn / stop 容器（需要 docker daemon）
2. simulation 模式：Docker 不可用时，用内嵌 aiohttp 起临时 HTTP 服务模拟靶机

模式选择逻辑：
- SIMULATION_MODE=on → 强制模拟
- SIMULATION_MODE=off → 强制 Docker（不可用则报错）
- SIMULATION_MODE=auto（默认）→ 先试 Docker，连不上就降级模拟
"""
from __future__ import annotations

import logging
import random
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from app.config import settings
from app.templates import TargetTemplate

logger = logging.getLogger(__name__)

# ---- 模式检测 ----
_DOCKER_AVAILABLE: Optional[bool] = None  # None=未检测, True/False


def _check_docker() -> bool:
    """检测 Docker daemon 是否可用。"""
    global _DOCKER_AVAILABLE
    if _DOCKER_AVAILABLE is not None:
        return _DOCKER_AVAILABLE
    if settings.SIMULATION_MODE == "on":
        _DOCKER_AVAILABLE = False
        logger.info("SIMULATION_MODE=on，强制使用模拟模式")
        return False
    try:
        import docker
        from docker.errors import DockerException

        client = docker.DockerClient(base_url=settings.DOCKER_HOST or None)
        client.ping()
        _DOCKER_AVAILABLE = True
        logger.info("Docker client connected: %s", settings.DOCKER_HOST or "default")
        return True
    except Exception as exc:
        logger.warning("Docker 不可用，降级为模拟模式: %s", exc)
        _DOCKER_AVAILABLE = False
        return False


def is_simulation() -> bool:
    """当前是否运行在模拟模式。"""
    if settings.SIMULATION_MODE == "on":
        return True
    if settings.SIMULATION_MODE == "off":
        return False
    return not _check_docker()


# ---- 模拟靶机：内嵌 HTTP 服务 ----
# key=port, value=aiohttp web.AppRunner
_sim_servers: dict[int, object] = {}


def _build_sim_page(template: TargetTemplate, flag: str) -> str:
    """根据模板生成模拟靶机 HTML 页面。"""
    tid = template.id
    if tid == 1:
        # Nginx Flag 隐藏：HTML 注释
        return f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>Nginx 靶机</title></head>
<body>
<h1>欢迎来到 Nginx 靶机（模拟）</h1>
<p>这是一个用于学习「信息搜集」与「源码审计」的极简靶机。</p>
<p>请尝试用 <kbd>Ctrl+U</kbd> 查看页面源码，Flag 就藏在里面。</p>
<!-- {flag} -->
</body></html>"""
    elif tid == 2:
        # SSH 弱口令：模拟一个登录页
        return f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>SSH 登录模拟</title></head>
<body>
<h1>SSH 弱口令靶机（模拟）</h1>
<p>模拟 SSH 登录服务。尝试用 hydra 爆破。</p>
<p>提示：root / root</p>
<form><label>用户名:</label><input><br><label>密码:</label><input type=password><br><button>登录</button></form>
<p>登录成功后 Flag 会显示在 /root/flag.txt</p>
<!-- {flag} -->
</body></html>"""
    elif tid == 3:
        # SQL 注入：模拟登录表单
        return f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>SQL 注入靶机</title></head>
<body>
<h1>SQL 注入：登录绕过（模拟）</h1>
<p>用户名输入 <code>admin' OR '1'='1' --</code> 密码任意即可绕过登录。</p>
<form><label>用户名:</label><input name=user><br><label>密码:</label><input type=password name=pass><br><button>登录</button></form>
<!-- {flag} -->
</body></html>"""
    else:
        # XSS 反射型：模拟搜索框
        return f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>XSS 靶机</title></head>
<body>
<h1>XSS 反射型漏洞（模拟）</h1>
<p>搜索框未过滤输入直接回显，尝试 <code>&lt;script&gt;alert(1)&lt;/script&gt;</code></p>
<form><input name=q placeholder="搜索..."><button>搜索</button></form>
<!-- {flag} -->
</body></html>"""


async def _start_sim_server(template: TargetTemplate, flag: str, host_port: int) -> None:
    """启动一个内嵌 HTTP 服务模拟靶机。"""
    from aiohttp import web

    page = _build_sim_page(template, flag)

    async def index(request: web.Request) -> web.Response:
        return web.Response(text=page, content_type="text/html")

    app = web.Application()
    app.router.add_get("/", index)
    app.router.add_get("/{tail:.*}", index)

    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, "127.0.0.1", host_port)
    await site.start()
    _sim_servers[host_port] = runner
    logger.info("模拟靶机已启动: 127.0.0.1:%d (template=%d)", host_port, template.id)


async def _stop_sim_server(host_port: int) -> None:
    """停止模拟靶机服务。"""
    runner = _sim_servers.pop(host_port, None)
    if runner:
        await runner.cleanup()
        logger.info("模拟靶机已停止: port=%d", host_port)


# ---- 通用工具 ----
def _rand_port() -> int:
    return random.randint(settings.TARGET_PORT_RANGE_START, settings.TARGET_PORT_RANGE_END)


def _rand_flag(template: TargetTemplate) -> str:
    suffix = secrets.token_hex(6)
    return f"{settings.FLAG_PREFIX}t{template.id}_{suffix}{settings.FLAG_SUFFIX}"


# ---- 公共 API ----
async def start_target(
    template: TargetTemplate,
    client_ip: str,
    proxy_token: str,
) -> dict:
    """启动一个靶机实例，返回实例元数据。

    Docker 可用时 → 起真实容器
    Docker 不可用 → 起模拟 HTTP 服务
    """
    host_port = _rand_port()
    flag = _rand_flag(template)
    name = f"netlearn-tpl{template.id}-{secrets.token_hex(4)}"
    expires_at = datetime.now(timezone.utc) + timedelta(seconds=settings.TARGET_DEFAULT_TTL_SECONDS)

    if is_simulation():
        # 模拟模式
        await _start_sim_server(template, flag, host_port)
        return {
            "container_id": f"sim-{name}",
            "container_name": name,
            "host_port": host_port,
            "container_port": template.container_port,
            "flag": flag,
            "expires_at": expires_at,
            "simulation": True,
        }

    # Docker 模式
    import docker
    from docker.errors import APIError

    client = docker.DockerClient(base_url=settings.DOCKER_HOST or None)

    try:
        client.images.pull(template.image)
    except Exception as exc:  # noqa: BLE001
        logger.warning("拉取镜像 %s 失败，尝试本地：%s", template.image, exc)

    try:
        container = client.containers.run(
            image=template.image,
            name=name,
            detach=True,
            environment={"FLAG": flag, "PROXY_TOKEN": proxy_token},
            ports={f"{template.container_port}/tcp": host_port},
            labels={
                "netlearn.target": "1",
                "netlearn.template_id": str(template.id),
                "netlearn.flag": flag,
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
        "expires_at": expires_at,
        "simulation": False,
    }


async def stop_container(container_name: str, host_port: int = 0) -> None:
    """停止并删除靶机实例（best-effort）。

    host_port > 0 时同时清理模拟服务。
    """
    # 先清理模拟服务
    if host_port > 0:
        await _stop_sim_server(host_port)

    # 如果是 Docker 模式，尝试 stop+remove 容器
    if not is_simulation():
        import docker
        from docker.errors import NotFound

        try:
            client = docker.DockerClient(base_url=settings.DOCKER_HOST or None)
            c = client.containers.get(container_name)
            c.stop(timeout=3)
            c.remove(force=True)
        except NotFound:
            pass
        except Exception as exc:  # noqa: BLE001
            logger.warning("停止容器 %s 失败: %s", container_name, exc)
