#!/usr/bin/env python3
"""靶机 39：算法逆向 — 下载含自定义加密算法的脚本，逆向并解密 Flag。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse


def _val(body, key, default=""):
    v = body.get(key, default)
    if isinstance(v, list):
        return v[0] if v else default
    return v


def _encrypt_char(c: str) -> int:
    """加密算法：ASCII 值 +3 后 XOR 0x55。"""
    return (ord(c) + 3) ^ 0x55


class Handler(TargetHandler):
    flag_locations = ["逆向分析加密算法（+3 后 XOR 0x55），编写解密脚本"]

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
        ct = [_encrypt_char(c) for c in self.flag]
        return f"""#!/usr/bin/env python3
# 自定义加密算法（需逆向）
def encrypt(s):
    out = []
    for c in s:
        out.append((ord(c) + 3) ^ 0x55)
    return out

ct = {ct}

def check(s):
    return encrypt(s) == ct

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
<title>算法逆向</title>
<style>
body { font-family: sans-serif; background: #0f1e1a; color: #d1fae5; max-width: 860px; margin: 0 auto; padding: 20px; }
h1 { color: #34d399; }
.box { background: #143028; padding: 20px; border-radius: 10px; margin: 15px 0; }
a.dl { display: inline-block; padding: 12px 24px; background: #34d399; color: #0f1e1a; border-radius: 6px; text-decoration: none; font-weight: bold; }
label { display: block; margin: 10px 0; }
input { width: 100%; padding: 10px; background: #1f4a3a; color: #d1fae5; border: 1px solid #2f5a4a; border-radius: 6px; box-sizing: border-box; }
button { padding: 10px 20px; background: #34d399; color: #0f1e1a; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
.hint { background: #2d2d1f; color: #fde68a; padding: 12px; border-radius: 6px; }
code { background: #1f4a3a; padding: 2px 6px; border-radius: 4px; }
</style>
</head>
<body>
<h1>🧬 算法逆向</h1>
<div class="box">
<h3>下载加密脚本</h3>
<a class="dl" href="/download">下载 algo.py</a>
</div>
<div class="box">
<h3>提交解密后的 Flag</h3>
<form method="POST" action="/verify">
  <label>Flag:</label>
  <input name="flag" placeholder="逆向解密得到的 Flag">
  <button type="submit">验证</button>
</form>
</div>
<div class="hint">
<strong>提示：</strong>脚本中 <code>encrypt</code> 函数对每个字符做变换后与密文 <code>ct</code> 比较。<br>
- 逆向分析算法：每字符 <code>(ord(c) + 3) ^ 0x55</code>；<br>
- 解密：<code>chr((ct[i] ^ 0x55) - 3)</code>，拼接得到 Flag。
</div>
</body>
</html>"""
            self._send_html(html)
        elif parsed.path == "/download":
            self._send_text(self._build_script(), filename="algo.py")
        else:
            self._send_html("<h1>404</h1>", 404)

    def handle_post(self, parsed: urlparse):
        if parsed.path == "/verify":
            body = self._read_body()
            flag = _val(body, "flag", "")
            if flag.strip() == self.flag:
                html = f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>验证成功</title>
<style>body{{font-family:sans-serif;background:#0f1e1a;color:#d1fae5;padding:40px;}}
.flag{{background:#064e3b;color:#a7f3d0;padding:20px;border-radius:10px;font-size:20px;word-break:break-all;}}</style>
</head><body><h1>✅ 验证成功！</h1>
<div class="flag">Flag: {self.flag}</div>
<p>逆向方法：算法为 (ord+3)^0x55，逆运算 chr((ct^0x55)-3) 解密。</p>
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
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8119
    run_server(Handler, port)
