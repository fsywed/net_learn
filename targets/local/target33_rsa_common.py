#!/usr/bin/env python3
"""靶机 33：RSA 共模攻击 — 同一明文用相同 n、不同 e1/e2 加密，扩展欧几里得还原明文。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse
import random


def _val(body, key, default=""):
    v = body.get(key, default)
    if isinstance(v, list):
        return v[0] if v else default
    return v


def _is_prime(n, k=8):
    if n < 2:
        return False
    for p in (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37):
        if n % p == 0:
            return n == p
    d, r = n - 1, 0
    while d % 2 == 0:
        d //= 2
        r += 1
    for _ in range(k):
        a = random.randrange(2, n - 1)
        x = pow(a, d, n)
        if x in (1, n - 1):
            continue
        for _ in range(r - 1):
            x = x * x % n
            if x == n - 1:
                break
        else:
            return False
    return True


def _gen_prime(bits):
    while True:
        p = random.getrandbits(bits) | (1 << (bits - 1)) | 1
        if _is_prime(p):
            return p


class Handler(TargetHandler):
    flag_locations = ["用扩展欧几里得求 s1*e1+s2*e2=1，计算 m=c1^s1*c2^s2 mod n"]

    _params = None

    def _get_params(self):
        if Handler._params is None:
            m = int.from_bytes(self.flag.encode(), "big")
            # 生成 n > m 的模数（两素数乘积）
            half = (m.bit_length() + 4) // 2 + 1
            p = _gen_prime(half)
            q = _gen_prime(half)
            while q == p:
                q = _gen_prime(half)
            n = p * q
            e1, e2 = 17, 23
            c1 = pow(m, e1, n)
            c2 = pow(m, e2, n)
            Handler._params = {
                "n": n, "e1": e1, "e2": e2, "c1": c1, "c2": c2, "m": m,
            }
        return Handler._params

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/":
            p = self._get_params()
            html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>RSA 共模攻击</title>
<style>
body {{ font-family: sans-serif; background: #1a1a2e; color: #e6e6e6; max-width: 860px; margin: 0 auto; padding: 20px; }}
h1 {{ color: #e94560; }}
.box {{ background: #16213e; padding: 20px; border-radius: 10px; margin: 15px 0; }}
.params {{ background: #0f1424; border: 1px solid #2a335a; border-radius: 8px; padding: 15px; font-family: monospace; word-break: break-all; line-height: 1.8; }}
label {{ display: block; margin: 10px 0; }}
input {{ width: 100%; padding: 10px; background: #2a335a; color: #e6e6e6; border: 1px solid #3a4470; border-radius: 6px; box-sizing: border-box; }}
button {{ padding: 10px 20px; background: #e94560; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }}
.hint {{ background: #2d2d1f; color: #fde68a; padding: 12px; border-radius: 6px; }}
</style>
</head>
<body>
<h1>🔐 RSA 共模攻击</h1>
<div class="box">
<h3>已知参数（同一明文 m、同一模数 n，两个不同公钥）</h3>
<div class="params">
n  = {p['n']}<br>
e1 = {p['e1']}<br>
c1 = {p['c1']}<br>
e2 = {p['e2']}<br>
c2 = {p['c2']}
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
<strong>提示：</strong>同一明文用相同 n、不同 e1={p['e1']}/e2={p['e2']} 加密（gcd(e1,e2)=1）。
用扩展欧几里得求 s1*e1 + s2*e2 = 1，则 m = c1^s1 * c2^s2 mod n。
注意 s1、s2 可能有负，负指数取模逆元。最后将 m 转为字节得到 Flag。
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
<style>body{{font-family:sans-serif;background:#1a1a2e;color:#e6e6e6;padding:40px;}}
.flag{{background:#064e3b;color:#a7f3d0;padding:20px;border-radius:10px;font-size:20px;word-break:break-all;}}</style>
</head><body><h1>✅ 验证成功！</h1>
<div class="flag">Flag: {self.flag}</div>
<p>攻击方法：扩展欧几里得求 s1*e1+s2*e2=1，m = pow(c1,s1,n)*pow(c2,s2,n) mod n。</p>
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
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8113
    run_server(Handler, port)
