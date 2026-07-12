#!/usr/bin/env python3
"""靶机 30：格式化字符串 PWN — 利用 %n 任意写修改标志变量（模拟版）。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse


class Handler(TargetHandler):
    flag_locations = ["利用 %n 任意写修改标志变量"]

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/" or parsed.path == "/printf":
            html = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>格式化字符串</title>
    <style>
        body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .box { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
        input { padding: 10px; border: 1px solid #ddd; border-radius: 5px; width: 420px; }
        button { padding: 10px 20px; background: #00BCD4; color: #fff; border: none; border-radius: 5px; cursor: pointer; }
        pre { background: #000; color: #0f0; padding: 15px; border-radius: 5px; overflow-x: auto; }
        .hint { color: #999; font-size: 12px; }
    </style>
</head>
<body>
    <h1>格式化字符串漏洞</h1>
    <p>程序使用 <code>printf(input)</code> 直接输出用户输入，未使用格式化字符串。</p>
    <div class="box">
        <form method="POST" action="/printf">
            <input type="text" name="input" placeholder="输入内容，如 hello %p" required>
            <button type="submit">printf</button>
        </form>
    </div>
    <p class="hint">提示：%p 可泄露栈上的地址/数据，%n 可将已输出字节数写入指定地址（任意写）。</p>
    <p class="hint">尝试输入 %p 泄露栈数据，再利用 %n 修改标志变量获取 Flag。</p>
</body>
</html>"""
            self._send_html(html)
        else:
            self._send_html("<h1>404</h1>", 404)

    def handle_post(self, parsed: urlparse):
        if parsed.path == "/printf":
            body = self._read_body()
            user_input = body.get("input", "")

            if "%n" in user_input:
                html = f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>printf 结果</title>
<style>pre{{background:#000;color:#0f0;padding:15px;border-radius:5px;}}</style>
</head>
<body>
    <h1>printf 结果</h1>
    <p>检测到 %n，已将输出字节数写入目标地址，标志变量被修改！</p>
    <pre>$ ./vuln
input: {user_input}
result: 任意写成功，标志变量 secret = 1
$ cat /flag.txt
{self.flag}</pre>
    <p>漏洞原因：printf(input) 直接以用户输入作为格式化字符串，%n 可实现任意地址写。</p>
    <p>防御方案：使用 printf("%s", input) 固定格式化字符串。</p>
</body>
</html>"""
                self._send_html(html)
            elif "%p" in user_input:
                # 模拟泄露栈上的地址
                fake_stack = ["0x8048000", "0xf7fc1000", "0x80491a6", "0xffffd0c8",
                              "0x1", "0xf7e1a000", "0x80491a6", "0xdeadbeef"]
                count = user_input.count("%p")
                leaked = ".".join(fake_stack[i % len(fake_stack)] for i in range(max(count, 1)))
                html = f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>printf 结果</title>
<style>pre{{background:#000;color:#0f0;padding:15px;border-radius:5px;}}</style>
</head>
<body>
    <h1>printf 结果</h1>
    <p>检测到 %p，泄露栈上的数据（模拟）：</p>
    <pre>$ ./vuln
input: {user_input}
result: {leaked}</pre>
    <p>提示：这些是栈上的地址/数据。结合泄露的地址，利用 %n 修改标志变量即可获取 Flag。</p>
    <p><a href="/">返回</a></p>
</body>
</html>"""
                self._send_html(html)
            else:
                html = f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>printf 结果</title>
<style>pre{{background:#000;color:#0f0;padding:15px;border-radius:5px;}}</style>
</head>
<body>
    <h1>printf 结果</h1>
    <pre>$ ./vuln
input: {user_input}
result: {user_input}</pre>
    <p>原样输出，未检测到格式化字符。</p>
    <p>提示：尝试 %p 泄露栈数据，或 %n 修改标志变量。</p>
    <p><a href="/">返回</a></p>
</body>
</html>"""
                self._send_html(html)
        else:
            self._send_json({"error": "not found"}, 404)


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8110
    run_server(Handler, port)
