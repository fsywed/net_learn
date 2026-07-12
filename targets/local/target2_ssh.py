#!/usr/bin/env python3
"""靶机 2：SSH 弱口令 — 模拟一个登录页面，弱口令可登录获取 Flag。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse


class Handler(TargetHandler):
    flag_locations = ["登录 admin / admin123 后在欢迎页面"]

    # 弱口令字典（模拟 SSH 爆破场景）
    users = {
        "admin": "admin123",
        "root": "toor",
        "test": "123456",
    }

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/" or parsed.path == "/login":
            html = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>服务器登录</title>
    <style>
        body { font-family: monospace; background: #1a1a2e; color: #eee; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        .login-box { background: #16213e; padding: 40px; border-radius: 10px; width: 350px; }
        h1 { text-align: center; color: #e94560; }
        input { width: 100%; padding: 10px; margin: 10px 0; background: #0f3460; border: 1px solid #e94560; color: #fff; border-radius: 5px; box-sizing: border-box; }
        button { width: 100%; padding: 10px; background: #e94560; color: #fff; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
        button:hover { background: #c81e45; }
        .hint { color: #888; font-size: 12px; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="login-box">
        <h1>SSH 登录</h1>
        <form method="POST" action="/login">
            <input type="text" name="username" placeholder="用户名" required>
            <input type="password" name="password" placeholder="密码" required>
            <button type="submit">登录</button>
        </form>
        <p class="hint">提示：尝试常见弱口令。admin / root / test</p>
    </div>
</body>
</html>"""
            self._send_html(html)
        else:
            self._send_html("<h1>404</h1>", 404)

    def handle_post(self, parsed: urlparse):
        if parsed.path == "/login":
            body = self._read_body()
            # 可能是 JSON 或 form
            username = body.get("username", "")
            password = body.get("password", "")

            if username in self.users and self.users[username] == password:
                html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><title>欢迎</title>
<style>body {{ font-family: monospace; background: #1a1a2e; color: #0f0; padding: 40px; }}
.flag {{ background: #0f3460; padding: 20px; border-radius: 8px; margin: 20px 0; font-size: 18px; }}
</style></head>
<body>
    <h1>登录成功！</h1>
    <p>欢迎回来，{username}。</p>
    <div class="flag">恭喜！Flag: {self.flag}</div>
    <p>你通过弱口令成功登录了服务器。</p>
</body>
</html>"""
                self._send_html(html)
            else:
                html = """<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>登录失败</title>
<style>body{font-family:monospace;background:#1a1a2e;color:#e94560;padding:40px;}</style>
</head><body><h1>登录失败</h1><p>用户名或密码错误。<a href="/" style="color:#eee">返回重试</a></p></body></html>"""
                self._send_html(html, 401)
        else:
            self._send_json({"error": "not found"}, 404)


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8082
    run_server(Handler, port)
