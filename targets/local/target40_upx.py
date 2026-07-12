#!/usr/bin/env python3
"""靶机 40：UPX 脱壳 — 下载"UPX 加壳"的脚本（base64 编码），脱壳后找到 Flag。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse
import base64


def _val(body, key, default=""):
    v = body.get(key, default)
    if isinstance(v, list):
        return v[0] if v else default
    return v


class Handler(TargetHandler):
    flag_locations = ["用 upx -d 脱壳后用 strings 找到 Flag"]

    def _send_text(self, text: str, filename: str = None):
        body = text.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        if filename:
            self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
        self.end_headers()
        self.wfile.write(body)

    def _build_packed(self) -> str:
        """构造"UPX 加壳"的脚本：内层脚本被 base64 编码（模拟脱壳）。"""
        inner = (
            "#!/usr/bin/env python3\n"
            "# 脱壳后的程序\n"
            f'FLAG = "{self.flag}"\n'
            'print("程序运行中...")\n'
            "print(FLAG)\n"
        )
        packed = base64.b64encode(inner.encode("utf-8")).decode("ascii")
        return (
            "#!/usr/bin/env python3\n"
            "# 此文件经 UPX 加壳（此处用 base64 模拟壳层）\n"
            "# 脱壳方法：upx -d challenge_upx（此处为 base64 解码）\n"
            "PACKED = (\n"
            f'    "{packed}"\n'
            ")\n"
            "import base64\n"
            "exec(base64.b64decode(PACKED))\n"
        )

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/":
            html = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>UPX 脱壳</title>
<style>
body { font-family: sans-serif; background: #1e1b0f; color: #fef3c7; max-width: 860px; margin: 0 auto; padding: 20px; }
h1 { color: #facc15; }
.box { background: #2e2814; padding: 20px; border-radius: 10px; margin: 15px 0; }
a.dl { display: inline-block; padding: 12px 24px; background: #facc15; color: #1e1b0f; border-radius: 6px; text-decoration: none; font-weight: bold; }
label { display: block; margin: 10px 0; }
input { width: 100%; padding: 10px; background: #3e3820; color: #fef3c7; border: 1px solid #4e4830; border-radius: 6px; box-sizing: border-box; }
button { padding: 10px 20px; background: #facc15; color: #1e1b0f; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
.hint { background: #2d2d1f; color: #fde68a; padding: 12px; border-radius: 6px; }
code { background: #3e3820; padding: 2px 6px; border-radius: 4px; }
</style>
</head>
<body>
<h1>📦 UPX 脱壳</h1>
<div class="box">
<h3>下载"加壳"程序</h3>
<a class="dl" href="/download">下载 challenge_upx.py</a>
</div>
<div class="box">
<h3>提交脱壳后找到的 Flag</h3>
<form method="POST" action="/verify">
  <label>Flag:</label>
  <input name="flag" placeholder="脱壳后提取的 Flag">
  <button type="submit">验证</button>
</form>
</div>
<div class="hint">
<strong>提示：</strong>下载的文件是"UPX 加壳"的程序（此处用 base64 模拟壳层）。<br>
- 真实场景：<code>upx -d challenge_upx</code> 脱壳后用 <code>strings</code> 找到 Flag；<br>
- 此处模拟：对 <code>PACKED</code> 内容做 base64 解码，即可看到内层脚本中的 Flag。
</div>
</body>
</html>"""
            self._send_html(html)
        elif parsed.path == "/download":
            self._send_text(self._build_packed(), filename="challenge_upx.py")
        else:
            self._send_html("<h1>404</h1>", 404)

    def handle_post(self, parsed: urlparse):
        if parsed.path == "/verify":
            body = self._read_body()
            flag = _val(body, "flag", "")
            if flag.strip() == self.flag:
                html = f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>验证成功</title>
<style>body{{font-family:sans-serif;background:#1e1b0f;color:#fef3c7;padding:40px;}}
.flag{{background:#064e3b;color:#a7f3d0;padding:20px;border-radius:10px;font-size:20px;word-break:break-all;}}</style>
</head><body><h1>✅ 验证成功！</h1>
<div class="flag">Flag: {self.flag}</div>
<p>方法：脱壳（base64 解码）后在内层脚本中找到 Flag。</p>
</body></html>"""
                self._send_html(html)
            else:
                self._send_html(
                    f"<h1>❌ Flag 错误</h1><p>你提交的: {flag}</p><p><a href='/'>返回</a></p>",
                    401,
                )
        else:
            self._send_json({"error": "not found"}, 404)


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8120
    run_server(Handler, port)
