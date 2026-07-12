#!/usr/bin/env python3
"""靶机 3：SQL 注入 — 模拟登录页面，万能密码可绕过。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse


class Handler(TargetHandler):
    flag_locations = ["使用 SQL 注入万能密码绕过登录 admin' --"]

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
        button { width: 100%; padding: 10px; background: #4CAF50; color: #fff; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
        button:hover { background: #45a049; }
        .hint { color: #999; font-size: 12px; }
    </style>
</head>
<body>
    <div class="login-box">
        <h1>用户登录</h1>
        <form method="POST" action="/login">
            <input type="text" name="username" placeholder="用户名" required>
            <input type="password" name="password" placeholder="密码" required>
            <button type="submit">登录</button>
        </form>
        <p class="hint">默认账号: guest / guest123（普通用户，无 Flag 权限）</p>
        <p class="hint">提示：尝试 SQL 注入绕过登录，以 admin 身份进入。</p>
    </div>
</body>
</html>"""
            self._send_html(html)
        else:
            self._send_html("<h1>404</h1>", 404)

    def handle_post(self, parsed: urlparse):
        if parsed.path == "/login":
            body = self._read_body()
            username = body.get("username", "")
            password = body.get("password", "")

            # 模拟 SQL 注入（不安全拼接）
            # 正常查询: SELECT * FROM users WHERE username='{username}' AND password='{password}'
            # 万能密码: admin' -- 或 ' OR '1'='1
            sql_injection = False
            admin_login = False

            if "'" in username or "'" in password:
                # 检测到注入尝试
                if "or" in username.lower() or "--" in username or "or" in password.lower() or "--" in password:
                    sql_injection = True
                if "admin" in username.lower():
                    admin_login = True

            # 正常登录
            if username == "guest" and password == "guest123":
                html = """<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>普通用户</title></head>
<body><h1>欢迎，guest</h1><p>你是普通用户，没有权限查看 Flag。</p>
<p>需要以 admin 身份登录才能获取 Flag。</p></body></html>"""
                self._send_html(html)
            elif username == "admin" and password == "admin_secret_2026":
                # 正常 admin 登录（密码很难猜到）
                html = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>管理员</title></head>
<body><h1>欢迎，管理员</h1><div>Flag: {self.flag}</div></body></html>"""
                self._send_html(html)
            elif sql_injection and ("admin" in username.lower() or admin_login):
                # SQL 注入成功
                html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><title>管理员</title>
<style>body{{font-family:sans-serif;padding:40px;}}
.flag{{background:#fff3cd;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #ffc107;}}
</style></head>
<body>
    <h1>登录成功！（SQL 注入）</h1>
    <p>你通过 SQL 注入以 admin 身份登录了系统。</p>
    <div class="flag"><strong>Flag:</strong> {self.flag}</div>
    <p>漏洞原因：登录查询直接拼接用户输入，未使用参数化查询。</p>
</body>
</html>"""
                self._send_html(html)
            else:
                html = """<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>登录失败</title></head>
<body><h1>登录失败</h1><p>用户名或密码错误。<a href="/">返回</a></p></body></html>"""
                self._send_html(html, 401)
        else:
            self._send_json({"error": "not found"}, 404)


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8083
    run_server(Handler, port)
