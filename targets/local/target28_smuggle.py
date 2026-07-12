#!/usr/bin/env python3
"""靶机 28：HTTP 请求走私 — 构造 CL-TE 走私请求访问受限的 /admin。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse


class Handler(TargetHandler):
    flag_locations = ["构造 CL-TE 请求走私访问 /admin"]

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/":
            html = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>HTTP 请求走私</title>
    <style>
        body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .box { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
        pre { background: #000; color: #0f0; padding: 15px; border-radius: 5px; overflow-x: auto; white-space: pre-wrap; }
        .hint { color: #999; font-size: 12px; }
    </style>
</head>
<body>
    <h1>HTTP 请求走私</h1>
    <div class="box">
        <p>本服务前端（代理）和后端对请求边界的处理不一致，存在 CL-TE 走私漏洞。</p>
        <p>构造一个同时携带 <code>Content-Length</code> 和 <code>Transfer-Encoding: chunked</code> 头的请求，可在请求体中走私第二个请求访问 <code>/admin</code>。</p>
    </div>
    <h2>走私请求示例</h2>
    <pre>POST / HTTP/1.1
Host: localhost
Content-Length: 64
Transfer-Encoding: chunked

0

GET /admin HTTP/1.1
Host: localhost
Foo: bar</pre>
    <p class="hint">提示：向 POST / 发送请求体，若请求体中包含 "GET /admin" 则视为走私成功。</p>
    <p class="hint">可用 curl 测试：<code>curl -X POST http://localhost:PORT/ -H "Content-Length: 64" -H "Transfer-Encoding: chunked" --data-binary $'0\\n\\nGET /admin HTTP/1.1\\nHost: localhost\\nFoo: bar'</code></p>
</body>
</html>"""
            self._send_html(html)
        else:
            self._send_html("<h1>404</h1>", 404)

    def handle_post(self, parsed: urlparse):
        if parsed.path == "/":
            length = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(length) if length > 0 else b""
            body_text = raw.decode(errors="ignore")

            has_cl = "Content-Length" in self.headers
            has_te = "Transfer-Encoding" in self.headers

            if "GET /admin" in body_text:
                html = f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>走私成功</title></head>
<body>
    <h1>请求走私成功！</h1>
    <p>检测到请求体中包含 "GET /admin"，后端将其作为下一个请求处理，访问到管理员接口。</p>
    <p>Content-Length 头存在：{has_cl}</p>
    <p>Transfer-Encoding 头存在：{has_te}</p>
    <p><strong>Flag:</strong> {self.flag}</p>
    <p>漏洞原因：前端按 Content-Length 截断，后端按 Transfer-Encoding: chunked 解析，导致请求体残余被当作新请求。</p>
</body>
</html>"""
                self._send_html(html)
            else:
                html = f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>请求已接收</title></head>
<body>
    <h1>请求已接收</h1>
    <p>未检测到走私请求。</p>
    <p>Content-Length 头存在：{has_cl}</p>
    <p>Transfer-Encoding 头存在：{has_te}</p>
    <p>请求体内容：</p>
    <pre>{body_text}</pre>
    <p class="hint">提示：请求体中需要包含 "GET /admin" 才能触发走私。</p>
</body>
</html>"""
                self._send_html(html)
        else:
            self._send_json({"error": "not found"}, 404)


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8108
    run_server(Handler, port)
