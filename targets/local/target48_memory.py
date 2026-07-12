#!/usr/bin/env python3
"""靶机 48：内存取证 — 从模拟的内存进程列表中发现包含 Flag 的可疑进程。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse


class Handler(TargetHandler):
    flag_locations = ["用 volatility pslist 发现可疑进程，dump 内存搜索 Flag"]

    def _send_text(self, text: str, filename: str = None):
        body = text.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        if filename:
            self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
        self.end_headers()
        self.wfile.write(body)

    def _build_memory_log(self) -> str:
        """构造模拟内存进程列表（volatility pslist 输出格式）。"""
        return (
            "Volatility Foundation Volatility Framework 2.6\n"
            "Offset(V)          Name                    PID   PPID   Thds   Hnds   Sess  Wow64 Start\n"
            "------------------ ---------------------- ----- ------ ------ ------ ----- ----- -----------\n"
            "0x8040123400000000 System                    4      0     88    543 -----  False 2024-01-15 08:00:01\n"
            "0x8040234560000000 smss.exe                264      4      2     29 -----  False 2024-01-15 08:00:01\n"
            "0x8040345670000000 csrss.exe               372    364      9    327      0  False 2024-01-15 08:00:02\n"
            "0x8040456780000000 wininit.exe             400    364      3     75      0  False 2024-01-15 08:00:02\n"
            "0x8040567890000000 services.exe            508    400     12    194      0  False 2024-01-15 08:00:03\n"
            "0x8040678900000000 lsass.exe               520    400      7    552      0  False 2024-01-15 08:00:03\n"
            "0x8040789010000000 svchost.exe             612    508     10    357      0  False 2024-01-15 08:00:04\n"
            "0x8040890120000000 svchost.exe             728    508     18    423      0  False 2024-01-15 08:00:04\n"
            "0x8040901230000000 svchost.exe             832    508      9    287      0  False 2024-01-15 08:00:04\n"
            "0x8040a12340000000 explorer.exe           1516   1476     25    815      1  False 2024-01-15 08:02:15\n"
            "0x8040b12345000000 chrome.exe             1948   1516     38   1243      1  False 2024-01-15 08:03:20\n"
            f"0x8040c12346000000 {self.flag}.exe        1852   1516      5     89      1  False 2024-01-15 08:04:33\n"
            "0x8040d12347000000 svchost.exe            2036    508      4     67      0  False 2024-01-15 08:05:01\n"
            "0x8040e12348000000 spoolsv.exe            1180    508      8    134      0  False 2024-01-15 08:05:10\n"
        )

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/":
            html = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>内存取证分析</title>
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
<h1>🧠 内存取证分析</h1>
<div class="box">
<h3>下载内存进程列表</h3>
<a class="dl" href="/memory">下载 memory_pslist.txt</a>
</div>
<div class="hint">
<strong>提示：</strong>这是内存镜像的进程列表（模拟 volatility pslist 输出）。<br>
- 真实场景：用 <code>volatility -f memory.dmp pslist</code> 列出所有进程；<br>
- 观察进程名，寻找可疑的、非系统标准名称的进程；<br>
- 用 <code>volatility -f memory.dmp --profile=Win7SP1x64 memdump -p PID</code> dump 可疑进程内存，搜索 Flag。
</div>
</body>
</html>"""
            self._send_html(html)
        elif parsed.path == "/memory":
            self._send_text(self._build_memory_log(), filename="memory_pslist.txt")
        else:
            self._send_html("<h1>404</h1>", 404)


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8128
    run_server(Handler, port)
