#!/usr/bin/env python3
"""靶机 43：ZIP 伪加密 — 修改加密标志位后即可解压获取 Flag。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse


class Handler(TargetHandler):
    flag_locations = ["修改 ZIP 加密标志位 0x09 → 0x00 后解压"]

    def _send_binary(self, data: bytes, filename: str = None, content_type: str = "application/octet-stream"):
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        if filename:
            self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
        self.end_headers()
        self.wfile.write(data)

    def _build_zip(self) -> bytes:
        """构造伪加密 ZIP：加密标志位置位但数据未真正加密。"""
        # PK\x03\x04 本地文件头签名
        local_header_sig = b'PK\x03\x04'
        version = (20).to_bytes(2, 'little')       # version 2.0
        flags = (0x09).to_bytes(2, 'little')        # bit0=加密位(伪), bit3=数据描述符
        compression = (0).to_bytes(2, 'little')     # 0 = Stored
        mod_time = (0).to_bytes(2, 'little')
        mod_date = (0).to_bytes(2, 'little')
        crc32 = (0).to_bytes(4, 'little')
        fname = b'flag.txt'
        flag_data = self.flag.encode('utf-8')
        comp_size = len(flag_data).to_bytes(4, 'little')
        uncomp_size = len(flag_data).to_bytes(4, 'little')
        fname_len = len(fname).to_bytes(2, 'little')
        extra_len = (0).to_bytes(2, 'little')

        header = (local_header_sig + version + flags + compression +
                  mod_time + mod_date + crc32 + comp_size + uncomp_size +
                  fname_len + extra_len + fname)

        # 数据描述符（Data Descriptor，因为 bit3 被设置）
        data_desc_sig = b'PK\x07\x08'
        data_desc = data_desc_sig + crc32 + comp_size + uncomp_size

        # 中央目录头
        cd_sig = b'PK\x01\x02'
        cd_version_made = (20).to_bytes(2, 'little')
        cd_version_needed = (20).to_bytes(2, 'little')
        cd_flags = (0x09).to_bytes(2, 'little')     # 同样设置加密位（伪加密）
        cd_compression = (0).to_bytes(2, 'little')
        cd_time = (0).to_bytes(2, 'little')
        cd_date = (0).to_bytes(2, 'little')
        cd_crc32 = (0).to_bytes(4, 'little')
        cd_comp_size = len(flag_data).to_bytes(4, 'little')
        cd_uncomp_size = len(flag_data).to_bytes(4, 'little')
        cd_fname_len = len(fname).to_bytes(2, 'little')
        cd_extra_len = (0).to_bytes(2, 'little')
        cd_comment_len = (0).to_bytes(2, 'little')
        cd_disk_num = (0).to_bytes(2, 'little')
        cd_int_attrs = (0).to_bytes(2, 'little')
        cd_ext_attrs = (0).to_bytes(4, 'little')
        cd_local_offset = (0).to_bytes(4, 'little')

        central_dir = (cd_sig + cd_version_made + cd_version_needed + cd_flags +
                       cd_compression + cd_time + cd_date + cd_crc32 +
                       cd_comp_size + cd_uncomp_size + cd_fname_len +
                       cd_extra_len + cd_comment_len + cd_disk_num +
                       cd_int_attrs + cd_ext_attrs + cd_local_offset + fname)

        # 中央目录结束记录
        eocd_sig = b'PK\x05\x06'
        eocd_disk_num = (0).to_bytes(2, 'little')
        eocd_cd_disk = (0).to_bytes(2, 'little')
        eocd_cd_entries = (1).to_bytes(2, 'little')
        eocd_cd_total = (1).to_bytes(2, 'little')
        eocd_cd_size = len(central_dir).to_bytes(4, 'little')
        eocd_cd_offset = len(header + flag_data + data_desc).to_bytes(4, 'little')
        eocd_comment_len = (0).to_bytes(2, 'little')

        eocd = (eocd_sig + eocd_disk_num + eocd_cd_disk + eocd_cd_entries +
                eocd_cd_total + eocd_cd_size + eocd_cd_offset + eocd_comment_len)

        return header + flag_data + data_desc + central_dir + eocd

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/":
            html = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>ZIP 伪加密</title>
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
<h1>🔐 ZIP 伪加密分析</h1>
<div class="box">
<h3>下载伪加密 ZIP 文件</h3>
<a class="dl" href="/file">下载 challenge_fake.zip</a>
</div>
<div class="hint">
<strong>提示：</strong>该 ZIP 文件被标记为加密，但数据实际上并未加密（伪加密）。<br>
- 真实场景：用十六进制编辑器修改加密标志位 <code>09 00 → 00 00</code> 后即可正常解压；<br>
- 修改位置：本地文件头（PK\x03\x04 后第 3-4 字节）和中央目录头（PK\x01\x02 后第 5-6 字节）的加密标志位。
</div>
</body>
</html>"""
            self._send_html(html)
        elif parsed.path == "/file":
            self._send_binary(self._build_zip(), filename="challenge_fake.zip",
                              content_type="application/zip")
        else:
            self._send_html("<h1>404</h1>", 404)


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8123
    run_server(Handler, port)
