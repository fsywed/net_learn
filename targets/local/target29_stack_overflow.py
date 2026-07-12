#!/usr/bin/env python3
"""靶机 29：栈溢出 PWN — 覆盖返回地址跳转到 get_shell 函数（模拟版）。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse, parse_qs


GET_SHELL_ADDR = "0x4011a6"
OFFSET = 44  # 缓冲区 40 字节 + 4 字节保存的 EBP = 44 字节后是返回地址


class Handler(TargetHandler):
    flag_locations = ["构造 44 字节填充 + 返回地址覆盖跳转到 get_shell"]

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/":
            html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>栈溢出靶机</title>
    <style>
        body {{ font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }}
        .box {{ background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }}
        a {{ padding: 10px 20px; background: #607D8B; color: #fff; border-radius: 5px; text-decoration: none; display: inline-block; }}
        pre {{ background: #000; color: #0f0; padding: 15px; border-radius: 5px; overflow-x: auto; }}
        .hint {{ color: #999; font-size: 12px; }}
    </style>
</head>
<body>
    <h1>栈溢出靶机</h1>
    <div class="box">
        <p>这里有一个存在栈溢出漏洞的二进制程序 <code>vuln</code>。</p>
        <p>程序读取用户输入到栈上缓冲区，未限制长度，可覆盖返回地址。</p>
        <p>程序中存在未被调用的 <code>get_shell</code> 函数，地址：<strong>{GET_SHELL_ADDR}</strong>。</p>
        <p><a href="/binary">查看二进制分析说明</a></p>
        <p><a href="/exploit?payload=AAAAAAAAAAAAAAAAAAAAAAAAAAAA">尝试提交 payload</a></p>
    </div>
    <div class="box">
        <h2>提交 payload</h2>
        <form method="GET" action="/exploit">
            <input type="text" name="payload" placeholder="输入 payload（URL 编码）" style="width:500px;padding:10px;border:1px solid #ddd;border-radius:5px;">
            <button type="submit" style="padding:10px 20px;background:#607D8B;color:#fff;border:none;border-radius:5px;cursor:pointer;">执行</button>
        </form>
        <p class="hint">提示：填充 {OFFSET} 字节后覆盖返回地址为 get_shell 地址 {GET_SHELL_ADDR}。</p>
    </div>
</body>
</html>"""
            self._send_html(html)
        elif parsed.path == "/binary":
            html = f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>二进制分析</title>
<style>pre{{background:#000;color:#0f0;padding:15px;border-radius:5px;overflow-x:auto;}}</style>
</head>
<body>
    <h1>vuln 二进制分析</h1>
    <pre>$ checksec vuln
[*] '/home/ctf/vuln'
    Arch:     i386-32-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      No PIE (0x8048000)

$ objdump -d vuln | grep -A 20 '&lt;vulnerable_function&gt;'
0804852b &lt;vulnerable_function&gt;:
 804852b:   push   ebp
 804852c:   mov    ebp,esp
 804852e:   sub    esp,0x28          ; 缓冲区 0x28 = 40 字节
 8048531:   sub    esp,0x8
 8048534:   push   0x100             ; read 读取 256 字节（溢出！）
 8048539:   lea    eax,[ebp-0x28]
 804853c:   push   eax
 804853d:   call   8048390 &lt;read@plt&gt;

$ objdump -d vuln | grep '&lt;get_shell&gt;'
 080491a6 &lt;get_shell&gt;:    ; 注意：32 位小端，地址 0x{GET_SHELL_ADDR[2:]}

分析：
- 缓冲区起始位置：ebp - 0x28（40 字节）
- 保存的 EBP：4 字节
- 返回地址偏移：40 + 4 = {OFFSET} 字节
- 覆盖返回地址为 get_shell 地址即可 getshell
- payload 结构：'A' * {OFFSET} + p32({GET_SHELL_ADDR})</pre>
    <p>返回地址偏移为 {OFFSET} 字节，构造 {OFFSET} 字节填充 + get_shell 地址 {GET_SHELL_ADDR}（小端序）。</p>
    <p><a href="/">&lt; 返回</a></p>
</body>
</html>"""
            self._send_html(html)
        elif parsed.path == "/exploit":
            qs = parse_qs(parsed.query)
            payload = qs.get("payload", [""])[0]
            if len(payload) > OFFSET:
                html = f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>GetShell!</title></head>
<body>
    <h1>GetShell 成功！</h1>
    <p>payload 长度 {len(payload)} &gt; {OFFSET}，已覆盖返回地址跳转到 get_shell ({GET_SHELL_ADDR})。</p>
    <pre>$ whoami
root
$ cat /flag.txt
{self.flag}</pre>
    <p>漏洞原因：vulnerable_function 使用 read 读取 256 字节到 40 字节缓冲区，无边界检查与 Canary 保护。</p>
</body>
</html>"""
                self._send_html(html)
            else:
                html = f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>执行失败</title></head>
<body>
    <h1>执行失败</h1>
    <p>payload 长度 {len(payload)} 不足，需要超过 {OFFSET} 字节才能覆盖返回地址。</p>
    <p>提示：填充 {OFFSET} 字节后接 get_shell 地址 {GET_SHELL_ADDR}。</p>
    <p><a href="/">&lt; 返回</a></p>
</body>
</html>"""
                self._send_html(html)
        else:
            self._send_html("<h1>404</h1>", 404)

    def handle_post(self, parsed: urlparse):
        self._send_json({"error": "not found"}, 404)


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8109
    run_server(Handler, port)
