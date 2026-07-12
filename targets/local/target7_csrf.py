#!/usr/bin/env python3
"""靶机 7：CSRF — 修改密码接口未验证 CSRF Token。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse, parse_qs


class Handler(TargetHandler):
    flag_locations = ["通过 CSRF 攻击修改管理员密码"]

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/" or parsed.path == "/profile":
            html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>个人资料</title>
    <style>
        body {{ font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }}
        .profile {{ background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }}
        input {{ padding: 10px; border: 1px solid #ddd; border-radius: 5px; width: 300px; }}
        button {{ padding: 10px 20px; background: #4CAF50; color: #fff; border: none; border-radius: 5px; cursor: pointer; }}
        .flag {{ background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0; }}
    </style>
</head>
<body>
    <h1>个人资料</h1>
    <div class="profile">
        <p><strong>用户名：</strong>admin</p>
        <p><strong>邮箱：</strong>admin@example.com</p>
    </div>
    
    <div class="flag">
        <p><strong>Flag:</strong> {self.flag}</p>
        <p>提示：修改密码功能存在 CSRF 漏洞，攻击者可诱导管理员点击恶意链接修改密码。</p>
    </div>
    
    <h2>修改密码</h2>
    <form method="POST" action="/change_password">
        <input type="password" name="new_password" placeholder="新密码" required>
        <button type="submit">修改密码</button>
    </form>
    
    <p style="color:#999;font-size:12px;">警告：修改密码接口未验证 CSRF Token，可被跨站伪造请求。</p>
</body>
</html>"""
            self._send_html(html)
        else:
            self._send_html("<h1>404</h1>", 404)

    def handle_post(self, parsed: urlparse):
        if parsed.path == "/change_password":
            body = self._read_body()
            new_password = body.get("new_password", "")

            # 故意不验证 CSRF Token
            html = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>密码已修改</title></head>
<body>
    <h1>密码修改成功</h1>
    <p>你的密码已修改为：{new_password}</p>
    <p>漏洞原因：修改密码接口未验证 CSRF Token，攻击者可构造恶意页面诱导管理员点击。</p>
    <p>防御方案：添加 CSRF Token、验证 Referer 头部、使用 SameSite Cookie。</p>
</body>
</html>"""
            self._send_html(html)
        else:
            self._send_json({"error": "not found"}, 404)


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8087
    run_server(Handler, port)
