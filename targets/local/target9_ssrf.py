#!/usr/bin/env python3
"""靶机 9：SSRF — URL 参数未验证，可访问内网资源。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse, parse_qs


class Handler(TargetHandler):
    flag_locations = ["使用 SSRF 访问 http://127.0.0.1:8080/flag"]

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/" or parsed.path == "/fetch":
            qs = parse_qs(parsed.query)
            url = qs.get("url", [""])[0]

            if url:
                # 故意不验证 URL（SSRF 漏洞）
                parsed_url = urlparse(url)
                
                # 模拟访问内网资源
                if "127.0.0.1" in url or "localhost" in url:
                    if "flag" in url.lower():
                        content = f"<h2>内网资源</h2><pre>{self.flag}</pre>"
                    elif "metadata" in url.lower() or "169.254" in url:
                        content = "<h2>云元数据</h2><pre>AWS_SECRET_KEY=AKIAIOSFODNN7EXAMPLE\nAWS_REGION=us-east-1</pre>"
                    else:
                        content = "<h2>内网资源</h2><p>成功访问内网服务！</p>"
                elif parsed_url.scheme in ["http", "https"]:
                    content = f"<h2>外部资源</h2><p>访问外部 URL: {url}</p>"
                else:
                    content = "<h2>错误</h2><p>不支持的协议</p>"
            else:
                content = """<h2>URL 抓取工具</h2>
                <form method="GET" action="/fetch">
                    <input type="url" name="url" placeholder="输入 URL（如 http://example.com）" style="width:400px;padding:10px;">
                    <button type="submit" style="padding:10px 20px;">抓取</button>
                </form>
                <p style="color:#999;font-size:12px;">提示：管理员在内网 127.0.0.1:8080 存放了敏感信息。</p>"""

            html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>URL 抓取工具</title>
    <style>
        body {{ font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }}
        input {{ padding: 10px; border: 1px solid #ddd; border-radius: 5px; }}
        button {{ padding: 10px 20px; background: #FF5722; color: #fff; border: none; border-radius: 5px; cursor: pointer; }}
        .content {{ background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }}
        pre {{ background: #000; color: #0f0; padding: 15px; border-radius: 5px; }}
    </style>
</head>
<body>
    <h1>URL 抓取工具</h1>
    <div class="content">
        {content}
    </div>
</body>
</html>"""
            self._send_html(html)
        else:
            self._send_html("<h1>404</h1>", 404)


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8089
    run_server(Handler, port)
