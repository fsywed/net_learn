#!/usr/bin/env python3
"""靶机 26：CSP 绕过 — 利用白名单 JSONP 端点绕过 CSP 执行任意 JS 窃取 Cookie。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse, parse_qs
import json


class Handler(TargetHandler):
    flag_locations = ["利用 trusted-cdn.com 的 JSONP 绕过 CSP 窃取 Cookie"]

    def _send_html_csp(self, html: str):
        body = html.encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header(
            "Content-Security-Policy",
            "default-src 'self'; script-src 'self' trusted-cdn.com; style-src 'self' 'unsafe-inline'"
        )
        self.end_headers()
        self.wfile.write(body)

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/":
            qs = parse_qs(parsed.query)
            q = qs.get("q", [""])[0]
            html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>搜索</title>
    <style>
        body {{ font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }}
        .box {{ background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }}
        input {{ padding: 10px; border: 1px solid #ddd; border-radius: 5px; width: 400px; }}
        button {{ padding: 10px 20px; background: #3F51B5; color: #fff; border: none; border-radius: 5px; cursor: pointer; }}
        .hint {{ color: #999; font-size: 12px; }}
    </style>
</head>
<body>
    <h1>搜索</h1>
    <div class="box">
        <form method="GET" action="/">
            <input type="text" name="q" placeholder="输入搜索关键词" value="{q}">
            <button type="submit">搜索</button>
        </form>
    </div>
    <p>搜索结果：<strong>{q}</strong></p>
    <p class="hint">提示：页面设置了 CSP，script-src 只允许 'self' 和 trusted-cdn.com，内联脚本被阻止。</p>
    <p class="hint">但 /jsonp 端点（模拟 trusted-cdn.com）支持自定义 callback，可借此执行任意 JS。</p>
    <p class="hint">尝试访问 /jsonp?callback=alert，再结合 /admin/cookie 窃取管理员 Cookie。</p>
</body>
</html>"""
            self._send_html_csp(html)
        elif parsed.path == "/jsonp":
            qs = parse_qs(parsed.query)
            callback = qs.get("callback", ["callback"])[0]
            data = {"user": "admin", "msg": "jsonp response"}
            body = f"{callback}({json.dumps(data)});"
            self.send_response(200)
            self.send_header("Content-Type", "application/javascript; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(body.encode())
        elif parsed.path == "/admin/cookie":
            html = f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>管理员 Cookie</title></head>
<body>
    <h1>管理员 Cookie（已被窃取）</h1>
    <p>Set-Cookie: session=admin; HttpOnly</p>
    <p>Cookie 中包含敏感信息：</p>
    <p><strong>Flag:</strong> {self.flag}</p>
    <p>说明：此接口模拟管理员浏览器的 Cookie，攻击者通过 JSONP 回调执行 JS 读取并发送至此。</p>
</body>
</html>"""
            self._send_html(html)
        else:
            self._send_html("<h1>404</h1>", 404)

    def handle_post(self, parsed: urlparse):
        self._send_json({"error": "not found"}, 404)


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8106
    run_server(Handler, port)
