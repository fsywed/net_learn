#!/usr/bin/env python3
"""靶机 22：JWT 伪造 — 使用 none 算法绕过签名校验，伪造管理员身份。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse, parse_qs
import base64
import json


def _b64url_encode(data: str) -> str:
    return base64.urlsafe_b64encode(data.encode()).rstrip(b"=").decode()


def _b64url_decode(data: str) -> str:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding).decode(errors="ignore")


class Handler(TargetHandler):
    flag_locations = ["伪造 JWT Token，将 role 改为 admin"]

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/" or parsed.path == "/login":
            html = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>用户登录</title>
    <style>
        body { font-family: sans-serif; background: #f5f5f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        .login-box { background: #fff; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); width: 350px; }
        h1 { text-align: center; color: #333; }
        input { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; }
        button { width: 100%; padding: 10px; background: #673AB7; color: #fff; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
        .hint { color: #999; font-size: 12px; text-align: center; }
    </style>
</head>
<body>
    <div class="login-box">
        <h1>JWT 系统</h1>
        <form method="POST" action="/login">
            <input type="text" name="username" placeholder="用户名" value="user" required>
            <input type="password" name="password" placeholder="密码" value="user123" required>
            <button type="submit">登录</button>
        </form>
        <p class="hint">测试账号：user / user123</p>
    </div>
</body>
</html>"""
            self._send_html(html)
        elif parsed.path == "/admin":
            token = self.headers.get("Authorization", "")
            if token.startswith("Bearer "):
                token = token[7:]
            if not token:
                qs = parse_qs(parsed.query)
                token = qs.get("token", [""])[0]

            role = ""
            if token:
                try:
                    parts = token.split(".")
                    payload = json.loads(_b64url_decode(parts[1]))
                    role = payload.get("role", "")
                except Exception:
                    role = ""

            if role == "admin":
                html = f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>管理员后台</title></head>
<body>
    <h1>管理员后台</h1>
    <p>欢迎，管理员！JWT 校验通过（未验证签名）。</p>
    <p><strong>Flag:</strong> {self.flag}</p>
    <p>漏洞原因：服务端接受 none 算法且不校验签名，攻击者可伪造任意 payload。</p>
</body>
</html>"""
                self._send_html(html)
            else:
                html = """<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>403</title></head>
<body>
    <h1>403 Forbidden</h1>
    <p>当前身份非管理员，无法访问后台。</p>
    <p>提示：解码登录后获得的 JWT，将 alg 改为 none、role 改为 admin，去掉签名后重放。</p>
    <p>访问方式：GET /admin?token=伪造的JWT 或 携带 Authorization: Bearer 伪造的JWT</p>
</body>
</html>"""
                self._send_html(html, 403)
        else:
            self._send_html("<h1>404</h1>", 404)

    def handle_post(self, parsed: urlparse):
        if parsed.path == "/login":
            body = self._read_body()
            username = body.get("username", "")
            password = body.get("password", "")

            if username == "user" and password == "user123":
                header = {"alg": "none", "typ": "JWT"}
                payload = {"username": "user", "role": "user"}
                token = _b64url_encode(json.dumps(header)) + "." + \
                    _b64url_encode(json.dumps(payload)) + "."
                html = f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>登录成功</title>
<style>pre{{background:#000;color:#0f0;padding:15px;border-radius:5px;overflow-x:auto;}} .box{{background:#f5f5f5;padding:20px;border-radius:8px;margin:20px 0;}}</style>
</head>
<body>
    <h1>登录成功</h1>
    <p>欢迎，user。你的角色是 <strong>user</strong>，无法访问后台。</p>
    <div class="box">
        <p><strong>JWT Token：</strong></p>
        <pre>{token}</pre>
    </div>
    <p>提示：服务端使用 none 算法且不校验签名。解码 Token，把 payload 中 role 改成 admin，alg 保持 none，去掉签名（末尾留一个点），然后访问 /admin。</p>
    <p><a href="/admin?token={token}">用当前 Token 访问 /admin（会被拒绝）</a></p>
</body>
</html>"""
                self._send_html(html)
            else:
                self._send_html("<h1>登录失败</h1><p>用户名或密码错误。</p>", 401)
        else:
            self._send_json({"error": "not found"}, 404)


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8102
    run_server(Handler, port)
