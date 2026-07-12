#!/usr/bin/env python3
"""靶机 47：USB 键盘流量恢复 — 从 USB HID 键盘数据中还原 Flag 输入。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse


# USB HID 键码映射表（小写字母 + 数字 + 特殊字符）
# 返回 (modifier, keycode)，modifier 0x00=无 Shift，0x02=左 Shift
HID_KEY_MAP = {
    'a': (0x00, 0x04), 'b': (0x00, 0x05), 'c': (0x00, 0x06), 'd': (0x00, 0x07),
    'e': (0x00, 0x08), 'f': (0x00, 0x09), 'g': (0x00, 0x0a), 'h': (0x00, 0x0b),
    'i': (0x00, 0x0c), 'j': (0x00, 0x0d), 'k': (0x00, 0x0e), 'l': (0x00, 0x0f),
    'm': (0x00, 0x10), 'n': (0x00, 0x11), 'o': (0x00, 0x12), 'p': (0x00, 0x13),
    'q': (0x00, 0x14), 'r': (0x00, 0x15), 's': (0x00, 0x16), 't': (0x00, 0x17),
    'u': (0x00, 0x18), 'v': (0x00, 0x19), 'w': (0x00, 0x1a), 'x': (0x00, 0x1b),
    'y': (0x00, 0x1c), 'z': (0x00, 0x1d),
    '1': (0x00, 0x1e), '2': (0x00, 0x1f), '3': (0x00, 0x20), '4': (0x00, 0x21),
    '5': (0x00, 0x22), '6': (0x00, 0x23), '7': (0x00, 0x24), '8': (0x00, 0x25),
    '9': (0x00, 0x26), '0': (0x00, 0x27),
    '{': (0x02, 0x2f),  # Shift + [
    '}': (0x02, 0x30),  # Shift + ]
    '-': (0x00, 0x2d), '_': (0x02, 0x2d),
    '=': (0x00, 0x2e), '+': (0x02, 0x2e),
    '[': (0x00, 0x2f), ']': (0x00, 0x30),
    ';': (0x00, 0x33), ':': (0x02, 0x33),
    "'": (0x00, 0x34), '"': (0x02, 0x34),
    ',': (0x00, 0x36), '<': (0x02, 0x36),
    '.': (0x00, 0x37), '>': (0x02, 0x37),
    '/': (0x00, 0x38), '?': (0x02, 0x38),
    ' ': (0x00, 0x2c), '\n': (0x00, 0x28),
}


class Handler(TargetHandler):
    flag_locations = ["用 tshark 提取 USB HID 数据，根据键码表还原输入"]

    def _send_text(self, text: str, filename: str = None):
        body = text.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        if filename:
            self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
        self.end_headers()
        self.wfile.write(body)

    def _build_usb_data(self) -> str:
        """将 Flag 的每个字符转换为 USB HID 键盘报告数据。"""
        lines = []
        lines.append("# USB HID Keyboard Data (每行 8 字节：修饰键 保留 键码 x6)")
        lines.append("# 提取每行第 3 字节（键码），查 USB HID 键码表还原字符")
        lines.append("# 修饰键 0x02 = Left Shift")
        lines.append("")
        for ch in self.flag:
            if ch in HID_KEY_MAP:
                mod, code = HID_KEY_MAP[ch]
                # 按键按下
                lines.append(f"{mod:02x} 00 {code:02x} 00 00 00 00 00")
                # 按键释放
                lines.append("00 00 00 00 00 00 00 00")
            else:
                # 未知字符，跳过
                lines.append(f"# 未知字符: {ch}")
        return "\n".join(lines) + "\n"

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/":
            html = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>USB 键盘流量恢复</title>
<style>
body { font-family: sans-serif; background: #0f172a; color: #e2e8f0; max-width: 860px; margin: 0 auto; padding: 20px; }
h1 { color: #38bdf8; }
.box { background: #1e293b; padding: 20px; border-radius: 10px; margin: 15px 0; }
a.dl { display: inline-block; padding: 12px 24px; background: #38bdf8; color: #0f172a; border-radius: 6px; text-decoration: none; font-weight: bold; }
.hint { background: #1e1b0f; color: #fde68a; padding: 12px; border-radius: 6px; }
code { background: #334155; padding: 2px 6px; border-radius: 4px; }
table { border-collapse: collapse; margin: 10px 0; width: 100%; }
td, th { border: 1px solid #475569; padding: 4px 8px; text-align: center; }
th { background: #334155; }
</style>
</head>
<body>
<h1>⌨️ USB 键盘流量恢复</h1>
<div class="box">
<h3>下载 USB HID 数据</h3>
<a class="dl" href="/pcap">下载 usb_keyboard.txt</a>
</div>
<div class="hint">
<strong>提示：</strong>每行 8 个十六进制字节，是一条 USB HID 键盘报告。<br>
- 真实场景：用 <code>tshark -r capture.pcap -T fields -e usb.capdata</code> 提取 HID 数据；<br>
- 每行格式：<code>修饰键 保留 键码1 键码2 键码3 键码4 键码5 键码6</code>；<br>
- 提取每行第 3 字节（键码），查 USB HID 键码表还原输入的字符。
</div>
<div class="box">
<h3>常用 USB HID 键码参考</h3>
<table>
<tr><th>键码</th><th>字符</th><th>键码</th><th>字符</th><th>键码</th><th>字符</th></tr>
<tr><td>04</td><td>a</td><td>0e</td><td>k</td><td>1e</td><td>1</td></tr>
<tr><td>05</td><td>b</td><td>0f</td><td>l</td><td>1f</td><td>2</td></tr>
<tr><td>09</td><td>f</td><td>17</td><td>t</td><td>27</td><td>0</td></tr>
<tr><td>0a</td><td>g</td><td>2f</td><td>[ (Shift+{)</td><td>30</td><td>] (Shift+})</td></tr>
</table>
<p>修饰键 <code>0x02</code> = Left Shift，<code>0x00</code> = 无修饰。</p>
</div>
</body>
</html>"""
            self._send_html(html)
        elif parsed.path == "/pcap":
            self._send_text(self._build_usb_data(), filename="usb_keyboard.txt")
        else:
            self._send_html("<h1>404</h1>", 404)


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8127
    run_server(Handler, port)
