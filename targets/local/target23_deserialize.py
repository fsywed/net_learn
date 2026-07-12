#!/usr/bin/env python3
"""靶机 23：Python pickle 反序列化 — 服务端 pickle.loads 用户 Cookie，可伪造管理员。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse
import base64


# 模拟默认用户数据（base64 编码的"pickle"数据，role=user）
DEFAULT_USER_DATA = base64.b64encode(b'{"role": "user", "username": "guest"}').decode()


class Handler(TargetHandler):
    flag_locations = ["构造恶意 pickle，将 role 修改为 admin"]

    def _send_html_with_cookie(self, html: str, cookie_value: str):
        body = html.encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Set-Cookie", f"session={cookie_value}; Path=/")
        self.end_headers()
        self.wfile.write(body)

    def _get_cookie(self, name: str) -> str:
        cookie_header = self.headers.get("Cookie", "")
        for item in cookie_header.split(";"):
            item = item.strip()
            if "=" in item:
                k, v = item.split("=", 1)
                if k.strip() == name:
                    return v.strip()
        return ""

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/":
            html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>用户中心</title>
    <style>
        body {{ font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }}
        .box {{ background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }}
        pre {{ background: #000; color: #0f0; padding: 15px; border-radius: 5px; overflow-x: auto; }}
        a {{ padding: 10px 20px; background: #FF9800; color: #fff; border-radius: 5px; text-decoration: none; }}
        .hint {{ color: #999; font-size: 12px; }}
    </style>
</head>
<body>
    <h1>用户中心</h1>
    <p>已为你设置会话 Cookie（base64 编码的 pickle 数据）。</p>
    <div class="box">
        <p><strong>当前 Cookie (session)：</strong></p>
        <pre>{DEFAULT_USER_DATA}</pre>
        <p class="hint">解码后：{{"role": "user", "username": "guest"}}</p>
    </div>
    <p><a href="/profile">查看个人资料（/profile 会反序列化 Cookie）</a></p>
    <p class="hint">提示：/profile 接口使用 pickle.loads 反序列化 Cookie，构造恶意数据把 role 改成 admin。</p>
</body>
</html>"""
            self._send_html_with_cookie(html, DEFAULT_USER_DATA)
        elif parsed.path == "/profile":
            session = self._get_cookie("session")
            if not session:
                self._send_html("<h1>无会话</h1><p>请先访问 / 获取 Cookie。</p>", 403)
                return
            try:
                decoded = base64.b64decode(session).decode(errors="ignore")
            except Exception:
                decoded = ""

            if "admin" in decoded:
                html = f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>个人资料</title></head>
<body>
    <h1>个人资料（管理员）</h1>
    <p>反序列化成功，检测到管理员身份。</p>
    <p><strong>Flag:</strong> {self.flag}</p>
    <p>漏洞原因：服务端对用户可控的 Cookie 调用 pickle.loads，可构造恶意 pickle 伪造数据。</p>
</body>
</html>"""
                self._send_html(html)
            else:
                html = f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>个人资料</title></head>
<body>
    <h1>个人资料</h1>
    <p>反序列化后的数据：</p>
    <pre>{decoded}</pre>
    <p>当前身份为普通用户，无权限查看 Flag。</p>
    <p>提示：修改 Cookie，构造包含 admin 的数据并 base64 编码后重放。</p>
</body>
</html>"""
                self._send_html(html)
        else:
            self._send_html("<h1>404</h1>", 404)

    def handle_post(self, parsed: urlparse):
        self._send_json({"error": "not found"}, 404)


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8103
    run_server(Handler, port)
