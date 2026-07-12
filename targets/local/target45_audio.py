#!/usr/bin/env python3
"""靶机 45：音频隐写 — Flag 隐藏在音频频谱图中，用频谱分析工具可见。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse


class Handler(TargetHandler):
    flag_locations = ["用 Audacity 查看频谱图发现 Flag 文字"]

    def _send_text(self, text: str, filename: str = None):
        body = text.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        if filename:
            self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
        self.end_headers()
        self.wfile.write(body)

    def _build_audio_log(self) -> str:
        """构造音频分析日志，Flag 直接写在频谱图分析结果中。"""
        return (
            "===== WAV 音频文件分析日志 =====\n"
            "文件名: challenge.wav\n"
            "格式: WAV PCM\n"
            "采样率: 44100 Hz\n"
            "声道数: 1 (Mono)\n"
            "位深: 16-bit\n"
            "时长: 5.0 秒\n"
            "文件大小: 441044 bytes\n"
            "\n"
            "===== 频谱图分析结果 =====\n"
            "在频谱图视图中，可观察到以下文字图案：\n"
            "\n"
            f"  {self.flag}\n"
            "\n"
            "提示：用 Audacity 打开音频文件，\n"
            "点击音轨左侧的下拉菜单，选择「频谱图」视图，\n"
            "即可看到隐藏在频谱中的 Flag 文字。\n"
        )

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/":
            html = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>音频隐写分析</title>
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
<h1>🎵 音频频谱隐写分析</h1>
<div class="box">
<h3>下载音频文件</h3>
<a class="dl" href="/audio">下载 challenge_audio.txt</a>
</div>
<div class="hint">
<strong>提示：</strong>Flag 隐藏在音频的频谱图中。<br>
- 真实场景：用 <code>Audacity</code> 打开音频，切换到「频谱图」视图即可看到文字；<br>
- 此处模拟：分析日志中已写出频谱图中可见的 Flag 文字。
</div>
</body>
</html>"""
            self._send_html(html)
        elif parsed.path == "/audio":
            self._send_text(self._build_audio_log(), filename="challenge_audio.txt")
        else:
            self._send_html("<h1>404</h1>", 404)


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8125
    run_server(Handler, port)
