#!/usr/bin/env python3
"""靶机通用基础：生成随机 Flag + 提供 /api/verify 端点。

每个靶机继承此 BaseHandler，只需实现 challenge 页面逻辑。
"""
import os
import secrets
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs


def generate_flag() -> str:
    """每次启动生成唯一 Flag。"""
    return f"flag{{{secrets.token_hex(8)}}}"


# 全局 Flag —— 服务器启动时生成一次，所有请求共用
_GLOBAL_FLAG = generate_flag()


def get_flag() -> str:
    return _GLOBAL_FLAG


class TargetHandler(BaseHTTPRequestHandler):
    """靶机 HTTP 处理器基类。"""

    # 子类设置
    challenge_html = "<h1>靶机</h1>"
    flag_locations = []  # 提示：flag 藏在哪里

    @property
    def flag(self) -> str:
        """返回全局 Flag（每次启动唯一，不是每次请求）。"""
        return _GLOBAL_FLAG

    def _send_json(self, data: dict, status: int = 200):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def _send_html(self, html: str, status: int = 200):
        body = html.encode()
        self.send_response(status)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def _read_body(self) -> dict:
        length = int(self.headers.get("Content-Length", 0))
        if length == 0:
            return {}
        raw = self.rfile.read(length)
        try:
            return json.loads(raw)
        except Exception:
            return parse_qs(raw.decode())

    def do_OPTIONS(self):
        self._send_json({"status": "ok"})

    def do_GET(self):
        parsed = urlparse(self.path)

        # 健康检查
        if parsed.path == "/api/health":
            self._send_json({"status": "ok", "target": self.__class__.__name__})
            return

        # Flag 提示
        if parsed.path == "/api/hint":
            self._send_json({"locations": self.flag_locations})
            return

        # 子类处理
        self.handle_get(parsed)

    def do_POST(self):
        parsed = urlparse(self.path)

        # Flag 验证端点
        if parsed.path == "/api/verify":
            body = self._read_body()
            user_flag = body.get("flag", "")
            correct = user_flag.strip() == self.flag
            self._send_json({
                "correct": correct,
                "message": "Flag 正确！" if correct else "Flag 错误，再找找看。",
            })
            return

        self.handle_post(parsed)

    def handle_get(self, parsed):
        """子类重写：处理 GET 请求（除 /api/* 外）。"""
        self._send_html(self.challenge_html)

    def handle_post(self, parsed):
        """子类重写：处理 POST 请求（除 /api/verify 外）。"""
        self._send_json({"error": "not found"}, 404)

    def log_message(self, format, *args):
        print(f"[{self.__class__.__name__}] {args[0]}")


def run_server(handler_class, port=8080):
    """启动靶机 HTTP 服务。"""
    print(f"{'='*50}")
    print(f"  靶机启动成功！")
    print(f"  Flag: {_GLOBAL_FLAG}")
    print(f"  访问地址: http://localhost:{port}")
    print(f"  验证 API: http://localhost:{port}/api/verify")
    print(f"  健康检查: http://localhost:{port}/api/health")
    print(f"{'='*50}")
    print(f"  把上面的地址输入到网站即可开始挑战。")
    print(f"  按 Ctrl+C 停止。")
    print(f"{'='*50}")

    server = HTTPServer(("0.0.0.0", port), handler_class)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n靶机已停止。")
        server.shutdown()
