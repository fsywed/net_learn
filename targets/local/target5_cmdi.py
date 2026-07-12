#!/usr/bin/env python3
"""靶机 5：命令注入 — ping 工具未过滤输入，可执行系统命令。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse, parse_qs
import subprocess


class Handler(TargetHandler):
    flag_locations = ["使用命令注入执行 cat /flag.txt"]

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/" or parsed.path == "/ping":
            html = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>Ping 工具</title>
    <style>
        body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .ping-box { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
        input { padding: 10px; border: 1px solid #ddd; border-radius: 5px; width: 300px; }
        button { padding: 10px 20px; background: #2196F3; color: #fff; border: none; border-radius: 5px; cursor: pointer; }
        pre { background: #000; color: #0f0; padding: 15px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>网络诊断工具</h1>
    <div class="ping-box">
        <form method="POST" action="/ping">
            <input type="text" name="ip" placeholder="输入 IP 地址（如 127.0.0.1）" required>
            <button type="submit">Ping</button>
        </form>
    </div>
    <p>提示：管理员在 /flag.txt 中存放了敏感信息。</p>
</body>
</html>"""
            self._send_html(html)
        elif parsed.path == "/flag.txt":
            self._send_html("<h1>403 Forbidden</h1><p>无权限访问</p>", 403)
        else:
            self._send_html("<h1>404</h1>", 404)

    def handle_post(self, parsed: urlparse):
        if parsed.path == "/ping":
            body = self._read_body()
            ip = body.get("ip", "")

            # 故意不做过滤（命令注入漏洞）
            # 正常: ping -c 4 127.0.0.1
            # 注入: 127.0.0.1; cat /flag.txt
            try:
                # 模拟命令执行（实际不执行，只返回结果）
                if ";" in ip or "|" in ip or "&" in ip or "`" in ip:
                    # 检测到命令注入
                    if "flag" in ip.lower() or "cat" in ip.lower():
                        html = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>命令执行结果</title>
<style>pre{{background:#000;color:#0f0;padding:15px;border-radius:5px;}}</style>
</head>
<body>
    <h1>命令执行结果</h1>
    <p>你成功执行了命令注入！</p>
    <pre>$ ping -c 4 {ip}
PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.
64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.033 ms

--- 127.0.0.1 ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3003ms

$ cat /flag.txt
{self.flag}</pre>
    <p>漏洞原因：用户输入直接拼接到系统命令，未过滤特殊字符。</p>
</body>
</html>"""
                        self._send_html(html)
                    else:
                        html = """<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>命令执行</title></head>
<body><h1>命令执行</h1><p>检测到特殊字符，但无法获取 Flag。</p>
<p>提示：尝试读取 /flag.txt 文件。</p></body></html>"""
                        self._send_html(html)
                else:
                    # 正常 ping
                    html = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Ping 结果</title>
<style>pre{{background:#000;color:#0f0;padding:15px;border-radius:5px;}}</style>
</head>
<body>
    <h1>Ping 结果</h1>
    <pre>$ ping -c 4 {ip}
PING {ip} ({ip}) 56(84) bytes of data.
64 bytes from {ip}: icmp_seq=1 ttl=64 time=0.033 ms
64 bytes from {ip}: icmp_seq=2 ttl=64 time=0.041 ms

--- {ip} ping statistics ---
2 packets transmitted, 2 received, 0% packet loss</pre>
</body>
</html>"""
                    self._send_html(html)
            except Exception as e:
                self._send_html(f"<h1>错误</h1><p>{str(e)}</p>", 500)
        else:
            self._send_json({"error": "not found"}, 404)


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8085
    run_server(Handler, port)
