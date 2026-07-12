#!/usr/bin/env python3
"""靶机 32：RSA 小公钥指数攻击 — e=3 且 m^3 < n，对密文 c 开立方根即可还原明文。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse


def _val(body, key, default=""):
    v = body.get(key, default)
    if isinstance(v, list):
        return v[0] if v else default
    return v


class Handler(TargetHandler):
    flag_locations = ["对密文 c 开立方根还原明文"]

    _params = None

    def _get_params(self):
        if Handler._params is None:
            m = int.from_bytes(self.flag.encode(), "big")
            c = m ** 3              # e=3，且 m^3 < n，未取模
            n = m ** 3 + 1          # n 大于 m^3（简化：非素数乘积，但不影响开方攻击）
            Handler._params = {"n": n, "e": 3, "c": c, "m": m}
        return Handler._params

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/":
            p = self._get_params()
            html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>RSA 小指数攻击</title>
<style>
body {{ font-family: sans-serif; background: #0f172a; color: #e2e8f0; max-width: 860px; margin: 0 auto; padding: 20px; }}
h1 {{ color: #38bdf8; }}
.box {{ background: #1e293b; padding: 20px; border-radius: 10px; margin: 15px 0; }}
.params {{ background: #0b1220; border: 1px solid #334155; border-radius: 8px; padding: 15px; font-family: monospace; word-break: break-all; line-height: 1.8; }}
label {{ display: block; margin: 10px 0; }}
input {{ width: 100%; padding: 10px; background: #334155; color: #e2e8f0; border: 1px solid #475569; border-radius: 6px; box-sizing: border-box; }}
button {{ padding: 10px 20px; background: #38bdf8; color: #0f172a; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }}
.hint {{ background: #422006; color: #fde68a; padding: 12px; border-radius: 6px; }}
</style>
</head>
<body>
<h1>🔐 RSA 小公钥指数攻击</h1>
<div class="box">
<h3>已知 RSA 参数</h3>
<div class="params">
n = {p['n']}<br>
e = {p['e']}<br>
c = {p['c']}
</div>
</div>
<div class="box">
<h3>提交还原的明文（Flag 字符串）</h3>
<form method="POST" action="/verify">
  <label>明文 (plaintext):</label>
  <input name="plaintext" placeholder="还原出的明文">
  <button type="submit">验证</button>
</form>
</div>
<div class="hint">
<strong>提示：</strong>公钥指数 e=3 很小，且明文 m 的三次方仍小于 n，因此 c = m^3（未取模）。
直接对 c 开立方根得到 m，再用 bytes.fromhex(hex(m)[2:]) 还原 Flag 字符串。
</div>
</body>
</html>"""
            self._send_html(html)
        elif parsed.path == "/verify":
            self._send_html("<h1>请使用 POST 提交明文</h1>")
        else:
            self._send_html("<h1>404</h1>", 404)

    def handle_post(self, parsed: urlparse):
        if parsed.path == "/verify":
            body = self._read_body()
            plaintext = _val(body, "plaintext", "")
            if plaintext.strip() == self.flag:
                html = f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>验证成功</title>
<style>body{{font-family:sans-serif;background:#0f172a;color:#e2e8f0;padding:40px;}}
.flag{{background:#064e3b;color:#a7f3d0;padding:20px;border-radius:10px;font-size:20px;word-break:break-all;}}</style>
</head><body><h1>✅ 验证成功！</h1>
<div class="flag">Flag: {self.flag}</div>
<p>攻击方法：c = m^3，对 c 开整数立方根得 m，再转字节得到 Flag。</p>
</body></html>"""
                self._send_html(html)
            else:
                self._send_html(
                    f"<h1>❌ 明文错误</h1><p>你提交的: {plaintext}</p><p><a href='/'>返回</a></p>",
                    401,
                )
        else:
            self._send_json({"error": "not found"}, 404)


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8112
    run_server(Handler, port)
