#!/usr/bin/env python3
"""靶机 36：哈希长度扩展攻击 — signature=md5(secret+message)，伪造 hash(secret+message+padding+&admin=true)。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse
import hashlib
import os


SECRET = os.urandom(16)                # 服务器密钥（长度 16，用户未知）
MESSAGE = "user=guest&role=user"       # 原始消息（用户已知）


def _val(body, key, default=""):
    v = body.get(key, default)
    if isinstance(v, list):
        return v[0] if v else default
    return v


def _md5_padding(total_len: int) -> bytes:
    """MD5 对 total_len 字节消息的填充。"""
    pad = b"\x80"
    pad += b"\x00" * ((56 - (total_len + 1) % 64) % 64)
    pad += (total_len * 8).to_bytes(8, "little")
    return pad


class Handler(TargetHandler):
    flag_locations = ["用 hashpump 伪造 hash(secret+message+padding+&admin=true)"]

    _sig = None

    def _get_sig(self):
        if Handler._sig is None:
            Handler._sig = hashlib.md5(SECRET + MESSAGE.encode()).hexdigest()
        return Handler._sig

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/":
            sig = self._get_sig()
            html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>哈希长度扩展攻击</title>
<style>
body {{ font-family: sans-serif; background: #18181b; color: #fafafa; max-width: 860px; margin: 0 auto; padding: 20px; }}
h1 {{ color: #f472b6; }}
.box {{ background: #27272a; padding: 20px; border-radius: 10px; margin: 15px 0; }}
.params {{ background: #0c0c0f; border: 1px solid #3f3f46; border-radius: 8px; padding: 15px; font-family: monospace; word-break: break-all; line-height: 1.8; }}
label {{ display: block; margin: 10px 0; }}
input {{ width: 100%; padding: 10px; background: #3f3f46; color: #fafafa; border: 1px solid #52525b; border-radius: 6px; box-sizing: border-box; }}
button {{ padding: 10px 20px; background: #f472b6; color: #18181b; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }}
.hint {{ background: #2d2d1f; color: #fde68a; padding: 12px; border-radius: 6px; }}
code {{ background: #3f3f46; padding: 2px 6px; border-radius: 4px; }}
</style>
</head>
<body>
<h1>🔑 哈希长度扩展攻击</h1>
<div class="box">
<h3>已知信息</h3>
<div class="params">
message    = {MESSAGE}<br>
signature  = {sig}<br>
secret 长度 = 16 字节（未知具体值）
</div>
</div>
<div class="box">
<h3>提交伪造的新 message（hex）与新 signature</h3>
<form method="POST" action="/verify">
  <label>新 message（hex，需为 <code>原message + padding + &amp;admin=true</code>）:</label>
  <input name="message" placeholder="hex 编码的新 message">
  <label>新 signature（32 位 hex）:</label>
  <input name="signature" placeholder="伪造的 md5">
  <button type="submit">验证</button>
</form>
</div>
<div class="hint">
<strong>提示：</strong>服务器校验逻辑为 <code>md5(secret + message) == signature</code> 且 message 含 <code>&amp;admin=true</code>。<br>
利用 MD5 长度扩展攻击（hashpump）伪造：<br>
<code>hashpump(signature, "{MESSAGE}", "&amp;admin=true", 16)</code><br>
得到新 message（含 padding，提交时转 hex）与新 signature，即可通过校验拿到 Flag。
</div>
</body>
</html>"""
            self._send_html(html)
        elif parsed.path == "/verify":
            self._send_html("<h1>请使用 POST 提交</h1>")
        else:
            self._send_html("<h1>404</h1>", 404)

    def handle_post(self, parsed: urlparse):
        if parsed.path == "/verify":
            body = self._read_body()
            msg_hex = _val(body, "message", "")
            sig = _val(body, "signature", "").strip().lower()

            try:
                msg_bytes = bytes.fromhex(msg_hex)
            except ValueError:
                self._send_html("<h1>❌ message 不是合法 hex</h1>", 401)
                return

            suffix = b"&admin=true"
            orig = MESSAGE.encode()
            expected_padding = _md5_padding(len(SECRET) + len(orig))
            expected_msg = orig + expected_padding + suffix

            # 结构校验 + 签名校验（服务端已知 secret，可直接验真）
            struct_ok = (
                msg_bytes.startswith(orig)
                and msg_bytes.endswith(suffix)
                and msg_bytes == expected_msg
            )
            sig_ok = hashlib.md5(SECRET + msg_bytes).hexdigest() == sig

            if struct_ok and sig_ok:
                html = f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>验证成功</title>
<style>body{{font-family:sans-serif;background:#18181b;color:#fafafa;padding:40px;}}
.flag{{background:#064e3b;color:#a7f3d0;padding:20px;border-radius:10px;font-size:20px;word-break:break-all;}}</style>
</head><body><h1>✅ 验证成功！</h1>
<div class="flag">Flag: {self.flag}</div>
<p>攻击方法：MD5 长度扩展，伪造 md5(secret+message+padding+&amp;admin=true) 绕过校验。</p>
</body></html>"""
                self._send_html(html)
            else:
                reason = []
                if not struct_ok:
                    reason.append("message 结构不正确（应为 原message+padding+&admin=true）")
                if not sig_ok:
                    reason.append("signature 校验失败")
                self._send_html(
                    f"<h1>❌ 伪造失败</h1><p>{'；'.join(reason)}</p><p><a href='/'>返回</a></p>",
                    401,
                )
        else:
            self._send_json({"error": "not found"}, 404)


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8116
    run_server(Handler, port)
