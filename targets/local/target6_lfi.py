#!/usr/bin/env python3
"""靶机 6：本地文件包含 — 参数未过滤，可读取任意文件。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse, parse_qs


class Handler(TargetHandler):
    flag_locations = ["使用路径遍历读取 /etc/passwd 或 ../../flag.txt"]

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/" or parsed.path == "/view":
            qs = parse_qs(parsed.query)
            page = qs.get("page", ["home"])[0]

            # 故意不做过滤（本地文件包含漏洞）
            # 正常: ?page=home
            # 注入: ?page=../../flag.txt 或 ?page=/etc/passwd
            if page == "home":
                content = "<h2>首页</h2><p>欢迎来到内部文档系统。</p>"
            elif page == "about":
                content = "<h2>关于我们</h2><p>这是一家科技公司。</p>"
            elif "../" in page or page.startswith("/"):
                # 文件包含
                if "flag" in page.lower():
                    content = f"<h2>文件内容</h2><pre>{self.flag}</pre>"
                elif "passwd" in page:
                    content = "<h2>文件内容</h2><pre>root:x:0:0:root:/root:/bin/bash\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin</pre>"
                else:
                    content = f"<h2>文件内容</h2><pre>文件 {page} 不存在</pre>"
            else:
                content = f"<h2>页面不存在</h2><p>页面 {page} 未找到。</p>"

            html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>文档系统</title>
    <style>
        body {{ font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }}
        nav {{ background: #333; padding: 10px; border-radius: 5px; margin-bottom: 20px; }}
        nav a {{ color: #fff; margin-right: 15px; text-decoration: none; }}
        nav a:hover {{ text-decoration: underline; }}
        .content {{ background: #f9f9f9; padding: 20px; border-radius: 8px; }}
        pre {{ background: #000; color: #0f0; padding: 15px; border-radius: 5px; }}
    </style>
</head>
<body>
    <nav>
        <a href="/view?page=home">首页</a>
        <a href="/view?page=about">关于我们</a>
    </nav>
    <div class="content">
        {content}
    </div>
    <p style="color:#999;font-size:12px;">提示：管理员在系统中存放了敏感文件。</p>
</body>
</html>"""
            self._send_html(html)
        else:
            self._send_html("<h1>404</h1>", 404)


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8086
    run_server(Handler, port)
