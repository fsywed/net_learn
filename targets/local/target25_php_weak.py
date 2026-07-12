#!/usr/bin/env python3
"""靶机 25：PHP 弱类型 — 利用 0e 开头的 MD5 哈希绕过 == 松散比较。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse


# 模拟管理员密码哈希：md5("240610708") = 0e462097431906509019562988736854
# PHP 中 "0e..." == "0e..." 视为科学计数法 0 == 0 为真
ADMIN_PASSWORD_HASH = "0e462097431906509019562988736854"


class Handler(TargetHandler):
    flag_locations = ["利用 0e 开头的 MD5 哈希绕过 == 比较"]

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/" or parsed.path == "/login":
            html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>用户登录</title>
    <style>
        body {{ font-family: sans-serif; background: #f5f5f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; }}
        .login-box {{ background: #fff; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); width: 380px; }}
        h1 {{ text-align: center; color: #333; }}
        input {{ width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; }}
        button {{ width: 100%; padding: 10px; background: #009688; color: #fff; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }}
        .hash {{ background: #000; color: #0f0; padding: 10px; border-radius: 5px; font-family: monospace; word-break: break-all; }}
        .hint {{ color: #999; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="login-box">
        <h1>后台登录</h1>
        <form method="POST" action="/login">
            <input type="text" name="username" placeholder="用户名" value="admin" required>
            <input type="password" name="password" placeholder="密码" required>
            <button type="submit">登录</button>
        </form>
        <p>管理员密码哈希（MD5）：</p>
        <p class="hash">{ADMIN_PASSWORD_HASH}</p>
        <p class="hint">提示：服务端用 PHP == 松散比较密码哈希。0e 开头的哈希会被当成科学计数法（0 的 N 次方 = 0）。寻找一个 MD5 也以 0e 开头且全数字的字符串即可绕过。</p>
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

            # 模拟 PHP == 弱类型比较：0e 开头哈希绕过
            # md5("240610708") = 0e462097...，md5("QNKCDZO") = 0e830400...
            if username == "admin" and password in ("240610708", "QNKCDZO"):
                html = f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>登录成功</title></head>
<body>
    <h1>登录成功（绕过 == 比较）</h1>
    <p>输入密码：{password}</p>
    <p>其 MD5 以 0e 开头，与管理员哈希 {ADMIN_PASSWORD_HASH} 在 PHP == 比较下相等（0 == 0）。</p>
    <p><strong>Flag:</strong> {self.flag}</p>
    <p>漏洞原因：使用 == 松散比较哈希，0e 开头的字符串被解析为科学计数法 0。</p>
    <p>防御方案：使用 === 严格比较或 hash_equals()。</p>
</body>
</html>"""
                self._send_html(html)
            else:
                self._send_html(
                    f"<h1>登录失败</h1><p>密码错误，== 比较不成立。</p>"
                    f"<p>提示：尝试 240610708 或 QNKCDZO 这类 0e 哈希绕过。</p>",
                    401)
        else:
            self._send_json({"error": "not found"}, 404)


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8105
    run_server(Handler, port)
