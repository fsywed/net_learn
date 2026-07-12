#!/usr/bin/env python3
"""靶机 38：反调试对抗 — 下载带反调试的"二进制"，绕过后获得密码，输入密码拿 Flag。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse


PASSWORD = "letmein"


def _val(body, key, default=""):
    v = body.get(key, default)
    if isinstance(v, list):
        return v[0] if v else default
    return v


class Handler(TargetHandler):
    flag_locations = ["用 LD_PRELOAD hook ptrace 绕过反调试，输入密码 letmein"]

    def _send_text(self, text: str, filename: str = None):
        body = text.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        if filename:
            self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
        self.end_headers()
        self.wfile.write(body)

    def _build_script(self) -> str:
        return """#!/usr/bin/env python3
# 模拟带反调试的二进制（Python 版）
import os, sys

def anti_debug():
    # 模拟 ptrace(PTRACE_TRACEME) 反调试检测
    # 真实二进制中：if ptrace(PTRACE_TRACEME, 0, 0, 0) < 0: exit(1)
    # 此处用环境变量 DEBUGGER 模拟，默认 "1"（视为被调试）
    return os.environ.get("DEBUGGER", "1") != "0"

if anti_debug():
    print("检测到调试器！程序退出。")
    sys.exit(1)

# 反调试绕过后可见
PASSWORD = "letmein"
print("隐藏的密码:", PASSWORD)
"""

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/":
            html = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>反调试对抗</title>
<style>
body { font-family: sans-serif; background: #1a0f1e; color: #f3e8ff; max-width: 860px; margin: 0 auto; padding: 20px; }
h1 { color: #c084fc; }
.box { background: #2d1b3d; padding: 20px; border-radius: 10px; margin: 15px 0; }
a.dl { display: inline-block; padding: 12px 24px; background: #c084fc; color: #1a0f1e; border-radius: 6px; text-decoration: none; font-weight: bold; }
label { display: block; margin: 10px 0; }
input { width: 100%; padding: 10px; background: #3d2952; color: #f3e8ff; border: 1px solid #4d3962; border-radius: 6px; box-sizing: border-box; }
button { padding: 10px 20px; background: #c084fc; color: #1a0f1e; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
.hint { background: #2d2d1f; color: #fde68a; padding: 12px; border-radius: 6px; }
code { background: #3d2952; padding: 2px 6px; border-radius: 4px; }
</style>
</head>
<body>
<h1>🐞 反调试对抗</h1>
<div class="box">
<h3>下载"二进制"</h3>
<a class="dl" href="/download">下载 anti_debug.py</a>
</div>
<div class="box">
<h3>输入绕过反调试后得到的密码</h3>
<form method="POST" action="/verify">
  <label>密码:</label>
  <input name="password" placeholder="从程序中提取的密码">
  <button type="submit">验证</button>
</form>
</div>
<div class="hint">
<strong>提示：</strong>程序运行时会检测调试器并退出。<br>
- 真实场景：用 <code>LD_PRELOAD</code> hook <code>ptrace</code> 使其返回 0 绕过；<br>
- 此处模拟：设置 <code>DEBUGGER=0</code> 环境变量再运行，即可看到隐藏密码；<br>
- 将密码提交到此处即可获得 Flag。
</div>
</body>
</html>"""
            self._send_html(html)
        elif parsed.path == "/download":
            self._send_text(self._build_script(), filename="anti_debug.py")
        else:
            self._send_html("<h1>404</h1>", 404)

    def handle_post(self, parsed: urlparse):
        if parsed.path == "/verify":
            body = self._read_body()
            password = _val(body, "password", "")
            if password.strip() == PASSWORD:
                html = f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>验证成功</title>
<style>body{{font-family:sans-serif;background:#1a0f1e;color:#f3e8ff;padding:40px;}}
.flag{{background:#064e3b;color:#a7f3d0;padding:20px;border-radius:10px;font-size:20px;word-break:break-all;}}</style>
</head><body><h1>✅ 验证成功！</h1>
<div class="flag">Flag: {self.flag}</div>
<p>方法：绕过反调试后获得密码 <code>{PASSWORD}</code>，提交即得 Flag。</p>
</body></html>"""
                self._send_html(html)
            else:
                self._send_html(
                    f"<h1>❌ 密码错误</h1><p>你提交的: {password}</p><p><a href='/'>返回</a></p>",
                    401,
                )
        else:
            self._send_json({"error": "not found"}, 404)


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8118
    run_server(Handler, port)
