#!/usr/bin/env python3
"""靶机 49：日志分析 — 从 Apache 访问日志中提取 SQL 注入 Payload 中的 Flag。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse


class Handler(TargetHandler):
    flag_locations = ["用 grep 过滤 SQL 注入特征，提取 Payload 中的 Flag"]

    def _send_text(self, text: str, filename: str = None):
        body = text.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        if filename:
            self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
        self.end_headers()
        self.wfile.write(body)

    def _build_log(self) -> str:
        """构造模拟 Apache 访问日志，包含 SQL 注入攻击记录。"""
        return (
            "# Apache Access Log (模拟)\n"
            "# 格式: 客户端IP - - [时间] \"请求行\" 状态码 响应大小\n"
            "\n"
            '192.168.1.100 - - [15/Jan/2024:10:23:01 +0800] "GET /index.php HTTP/1.1" 200 1234\n'
            '192.168.1.100 - - [15/Jan/2024:10:23:05 +0800] "GET /about.php HTTP/1.1" 200 567\n'
            '192.168.1.100 - - [15/Jan/2024:10:23:10 +0800] "GET /contact.php HTTP/1.1" 200 890\n'
            '192.168.1.101 - - [15/Jan/2024:10:23:15 +0800] "GET /login.php HTTP/1.1" 200 1200\n'
            '192.168.1.101 - - [15/Jan/2024:10:23:20 +0800] "POST /login.php HTTP/1.1" 302 0\n'
            '192.168.1.102 - - [15/Jan/2024:10:23:25 +0800] "GET /search.php?q=test HTTP/1.1" 200 456\n'
            '192.168.1.102 - - [15/Jan/2024:10:23:30 +0800] "GET /search.php?q=1&sort=asc HTTP/1.1" 200 789\n'
            '192.168.1.102 - - [15/Jan/2024:10:23:35 +0800] "GET /search.php?q=1\' OR \'1\'=\'1 HTTP/1.1" 200 1234\n'
            f'192.168.1.102 - - [15/Jan/2024:10:23:40 +0800] "GET /search.php?q=1\' UNION SELECT 1,2,\'{self.flag}\'-- HTTP/1.1" 200 5678\n'
            '192.168.1.103 - - [15/Jan/2024:10:23:45 +0800] "GET /admin.php HTTP/1.1" 403 0\n'
            '192.168.1.103 - - [15/Jan/2024:10:23:50 +0800] "GET /search.php?q=1; DROP TABLE users-- HTTP/1.1" 500 0\n'
            '192.168.1.103 - - [15/Jan/2024:10:23:55 +0800] "GET /search.php?q=test123 HTTP/1.1" 200 345\n'
            '192.168.1.104 - - [15/Jan/2024:10:24:00 +0800] "GET /products.php?id=5 HTTP/1.1" 200 678\n'
        )

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/":
            html = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>日志分析</title>
<style>
body { font-family: sans-serif; background: #0f172a; color: #e2e8f0; max-width: 860px; margin: 0 auto; padding: 20px; }
h1 { color: #38bdf8; }
.box { background: #1e293b; padding: 20px; border-radius: 10px; margin: 15px 0; }
a.dl { display: inline-block; padding: 12px 24px; background: #38bdf8; color: #0f172a; border-radius: 6px; text-decoration: none; font-weight: bold; }
.hint { background: #1e1b0f; color: #fde68a; padding: 12px; border-radius: 6px; }
code { background: #334155; padding: 2px 6px; border-radius: 4px; }
</style>
</head>
<body>
<h1>📋 Apache 日志分析</h1>
<div class="box">
<h3>下载访问日志</h3>
<a class="dl" href="/log">下载 access.log</a>
</div>
<div class="hint">
<strong>提示：</strong>日志中包含 SQL 注入攻击记录，Flag 藏在注入 Payload 中。<br>
- 真实场景：用 <code>grep -i "union\\|select\\|or.*1.*1" access.log</code> 过滤 SQL 注入特征；<br>
- 关注 <code>UNION SELECT</code> 注入语句，提取其中泄露的数据；<br>
- Flag 在某条 UNION SELECT 注入的 Payload 中。
</div>
</body>
</html>"""
            self._send_html(html)
        elif parsed.path == "/log":
            self._send_text(self._build_log(), filename="access.log")
        else:
            self._send_html("<h1>404</h1>", 404)


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8129
    run_server(Handler, port)
