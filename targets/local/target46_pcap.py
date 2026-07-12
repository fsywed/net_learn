#!/usr/bin/env python3
"""靶机 46：PCAP 流量分析 — 从模拟的 pcap 流量日志中提取含有 Flag 的 HTTP 请求。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse


class Handler(TargetHandler):
    flag_locations = ["用 Wireshark 过滤 http，Export Objects 导出文件"]

    def _send_text(self, text: str, filename: str = None):
        body = text.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        if filename:
            self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
        self.end_headers()
        self.wfile.write(body)

    def _build_pcap_log(self) -> str:
        """构造模拟 pcap 流量日志，其中一行 POST 请求包含 Flag。"""
        return (
            "===== PCAP 流量日志 (模拟 Wireshark 输出) =====\n"
            "捕获文件: capture.pcapng\n"
            "捕获时间: 2024-01-15 10:23:01 - 10:23:35\n"
            "\n"
            "Frame 1  | TCP | 192.168.1.100:51234 -> 192.168.1.1:80  | SYN\n"
            "Frame 2  | TCP | 192.168.1.1:80 -> 192.168.1.100:51234   | SYN, ACK\n"
            "Frame 3  | TCP | 192.168.1.100:51234 -> 192.168.1.1:80  | ACK\n"
            "Frame 4  | HTTP GET | 192.168.1.100 -> 192.168.1.1\n"
            "         GET /index.html HTTP/1.1\n"
            "         Host: www.example.com\n"
            "         User-Agent: Mozilla/5.0\n"
            "\n"
            "Frame 5  | HTTP/1.1 | 192.168.1.1 -> 192.168.1.100\n"
            "         200 OK\n"
            "         Content-Type: text/html\n"
            "\n"
            "Frame 6  | HTTP GET | 192.168.1.101 -> 192.168.1.1\n"
            "         GET /style.css HTTP/1.1\n"
            "         Host: www.example.com\n"
            "\n"
            "Frame 7  | HTTP POST | 192.168.1.102 -> 192.168.1.1\n"
            "         POST /api/upload HTTP/1.1\n"
            "         Host: www.example.com\n"
            "         Content-Type: application/x-www-form-urlencoded\n"
            f"         Content-Length: {len(self.flag) + 5}\n"
            "         \n"
            f"         data={self.flag}\n"
            "\n"
            "Frame 8  | HTTP/1.1 | 192.168.1.1 -> 192.168.1.102\n"
            "         200 OK\n"
            "         {\"status\": \"success\"}\n"
            "\n"
            "Frame 9  | HTTP GET | 192.168.1.103 -> 192.168.1.1\n"
            "         GET /images/logo.png HTTP/1.1\n"
            "\n"
            "Frame 10 | HTTP/1.1 | 192.168.1.1 -> 192.168.1.103\n"
            "         200 OK\n"
            "         Content-Type: image/png\n"
        )

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/":
            html = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>PCAP 流量分析</title>
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
<h1>🔍 PCAP 流量分析</h1>
<div class="box">
<h3>下载流量捕获文件</h3>
<a class="dl" href="/pcap">下载 capture.txt</a>
</div>
<div class="hint">
<strong>提示：</strong>流量中有一条 POST 请求携带了 Flag。<br>
- 真实场景：用 <code>Wireshark</code> 打开 pcap 文件，过滤 <code>http</code> 协议；<br>
- 查看各 HTTP 请求的详情，或使用 <code>File → Export Objects → HTTP</code> 导出传输的文件；<br>
- 在 POST 请求的请求体中找到 Flag。
</div>
</body>
</html>"""
            self._send_html(html)
        elif parsed.path == "/pcap":
            self._send_text(self._build_pcap_log(), filename="capture.txt")
        else:
            self._send_html("<h1>404</h1>", 404)


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8126
    run_server(Handler, port)
