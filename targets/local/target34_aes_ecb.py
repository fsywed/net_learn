#!/usr/bin/env python3
"""靶机 34：AES ECB 模式攻击 — 相同明文块产生相同密文块，逐字节爆破 Flag（XOR 模拟 ECB）。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse


_KEY = b"YELLOW SUBMARINE"  # 16 字节密钥


def _val(body, key, default=""):
    v = body.get(key, default)
    if isinstance(v, list):
        return v[0] if v else default
    return v


def _xor_block(block: bytes, key: bytes) -> bytes:
    return bytes(a ^ b for a, b in zip(block, key))


def _ecb_encrypt(data: bytes, key: bytes) -> bytes:
    """模拟 AES-ECB：按 16 字节分块，每块与相同密钥 XOR（PKCS7 填充）。

    相同的 16 字节明文块 → 相同的密文块（ECB 特性）。
    """
    pad = 16 - (len(data) % 16)
    data += bytes([pad]) * pad
    out = b""
    for i in range(0, len(data), 16):
        out += _xor_block(data[i:i + 16], key)
    return out


class Handler(TargetHandler):
    flag_locations = ["利用 ECB 相同明文块产生相同密文块特性逐字节爆破"]

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/":
            html = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>AES-ECB 字节爆破</title>
<style>
body { font-family: sans-serif; background: #0b1020; color: #e2e8f0; max-width: 860px; margin: 0 auto; padding: 20px; }
h1 { color: #34d399; }
.box { background: #161e35; padding: 20px; border-radius: 10px; margin: 15px 0; }
input { width: 100%; padding: 10px; background: #28335a; color: #e2e8f0; border: 1px solid #3a4470; border-radius: 6px; box-sizing: border-box; margin: 5px 0; }
button { padding: 10px 20px; background: #34d399; color: #0b1020; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
pre { background: #000; color: #0f0; padding: 15px; border-radius: 6px; word-break: break-all; white-space: pre-wrap; }
.hint { background: #2d2d1f; color: #fde68a; padding: 12px; border-radius: 6px; }
code { background: #28335a; padding: 2px 6px; border-radius: 4px; }
</style>
</head>
<body>
<h1>🔐 AES-ECB 字节爆破</h1>
<div class="box">
<h3>加密接口</h3>
<p>服务器对 <code>你的输入 + Flag</code> 进行 AES-ECB 加密（16 字节块）。</p>
<form id="f">
  <input id="pt" name="plaintext" placeholder="输入明文（如 15 个 A）">
  <button type="submit">加密</button>
</form>
<pre id="out">（密文 hex 将显示在此）</pre>
</div>
<div class="hint">
<strong>攻击思路：</strong>ECB 模式下相同的 16 字节明文块产生相同密文块。<br>
1. 输入 15 个 A，使第 1 块 = <code>AAAAAAAAAAAAAAA</code> + Flag[0]；<br>
2. 枚举 Flag[0]：输入 <code>AAAAAAAAAAAAAAA</code> + 候选字节，比较第 1 块密文是否一致；<br>
3. 逐步缩短前缀，逐字节爆破出完整 Flag。<br>
<strong>接口：</strong><code>POST /encrypt</code>，JSON <code>{"plaintext":"..."}</code> → <code>{"ciphertext":"hex"}</code>
</div>
<script>
document.getElementById('f').onsubmit = async (e) => {
  e.preventDefault();
  const pt = document.getElementById('pt').value;
  const r = await fetch('/encrypt', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({plaintext: pt})
  });
  const j = await r.json();
  document.getElementById('out').textContent = j.ciphertext || JSON.stringify(j);
};
</script>
</body>
</html>"""
            self._send_html(html)
        else:
            self._send_html("<h1>404</h1>", 404)

    def handle_post(self, parsed: urlparse):
        if parsed.path == "/encrypt":
            body = self._read_body()
            plaintext = _val(body, "plaintext", "")
            data = (plaintext + self.flag).encode("utf-8", "replace")
            ct = _ecb_encrypt(data, _KEY)
            self._send_json({"ciphertext": ct.hex()})
        else:
            self._send_json({"error": "not found"}, 404)


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8114
    run_server(Handler, port)
