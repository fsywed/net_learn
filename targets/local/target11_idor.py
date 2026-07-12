#!/usr/bin/env python3
"""靶机 11：越权访问 — 用户 ID 未验证，可访问其他用户数据。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse, parse_qs


class Handler(TargetHandler):
    flag_locations = ["修改 URL 参数 user_id=2 访问管理员订单"]

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
        button { width: 100%; padding: 10px; background: #2196F3; color: #fff; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
    </style>
</head>
<body>
    <div class="login-box">
        <h1>订单系统</h1>
        <form method="POST" action="/login">
            <input type="text" name="username" placeholder="用户名" value="user1" required>
            <input type="password" name="password" placeholder="密码" value="password1" required>
            <button type="submit">登录</button>
        </form>
        <p style="color:#999;font-size:12px;text-align:center;">测试账号：user1 / password1</p>
    </div>
</body>
</html>"""
            self._send_html(html)
        elif parsed.path == "/order":
            qs = parse_qs(parsed.query)
            user_id = qs.get("user_id", ["1"])[0]

            # 故意不验证用户身份（越权漏洞）
            if user_id == "1":
                content = """<h2>user1 的订单</h2>
                <ul>
                    <li>订单 #1001：iPhone 13 - ¥5999</li>
                    <li>订单 #1002：AirPods Pro - ¥1999</li>
                </ul>"""
            elif user_id == "2":
                content = f"""<h2>admin 的订单（管理员）</h2>
                <p><strong>Flag:</strong> {self.flag}</p>
                <ul>
                    <li>订单 #2001：MacBook Pro - ¥14999</li>
                    <li>订单 #2002：iPhone 14 Pro - ¥8999</li>
                </ul>
                <p>漏洞原因：订单查询接口未验证当前用户身份，仅根据 URL 参数 user_id 查询。</p>
                <p>防御方案：从 Session/Token 中获取用户 ID，禁止用户指定。</p>"""
            else:
                content = f"<h2>用户 {user_id} 的订单</h2><p>无订单记录。</p>"

            html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>我的订单</title>
    <style>
        body {{ font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }}
        .order {{ background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }}
    </style>
</head>
<body>
    <h1>我的订单</h1>
    <div class="order">
        {content}
    </div>
    <p><a href="/">返回登录</a></p>
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

            if username == "user1" and password == "password1":
                # 登录成功，跳转到订单页面（暴露 user_id 参数）
                html = """<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>登录成功</title></head>
<body>
    <h1>登录成功！</h1>
    <p>欢迎，user1。</p>
    <p><a href="/order?user_id=1">查看我的订单</a></p>
    <p style="color:#999;font-size:12px;">提示：尝试修改 URL 中的 user_id 参数，访问其他用户的订单。</p>
</body>
</html>"""
                self._send_html(html)
            else:
                self._send_html("<h1>登录失败</h1><p>用户名或密码错误。</p>", 401)
        else:
            self._send_json({"error": "not found"}, 404)


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8091
    run_server(Handler, port)
