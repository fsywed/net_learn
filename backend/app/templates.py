"""靶机模板定义：与前端 targets.json 一一对应。

设计上把模板与运行时的 TargetInstance 分离：
- 模板：静态元数据，定义镜像、容器端口、解题方式
- 实例：用户每次启动产生一条 TargetInstance 记录，含动态 Flag / 端口
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List


@dataclass(frozen=True)
class TargetTemplate:
    """靶机模板：镜像名 + 容器内暴露的端口。"""
    id: int
    name: str
    description: str
    difficulty: str  # easy / medium / hard
    category: str
    image: str
    container_port: int
    skills: List[str]
    learn_points: List[str]


# 与前端 src/data/targets.json id 对齐
TEMPLATES: Dict[int, TargetTemplate] = {
    1: TargetTemplate(
        id=1,
        name="Nginx Flag 隐藏",
        description="Nginx 镜像中 HTML 注释隐藏 Flag。查看页面源码即可获取。",
        difficulty="easy",
        category="Web",
        # 本地 build 的自定义镜像，build: cd targets/nginx-flag && docker build -t netlearn-nginx-flag:latest .
        image="netlearn-nginx-flag:latest",
        container_port=80,
        skills=["信息搜集", "源码审计"],
        learn_points=[
            "理解 HTML 注释可能包含敏感信息",
            "养成「打开页面先看源码」的习惯",
        ],
    ),
    2: TargetTemplate(
        id=2,
        name="SSH 弱口令",
        description="OpenSSH 服务，使用常见弱口令字典爆破登录。",
        difficulty="easy",
        category="服务",
        image="rastasheep/ubuntu-sshd:18.04",
        container_port=22,
        skills=["爆破", "SSH"],
        learn_points=[
            "SSH 弱口令风险",
            "hydra 工具使用",
            "爆破痕迹分析",
        ],
    ),
    3: TargetTemplate(
        id=3,
        name="SQL 注入：登录绕过",
        description="运行一个带 SQL 注入的 Web 服务，通过万能密码绕过登录获取 Flag。",
        difficulty="medium",
        category="Web",
        image="vulfocus/sqli-labs:latest",
        container_port=80,
        skills=["SQL 注入", "Burp Suite"],
        learn_points=[
            "理解 SQL 拼接漏洞",
            "万能密码原理",
            "UNION 注入基础",
        ],
    ),
    4: TargetTemplate(
        id=4,
        name="XSS 反射型",
        description="搜索框未过滤输入直接回显，触发反射型 XSS。",
        difficulty="easy",
        category="Web",
        image="vulnerables/web-dvwa:latest",
        container_port=80,
        skills=["XSS", "前端安全"],
        learn_points=[
            "XSS 三要素",
            "反射型 XSS 原理",
            "CSP 防御",
        ],
    ),
}


def get_template(tid: int) -> TargetTemplate | None:
    return TEMPLATES.get(tid)


def list_templates() -> List[TargetTemplate]:
    return list(TEMPLATES.values())
