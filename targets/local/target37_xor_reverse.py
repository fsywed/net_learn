#!/usr/bin/env python3
"""靶机 37：XOR 逆向 — 下载"二进制"(Python 脚本)，逆向 XOR 循环解密 Flag。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse


def _val(body, key, default=""):
    v = body.get(key, default)
    if isinstance(v, list):
        return v[0] if v else default
    return v


class Handler(TargetHandler):
    flag_locations = ["用 strings/Ghidra 发现 XOR 循环，提取密钥 0x42 解密"]

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
        ct = [ord(c) ^ 0x42 for c in self.flag]
        return f"""#!/usr/bin/env python3
# 模拟逆向二进制（Python 版）
# 提示：用 strings / Ghidra 可发现 XOR 解密循环与密钥
KEY = 0x42
ct = {ct}

def check(s):
    return all(ord(s[i]) ^ KEY == ct[i] for i in range(len(ct)))

if __name__ == "__main__":
    inp = input("Enter flag: ")
    print("Correct!" if check(inp) else "Wrong")
"""

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/":
            html = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>XOR 逆向</title>
<style>
body { font-family: sans-serif; background: #0c1c2e; color: #e2e8f0; max-width: 860px; margin: 0 auto; padding: 20px; }
h1 { color: #60a5fa; }
.box { background: #14304e; padding: 20px; border-radius: 10px; margin: 15px 0; }
a.dl { display: inline-block; padding: 12px 24px; background: #60a5fa; color: #0c1c2e; border-radius: 6px; text-decoration: none; font-weight: bold; }
label { display: block; margin: 10px 0; }
input { width: 100%; padding: 10px; background: #1e3a5f; color: #e2e8f0; border: 1px solid #2e4a73; border-radius: 6px; box-sizing: border-box; }
button { padding: 10px 20px; background: #60a5fa; color: #0c1c2e; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
.hint { background: #2d2d1f; color: #fde68a; padding: 12px; border-radius: 6px; }
code { background: #1e3a5f; padding: 2px 6px; border-radius: 4px; }
</style>
</head>
<body>
<h1>🔬 XOR 逆向</h1>
<div class="box">
<h3>下载"二进制"</h3>
<a class="dl" href="/download">下载 challenge.py</a>
</div>
<div class="box">
<h3>提交解密后的 Flag</h3>
<form method="POST" action="/verify">
  <label>Flag:</label>
  <input name="flag" placeholder="解密得到的 Flag">
  <button type="submit">验证</button>
</form>
</div>
<div class="hint">
<strong>提示：</strong>下载的脚本中包含 XOR 加密的 Flag。<br>
- 用 strings / Ghidra 分析可发现 <code>XOR</code> 循环与密钥 <code>0x42</code>；<br>
- 解密：<code>chr(ct[i] ^ 0x42)</code>，拼接得到 Flag。
</div>
</body>
</html>"""
            self._send_html(html)
        elif parsed.path == "/download":
            self._send_text(self._build_script(), filename="challenge.py")
        else:
            self._send_html("<h1>404</h1>", 404)

    def handle_post(self, parsed: urlparse):
        if parsed.path == "/verify":
            body = self._read_body()
            flag = _val(body, "flag", "")
            if flag.strip() == self.flag:
                html = f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>验证成功</title>
<style>body{{font-family:sans-serif;background:#0c1c2e;color:#e2e8f0;padding:40px;}}
.flag{{background:#064e3b;color:#a7f3d0;padding:20px;border-radius:10px;font-size:20px;word-break:break-all;}}</style>
</head><body><h1>✅ 验证成功！</h1>
<div class="flag">Flag: {self.flag}</div>
<p>逆向方法：定位 XOR 循环，提取密钥 0x42，逐字节 <code>ct[i] ^ 0x42</code> 解密。</p>
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
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8117
    run_server(Handler, port)
