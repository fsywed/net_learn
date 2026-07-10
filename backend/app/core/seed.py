"""演示数据种子：幂等插入示例课程与靶机模板，便于端到端联调。

按名称查询存在则跳过，保证应用多次启动不会产生重复数据。
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.course import Chapter, Course
from app.models.target import TargetTemplate

# 示例课程标题，作为幂等判定键
_DEMO_COURSE_TITLE = "Web 安全入门"

# 示例靶机模板名称，作为幂等判定键
_DEMO_TARGET_NAME = "示例：Nginx Flag 查找"

# 第一章 Markdown 正文：Web 安全基础概念
_CHAPTER_1_CONTENT = """\
# Web 安全基础概念

Web 安全是网络安全的重要分支，关注 Web 应用的常见漏洞与防御方法。

## 常见威胁

- **SQL 注入**：攻击者构造恶意输入干扰后端 SQL 语句。
- **XSS（跨站脚本）**：向页面注入恶意脚本并在其他用户浏览器执行。
- **CSRF（跨站请求伪造）**：诱导已登录用户在不知情下发起请求。

## 学习目标

1. 理解 HTTP 请求与响应结构。
2. 掌握常见漏洞的成因与利用方式。
3. 能够在靶机环境中复现并验证漏洞。

> 提示：完成本章后，请在靶机列表启动「示例：Nginx Flag 查找」进行第一次实战练习。
"""

# 第二章 Markdown 正文：信息搜集与 Flag 查找
_CHAPTER_2_CONTENT = """\
# 信息搜集与 Flag 查找

在 CTF 与渗透测试中，Flag 通常隐藏在页面源码、响应头或服务端口中。

## 查找技巧

1. 查看页面 HTML 源码，留意注释 `<!-- ... -->`。
2. 检查 HTTP 响应头与 Cookie。
3. 使用 `curl`、`dirsearch` 等工具枚举隐藏路径。

## 示例

访问靶机首页后，按 `Ctrl+U` 查看源代码，留意页面中是否藏有形如
`flag{...}` 的字符串，将其提交到平台即可获得积分。
"""


async def seed_demo_data(db: AsyncSession) -> None:
    """幂等插入演示课程与示例靶机模板。

    按名称查询，已存在则跳过，保证多次启动不会产生重复数据。
    """
    # --- 示例课程与章节 ---
    course_result = await db.execute(
        select(Course).where(Course.title == _DEMO_COURSE_TITLE).limit(1)
    )
    if course_result.scalar_one_or_none() is None:
        # 课程不存在：连同两章节一并创建，关系级联写入子记录
        course = Course(
            title=_DEMO_COURSE_TITLE,
            description="面向新手的 Web 安全入门课程，涵盖常见漏洞概念与实战练习。",
            status="published",
        )
        course.chapters = [
            Chapter(
                title="第一章：Web 安全基础概念",
                content=_CHAPTER_1_CONTENT,
                order=1,
            ),
            Chapter(
                title="第二章：信息搜集与 Flag 查找",
                content=_CHAPTER_2_CONTENT,
                order=2,
            ),
        ]
        db.add(course)

    # --- 示例靶机模板 ---
    target_result = await db.execute(
        select(TargetTemplate)
        .where(TargetTemplate.name == _DEMO_TARGET_NAME)
        .limit(1)
    )
    if target_result.scalar_one_or_none() is None:
        # 模板不存在：创建示例靶机模板，与 sample-nginx-flag 镜像对应
        target = TargetTemplate(
            name=_DEMO_TARGET_NAME,
            image="netlearn/sample-nginx-flag:latest",
            ports="80",
            flag="flag{w3lc0me_t0_n3t_l3arn}",
            difficulty="easy",
            status="published",
            description=(
                "基于 Nginx 的入门级靶机。启动后访问首页，"
                "通过查看页面源码（HTML 注释）即可找到 Flag。"
                "适用于熟悉 Flag 提交流程与基本信息搜集。"
            ),
        )
        db.add(target)

    # 提交本次新增；无新增时 commit 为空操作，幂等安全
    await db.commit()
