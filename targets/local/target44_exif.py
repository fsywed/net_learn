#!/usr/bin/env python3
"""靶机 44：EXIF 信息提取 — Flag 以 Base64 编码藏在 EXIF Comment 字段中。"""
import base64
from base import TargetHandler, run_server
from urllib.parse import urlparse


class Handler(TargetHandler):
    flag_locations = ["用 exiftool 查看 Comment 字段，Base64 解码"]

    def _send_text(self, text: str, filename: str = None):
        body = text.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        if filename:
            self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
        self.end_headers()
        self.wfile.write(body)

    def _build_exif(self) -> str:
        """构造模拟 EXIF 数据，Comment 字段中放置 Base64 编码的 Flag。"""
        b64_flag = base64.b64encode(self.flag.encode("utf-8")).decode("ascii")
        return (
            "===== EXIF Metadata (模拟 exiftool 输出) =====\n"
            "File Name         : photo.jpg\n"
            "File Size         : 245678 bytes\n"
            "MIME Type         : image/jpeg\n"
            "Image Width       : 1920\n"
            "Image Height      : 1080\n"
            "Make              : Canon\n"
            "Camera Model Name : EOS 5D Mark IV\n"
            "Lens Model        : EF 50mm f/1.8 STM\n"
            "Exposure Time     : 1/200\n"
            "F Number          : 2.8\n"
            "ISO               : 400\n"
            "Date/Time Original: 2024:01:15 14:23:05\n"
            "Software          : Adobe Photoshop 2024\n"
            "Artist            : Photographer\n"
            f"Comment           : {b64_flag}\n"
            "Copyright         : All Rights Reserved\n"
        )

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/":
            html = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>EXIF 信息提取</title>
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
<h1>📷 EXIF 信息提取</h1>
<div class="box">
<h3>下载含 EXIF 数据的图片</h3>
<a class="dl" href="/image">下载 photo_exif.txt</a>
</div>
<div class="hint">
<strong>提示：</strong>Flag 隐藏在图片的 EXIF 元数据中。<br>
- 真实场景：用 <code>exiftool photo.jpg</code> 查看所有 EXIF 字段；<br>
- 找到 <code>Comment</code> 字段，其中的 Base64 字符串解码后即为 Flag。
</div>
</body>
</html>"""
            self._send_html(html)
        elif parsed.path == "/image":
            self._send_text(self._build_exif(), filename="photo_exif.txt")
        else:
            self._send_html("<h1>404</h1>", 404)


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8124
    run_server(Handler, port)
