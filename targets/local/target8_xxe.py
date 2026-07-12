#!/usr/bin/env python3
"""靶机 8：XXE 注入 — XML 解析未禁用外部实体。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse
import xml.etree.ElementTree as ET


class Handler(TargetHandler):
    flag_locations = ["通过 XXE 注入读取 /flag.txt"]

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/" or parsed.path == "/upload":
            html = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>XML 数据导入</title>
    <style>
        body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        textarea { width: 100%; height: 200px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-family: monospace; }
        button { padding: 10px 20px; background: #9C27B0; color: #fff; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px; }
        .hint { background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; }
        pre { background: #000; color: #0f0; padding: 15px; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>XML 数据导入</h1>
    <div class="hint">
        <p>粘贴 XML 数据到下方文本框，系统将解析并显示。</p>
        <p><strong>示例：</strong></p>
        <pre>&lt;?xml version="1.0"?&gt;
&lt;user&gt;
    &lt;name&gt;张三&lt;/name&gt;
    &lt;email&gt;zhangsan@example.com&lt;/email&gt;
&lt;/user&gt;</pre>
    </div>
    <form method="POST" action="/upload">
        <textarea name="xml_data" placeholder="粘贴 XML 数据"></textarea>
        <button type="submit">解析 XML</button>
    </form>
    <p style="color:#999;font-size:12px;">提示：管理员在 /flag.txt 中存放了敏感信息。</p>
</body>
</html>"""
            self._send_html(html)
        else:
            self._send_html("<h1>404</h1>", 404)

    def handle_post(self, parsed: urlparse):
        if parsed.path == "/upload":
            body = self._read_body()
            xml_data = body.get("xml_data", "")

            # 故意不禁用外部实体（XXE 漏洞）
            try:
                # 检测 XXE 注入
                if "<!ENTITY" in xml_data or "SYSTEM" in xml_data:
                    if "flag" in xml_data.lower() or "/etc/passwd" in xml_data:
                        # XXE 成功
                        html = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>XXE 注入成功</title>
<style>pre{{background:#000;color:#0f0;padding:15px;border-radius:5px;}}</style>
</head>
<body>
    <h1>XML 解析结果</h1>
    <p>你成功利用 XXE 漏洞读取了敏感文件！</p>
    <pre>文件内容：
{self.flag}</pre>
    <p>漏洞原因：XML 解析器未禁用外部实体引用。</p>
    <p>防御方案：禁用 DTD、禁用外部实体、使用安全的 XML 解析库。</p>
</body>
</html>"""
                        self._send_html(html)
                    else:
                        html = """<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>XXE 检测</title></head>
<body><h1>检测到 XXE 注入</h1><p>但未能读取 Flag。</p>
<p>提示：尝试读取 /flag.txt 或 /etc/passwd。</p></body></html>"""
                        self._send_html(html)
                else:
                    # 正常 XML 解析
                    root = ET.fromstring(xml_data)
                    content = "<h2>解析成功</h2><ul>"
                    for child in root:
                        content += f"<li><strong>{child.tag}:</strong> {child.text}</li>"
                    content += "</ul>"
                    
                    html = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>解析结果</title></head>
<body>{content}<p><a href="/">返回</a></p></body></html>"""
                    self._send_html(html)
            except ET.ParseError as e:
                self._send_html(f"<h1>XML 解析错误</h1><p>{str(e)}</p>", 400)
        else:
            self._send_json({"error": "not found"}, 404)


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8088
    run_server(Handler, port)
