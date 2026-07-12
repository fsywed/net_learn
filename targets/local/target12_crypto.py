#!/usr/bin/env python3
"""靶机 12：弱加密 — 使用 Base64/MD5 等弱加密，可被破解。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse, parse_qs
import hashlib
import base64


class Handler(TargetHandler):
    flag_locations = ["破解 Base64 编码的密码或 MD5 哈希"]

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/" or parsed.path == "/login":
            # 使用弱加密存储密码
            weak_password = "admin123"
            base64_password = base64.b64encode(weak_password.encode()).decode()
            md5_password = hashlib.md5(weak_password.encode()).hexdigest()

            html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>用户登录</title>
    <style>
        body {{ font-family: sans-serif; background: #f5f5f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; }}
        .login-box {{ background: #fff; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); width: 400px; }}
        h1 {{ text-align: center; color: #333; }}
        input {{ width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; }}
        button {{ width: 100%; padding: 10px; background: #9C27B0; color: #fff; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }}
        .debug {{ background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0; font-family: monospace; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="login-box">
        <h1>用户登录</h1>
        <form method="POST" action="/login">
            <input type="text" name="username" placeholder="用户名" value="admin" required>
            <input type="password" name="password" placeholder="密码" required>
            <button type="submit">登录</button>
        </form>
        <div class="debug">
            <p><strong>调试信息（泄露）：</strong></p>
            <p>Base64 密码：{base64_password}</p>
            <p>MD5 哈希：{md5_password}</p>
        </div>
        <p style="color:#999;font-size:12px;">提示：系统使用 Base64 和 MD5 存储密码，可被破解。</p>
    </div>
</body>
</html>"""
            self._send_html(html)
        elif parsed.path == "/flag":
            qs = parse_qs(parsed.query)
            password = qs.get("password", [""])[0]

            # 验证密码
            if password == "admin123":
                html = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Flag</title></head>
<body>
    <h1>登录成功！</h1>
    <p><strong>Flag:</strong> {self.flag}</p>
    <p>漏洞原因：系统使用 Base64（可逆编码）和 MD5（弱哈希）存储密码。</p>
    <p>防御方案：使用 bcrypt/scrypt/Argon2 等强哈希算法，加盐存储。</p>
</body>
</html>"""
                self._send_html(html)
            else:
                self._send_html("<h1>密码错误</h1>", 401)
        else:
            self._send_html("<h1>404</h1>", 404)

    def handle_post(self, parsed: urlparse):
        if parsed.path == "/login":
            body = self._read_body()
            username = body.get("username", "")
            password = body.get("password", "")

            if username == "admin" and password == "admin123":
                html = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>登录成功</title></head>
<body>
    <h1>欢迎，admin！</h1>
    <p><strong>Flag:</strong> {self.flag}</p>
    <p>漏洞原因：密码使用弱加密（Base64/MD5），可被在线字典破解。</p>
    <p>防御方案：使用 bcrypt、scrypt 或 Argon2 加盐哈希。</p>
</body>
</html>"""
                self._send_html(html)
            else:
                self._send_html("<h1>登录失败</h1><p>用户名或密码错误。</p>", 401)
        else:
            self._send_json({"error": "not found"}, 404)


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8092
    run_server(Handler, port)
