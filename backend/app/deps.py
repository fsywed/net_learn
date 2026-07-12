"""客户端 IP 工具：兼容反向代理头。"""
from __future__ import annotations

from typing import Optional

from fastapi import Request


def get_client_ip(request: Request) -> str:
    """从 X-Forwarded-For / X-Real-IP 提取客户端 IP。

    Fly.io 会把真实 IP 放在 X-Forwarded-For 第一位。
    """
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    xri = request.headers.get("x-real-ip")
    if xri:
        return xri.strip()
    return (request.client.host if request.client else "unknown")
