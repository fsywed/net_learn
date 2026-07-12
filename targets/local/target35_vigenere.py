#!/usr/bin/env python3
"""靶机 35：维吉尼亚密码 — Flag 用维吉尼亚加密（字节级 mod 256），需破解密钥解密。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse


KEY = b"CRYPT"  # 密钥（长度 5，大写字母）


def _val(body, key, default=""):
    v = body.get(key, default)
    if isinstance(v, list):
        return v[0] if v else default
    return v


def _vigenere_encrypt(data: bytes, key: bytes) -> bytes:
    return bytes((b + key[i % len(key)]) % 256 for i, b in enumerate(data))


class Handler(TargetHandler):
    flag_locations = ["Kasiski 测试确定密钥长度，频率分析还原密钥"]

    _cipher = None

    def _get_cipher(self):
        if Handler._cipher is None:
            Handler._cipher = _vigenere_encrypt(self.flag.encode(), KEY)
        return Handler._cipher

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/":
            ct = self._get_cipher().hex()
            html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>维吉尼亚密码</title>
<style>
body {{ font-family: sans-serif; background: #1f2937; color: #f3f4f6; max-width: 860px; margin: 0 auto; padding: 20px; }}
h1 {{ color: #fbbf24; }}
.box {{ background: #111827; padding: 20px; border-radius: 10px; margin: 15px 0; }}
.ct {{ background: #0b1020; border: 1px solid #374151; border-radius: 8px; padding: 15px; font-family: monospace; word-break: break-all; line-height: 1.8; }}
label {{ display: block; margin: 10px 0; }}
input {{ width: 100%; padding: 10px; background: #374151; color: #f3f4f6; border: 1px solid #4b5563; border-radius: 6px; box-sizing: border-box; }}
button {{ padding: 10px 20px; background: #fbbf24; color: #111827; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }}
.hint {{ background: #2d2d1f; color: #fde68a; padding: 12px; border-radius: 6px; }}
</style>
</head>
<body>
<h1>📜 维吉尼亚密码</h1>
<div class="box">
<h3>密文（hex）</h3>
<div class="ct">{ct}</div>
</div>
<div class="box">
<h3>提交解密后的明文（Flag 字符串）</h3>
<form method="POST" action="/verify">
  <label>明文 (plaintext):</label>
  <input name="plaintext" placeholder="还原出的明文">
  <button type="submit">验证</button>
</form>
</div>
<div class="hint">
<strong>提示：</strong>Flag 经维吉尼亚加密（字节级 mod 256），密钥由大写字母组成。<br>
- 用 Kasiski 测试 / 重合指数法确定密钥长度；<br>
- 用频率分析或已知明文（Flag 以 <code>flag{{</code> 开头）还原密钥；<br>
- 解密：plain[i] = (cipher[i] - key[i % L]) mod 256。
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
<style>body{{font-family:sans-serif;background:#1f2937;color:#f3f4f6;padding:40px;}}
.flag{{background:#064e3b;color:#a7f3d0;padding:20px;border-radius:10px;font-size:20px;word-break:break-all;}}</style>
</head><body><h1>✅ 验证成功！</h1>
<div class="flag">Flag: {self.flag}</div>
<p>攻击方法：确定密钥长度后，按位频率分析或已知明文还原密钥，逐字节解密。</p>
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
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8115
    run_server(Handler, port)
