#!/usr/bin/env python3
"""靶机 4：XSS 反射型 — 搜索框未过滤输入，可触发 XSS 获取 Flag。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse, parse_qs


class Handler(TargetHandler):
    flag_locations = ["通过 XSS 注入获取 Cookie 中的 Flag"]

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/" or parsed.path == "/search":
            qs = parse_qs(parsed.query)
            keyword = qs.get("q", [""])[0]

            # 故意不做过滤（反射型 XSS 漏洞）
            if keyword:
                result_html = f"""
                <div class="result">
                    <h2>搜索结果：{keyword}</h2>
                    <p>未找到与「{keyword}」相关的内容。</p>
                </div>"""
            else:
                result_html = ""

            html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>搜索系统</title>
    <style>
        body {{ font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }}
        .search-box {{ display: flex; gap: 10px; margin: 20px 0; }}
        input {{ padding: 10px; border: 1px solid #ddd; border-radius: 5px; flex: 1; }}
        button {{ padding: 10px 20px; background: #0084ff; color: #fff; border: none; border-radius: 5px; cursor: pointer; }}
        .result {{ background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0; }}
        .hint {{ color: #999; font-size: 13px; }}
    </style>
</head>
<body>
    <h1>搜索系统</h1>
    <p>欢迎来到内部搜索系统。管理员最近访问过此页面，Cookie 中包含敏感信息。</p>
    <div class="search-box">
        <form method="GET" action="/search" style="display:flex;gap:10px;flex:1;">
            <input type="text" name="q" placeholder="输入搜索关键词" value="" required>
            <button type="submit">搜索</button>
        </form>
    </div>
    {result_html}
    <div class="hint">
        <p>提示：</p>
        <ul>
            <li>搜索框未对输入进行过滤</li>
            <li>尝试注入 JavaScript 获取 Cookie</li>
            <li>Flag 藏在管理员 Cookie 中（模拟）</li>
        </ul>
    </div>
    <!-- 管理员 Cookie: session=admin; flag=FLAG_PLACEHOLDER -->
    <script>
        // 模拟管理员的 Cookie（实际 XSS 场景中需要窃取）
        document.cookie = "session=admin";
        document.cookie = "flag={self.flag}";
    </script>
</body>
</html>"""
            # 替换占位符
            html = html.replace("FLAG_PLACEHOLDER", self.flag)
            self._send_html(html)
        elif parsed.path == "/api/cookie":
            # 模拟：返回管理员 cookie（用于 XSS 验证）
            self._send_json({"cookies": [f"flag={self.flag}", "session=admin"]})
        else:
            self._send_html("<h1>404</h1>", 404)


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8084
    run_server(Handler, port)
