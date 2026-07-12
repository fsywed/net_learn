#!/usr/bin/env python3
"""靶机 27：原型链污染 — 通过 __proto__ 污染模拟的 Object.merge 设置管理员权限。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse
import json


# 全局管理员标志（模拟被污染的原型属性）
_admin_flag = {"isAdmin": False}


class Handler(TargetHandler):
    flag_locations = ["通过 __proto__ 污染原型链设置 isAdmin:true"]

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/":
            html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>用户信息</title>
    <style>
        body {{ font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }}
        .box {{ background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }}
        textarea {{ width: 100%; height: 120px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; font-family: monospace; }}
        button {{ padding: 10px 20px; background: #795548; color: #fff; border: none; border-radius: 5px; cursor: pointer; }}
        .hint {{ color: #999; font-size: 12px; }}
    </style>
</head>
<body>
    <h1>用户信息</h1>
    <div class="box">
        <p><strong>用户名：</strong>guest</p>
        <p><strong>角色：</strong>普通用户</p>
        <p><strong>当前管理员标志：</strong>{_admin_flag["isAdmin"]}</p>
    </div>
    <h2>更新信息</h2>
    <div class="box">
        <form method="POST" action="/update">
            <textarea name="data" placeholder='输入 JSON，如 {{"nickname":"test"}}'></textarea>
            <p><button type="submit">更新</button></p>
        </form>
        <p class="hint">提示：后端使用存在缺陷的 Object.merge 合并用户 JSON 数据。尝试通过 __proto__ 污染原型链。</p>
        <p class="hint">例如发送 JSON：{{"__proto__":{{"isAdmin":true}}}}</p>
    </div>
    <p><a href="/admin">访问 /admin</a></p>
</body>
</html>"""
            self._send_html(html)
        elif parsed.path == "/admin":
            if _admin_flag["isAdmin"]:
                html = f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>管理员后台</title></head>
<body>
    <h1>管理员后台</h1>
    <p>原型链污染成功，isAdmin 已被设置为 true。</p>
    <p><strong>Flag:</strong> {self.flag}</p>
    <p>漏洞原因：Object.merge 递归合并时未过滤 __proto__ 键，导致原型属性被污染。</p>
</body>
</html>"""
                self._send_html(html)
            else:
                html = """<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>403</title></head>
<body>
    <h1>403 Forbidden</h1>
    <p>当前用户非管理员，无法访问后台。</p>
    <p>提示：通过 POST /update 发送 {"__proto__":{"isAdmin":true}} 污染原型链。</p>
</body>
</html>"""
                self._send_html(html, 403)
        else:
            self._send_html("<h1>404</h1>", 404)

    def handle_post(self, parsed: urlparse):
        if parsed.path == "/update":
            body = self._read_body()
            # _read_body 优先解析 JSON；表单提交时 data 字段为 JSON 字符串
            data = body
            if "data" in body and isinstance(body["data"], str):
                try:
                    data = json.loads(body["data"])
                except Exception:
                    data = body

            # 模拟存在缺陷的 merge：直接处理 __proto__ 键
            proto = data.get("__proto__", {}) if isinstance(data, dict) else {}
            if isinstance(proto, dict) and proto.get("isAdmin") is True:
                _admin_flag["isAdmin"] = True
                html = """<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>更新成功</title></head>
<body>
    <h1>更新成功</h1>
    <p>已合并用户数据，原型链已被污染（isAdmin=true）。</p>
    <p><a href="/admin">访问 /admin 查看 Flag</a></p>
</body>
</html>"""
                self._send_html(html)
            else:
                html = """<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>更新成功</title></head>
<body>
    <h1>更新成功</h1>
    <p>已合并用户数据，但未触发原型链污染。</p>
    <p><a href="/">返回</a></p>
</body>
</html>"""
                self._send_html(html)
        else:
            self._send_json({"error": "not found"}, 404)


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8107
    run_server(Handler, port)
