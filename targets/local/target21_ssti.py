#!/usr/bin/env python3
"""靶机 21：SSTI 模板注入 — 服务端模板渲染用户输入，可执行任意代码读取 Flag。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse


class Handler(TargetHandler):
    flag_locations = ["通过 SSTI 注入 {{config.__class__.__init__.__globals__['os'].popen('cat /flag.txt').read()}} 读取 Flag"]

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/" or parsed.path == "/render":
            html = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>模板渲染引擎</title>
    <style>
        body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .box { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
        input { padding: 10px; border: 1px solid #ddd; border-radius: 5px; width: 420px; }
        button { padding: 10px 20px; background: #2196F3; color: #fff; border: none; border-radius: 5px; cursor: pointer; }
        pre { background: #000; color: #0f0; padding: 15px; border-radius: 5px; overflow-x: auto; }
        .hint { color: #999; font-size: 12px; }
    </style>
</head>
<body>
    <h1>模板渲染引擎</h1>
    <p>欢迎使用 Jinja2 模板渲染服务，输入内容将作为模板被渲染。</p>
    <div class="box">
        <form method="POST" action="/render">
            <input type="text" name="input" placeholder="输入模板内容，如 Hello {{name}}" required>
            <button type="submit">渲染</button>
        </form>
    </div>
    <p class="hint">提示：模板引擎直接渲染用户输入，试试 {{7*7}} 看看会发生什么。</p>
</body>
</html>"""
            self._send_html(html)
        else:
            self._send_html("<h1>404</h1>", 404)

    def handle_post(self, parsed: urlparse):
        if parsed.path == "/render":
            body = self._read_body()
            user_input = body.get("input", "")

            rce_keywords = ["__class__", "popen", "__globals__", "__init__",
                            "os.popen", "os.system", "subprocess", "config.__"]
            if any(kw in user_input for kw in rce_keywords):
                html = f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>渲染结果</title>
<style>pre{{background:#000;color:#0f0;padding:15px;border-radius:5px;}}</style>
</head>
<body>
    <h1>渲染结果</h1>
    <p>SSTI 漏洞利用成功！通过模板执行了系统命令。</p>
    <pre>$ cat /flag.txt
{self.flag}</pre>
    <p>漏洞原因：用户输入直接作为模板渲染，未对 {{{{...}}}} 表达式过滤，可访问 Python 对象链执行任意代码。</p>
    <p><a href="/">返回</a></p>
</body>
</html>"""
                self._send_html(html)
            elif "{{7*7}}" in user_input:
                rendered = user_input.replace("{{7*7}}", "49")
                html = f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>渲染结果</title>
<style>pre{{background:#000;color:#0f0;padding:15px;border-radius:5px;}}</style>
</head>
<body>
    <h1>渲染结果</h1>
    <pre>{rendered}</pre>
    <p>模板表达式被执行！{{7*7}} = 49，证明存在 SSTI 漏洞。</p>
    <p>提示：继续利用对象链读取 Flag 文件。</p>
    <p><a href="/">返回</a></p>
</body>
</html>"""
                self._send_html(html)
            else:
                html = f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>渲染结果</title></head>
<body>
    <h1>渲染结果</h1>
    <pre>{user_input}</pre>
    <p>原样输出，未检测到模板表达式。</p>
    <p><a href="/">返回</a></p>
</body>
</html>"""
                self._send_html(html)
        else:
            self._send_json({"error": "not found"}, 404)


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8101
    run_server(Handler, port)
