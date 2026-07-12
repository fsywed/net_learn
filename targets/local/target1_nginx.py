#!/usr/bin/env python3
"""靶机 1：Nginx Flag 隐藏 — Flag 藏在 HTML 注释中。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse


class Handler(TargetHandler):
    challenge_html = ""
    flag_locations = ["HTML 页面源码的注释中（按 Ctrl+U 查看源码）"]

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/" or parsed.path == "/index.html":
            html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>欢迎页面</title>
    <style>
        body {{ font-family: sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }}
        h1 {{ color: #333; }}
        .info {{ background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0; }}
        kbd {{ background: #333; color: #fff; padding: 2px 8px; border-radius: 4px; }}
    </style>
</head>
<body>
    <h1>欢迎来到公司首页</h1>
    <div class="info">
        <p>这是公司的内部网站。系统正在维护中。</p>
        <p>如需帮助，请联系管理员：admin@example.com</p>
    </div>
    <p>提示：尝试用 <kbd>Ctrl+U</kbd> 查看页面源码。</p>
    <!-- 开发备注：Flag = {self.flag} -->
    <!-- TODO: 上线前记得删除这段注释 -->
</body>
</html>"""
            self._send_html(html)
        else:
            self._send_html("<h1>404</h1><p>页面不存在</p>", 404)


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8081
    run_server(Handler, port)
