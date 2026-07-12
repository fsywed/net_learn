#!/usr/bin/env python3
"""靶机 50：Windows 注册表取证 — 在 Run 键自启动项中发现含 Flag 的程序路径。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse


class Handler(TargetHandler):
    flag_locations = ["分析注册表 Run 键的自启动项，发现含 Flag 的程序路径"]

    def _send_text(self, text: str, filename: str = None):
        body = text.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        if filename:
            self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
        self.end_headers()
        self.wfile.write(body)

    def _build_registry(self) -> str:
        """构造模拟的注册表导出文件（.reg 格式），Run 键中包含含 Flag 的程序路径。"""
        return (
            "Windows Registry Editor Version 5.00\n"
            "\n"
            "[HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run]\n"
            '"SecurityUpdate"="C:\\\\Windows\\\\System32\\\\sec_update.exe"\n'
            f'"AdobeHelper"="C:\\\\Program Files\\\\Adobe\\\\{self.flag}.exe -auto"\n'
            '"JavaUpdater"="C:\\\\Program Files\\\\Java\\\\bin\\\\jusched.exe"\n'
            '"NvidiaDriver"="C:\\\\Program Files\\\\NVIDIA Corporation\\\\nvbackend.exe"\n'
            "\n"
            "[HKEY_CURRENT_USER\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run]\n"
            '"Steam"="C:\\\\Program Files\\\\Steam\\\\steam.exe -silent"\n'
            '"Discord"="C:\\\\Users\\\\user\\\\AppData\\\\Local\\\\Discord\\\\Update.exe"\n'
            '"OneDrive"="C:\\\\Users\\\\user\\\\AppData\\\\Local\\\\Microsoft\\\\OneDrive\\\\OneDrive.exe"\n'
            "\n"
            "[HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\RunOnce]\n"
            '"SetupComplete"="C:\\\\Windows\\\\System32\\\\setupcomplete.cmd"\n'
            "\n"
            "[HKEY_CURRENT_USER\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\RunOnce]\n"
            '"Installer"="rundll32.exe C:\\\\Users\\\\user\\\\AppData\\\\Local\\\\Temp\\\\setup.dll,Start"\n'
        )

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/":
            html = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>注册表取证分析</title>
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
<h1>🗂️ Windows 注册表取证</h1>
<div class="box">
<h3>下载注册表导出文件</h3>
<a class="dl" href="/registry">下载 registry_export.reg</a>
</div>
<div class="hint">
<strong>提示：</strong>Flag 隐藏在注册表的自启动项中。<br>
- 真实场景：用 <code>regedit</code> 或 <code>reg query</code> 导出注册表；<br>
- 重点检查 <code>HKLM\\...\\Run</code> 和 <code>HKCU\\...\\Run</code> 键下的自启动程序；<br>
- 恶意软件常在 Run 键中设置自启动，留意可疑的程序路径。
</div>
</body>
</html>"""
            self._send_html(html)
        elif parsed.path == "/registry":
            self._send_text(self._build_registry(), filename="registry_export.reg")
        else:
            self._send_html("<h1>404</h1>", 404)


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8130
    run_server(Handler, port)
