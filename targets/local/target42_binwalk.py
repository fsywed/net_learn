#!/usr/bin/env python3
"""靶机 42：文件分离提取 — Flag 嵌入在组合文件末尾，用 binwalk 提取。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse


class Handler(TargetHandler):
    flag_locations = ["用 binwalk -e 提取嵌入的 flag.txt"]

    def _send_binary(self, data: bytes, filename: str = None, content_type: str = "application/octet-stream"):
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        if filename:
            self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
        self.end_headers()
        self.wfile.write(data)

    def _build_combined_file(self) -> bytes:
        """构造组合文件：PNG 签名 + 填充数据 + flag.txt 内容。"""
        png_sig = b'\x89PNG\r\n\x1a\n'
        padding = b'\x00' * 64
        flag_txt = f"flag.txt\n{self.flag}\n".encode("utf-8")
        return png_sig + padding + flag_txt

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/":
            html = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>文件分离提取</title>
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
<h1>📦 文件分离提取</h1>
<div class="box">
<h3>下载组合文件</h3>
<a class="dl" href="/file">下载 challenge_file.bin</a>
</div>
<div class="hint">
<strong>提示：</strong>下载的文件是多个文件拼接的组合体。<br>
- 真实场景：用 <code>binwalk -e challenge_file.bin</code> 自动提取嵌入的文件；<br>
- 此处模拟：文件以 PNG 签名开头，末尾追加 flag.txt 内容，用 binwalk 即可分离提取。
</div>
</body>
</html>"""
            self._send_html(html)
        elif parsed.path == "/file":
            self._send_binary(self._build_combined_file(), filename="challenge_file.bin")
        else:
            self._send_html("<h1>404</h1>", 404)


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8122
    run_server(Handler, port)
