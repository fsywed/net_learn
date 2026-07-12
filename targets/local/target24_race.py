#!/usr/bin/env python3
"""靶机 24：条件竞争 — 优惠券领取存在 TOCTOU 时间窗口，可并发领取多张。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse
import time


# 全局共享状态（模拟多请求共享的资源）
_race_state = {
    "claimed": False,   # 是否已领取（检查标志）
    "points": 0,        # 当前积分
    "coupons": 0,       # 已领取优惠券数
    "last_claim": 0,    # 上次领取时间戳
}


class Handler(TargetHandler):
    flag_locations = ["并发请求 /claim 接口领取多张优惠券"]

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/" or parsed.path == "/claim":
            html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>优惠券中心</title>
    <style>
        body {{ font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }}
        .box {{ background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }}
        button {{ padding: 10px 20px; background: #E91E63; color: #fff; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; }}
        .stat {{ font-size: 18px; }}
        .hint {{ color: #999; font-size: 12px; }}
    </style>
</head>
<body>
    <h1>优惠券中心</h1>
    <div class="box">
        <p class="stat">当前积分：<strong>{_race_state["points"]}</strong></p>
        <p class="stat">已领优惠券：<strong>{_race_state["coupons"]}</strong> 张</p>
    </div>
    <div class="box">
        <form method="POST" action="/claim">
            <button type="submit">领取优惠券（每人限领 1 张，+100 积分）</button>
        </form>
    </div>
    <div class="box">
        <form method="POST" action="/redeem">
            <button type="submit">兑换 Flag（需要积分 &gt; 100）</button>
        </form>
    </div>
    <p class="hint">提示：领取接口存在 TOCTOU 竞争漏洞，并发请求可绕过"每人限领 1 张"的限制，领取多张优惠券累积积分。</p>
</body>
</html>"""
            self._send_html(html)
        else:
            self._send_html("<h1>404</h1>", 404)

    def handle_post(self, parsed: urlparse):
        if parsed.path == "/claim":
            now = time.time()
            # TOCTOU 漏洞：先检查 claimed 再设置 —— 存在时间窗口
            # 简化模拟：领取后 2 秒内的并发请求可再次通过检查（竞争成功）
            if _race_state["claimed"] and (now - _race_state["last_claim"] > 2):
                msg = "您已经领取过优惠券了（每人限领 1 张）。"
                success = False
            else:
                # 检查通过后未立即设置标志，存在窗口（模拟竞争成功）
                _race_state["claimed"] = True
                _race_state["last_claim"] = now
                _race_state["coupons"] += 1
                _race_state["points"] += 100
                msg = (f"领取成功！获得 1 张优惠券（+100 积分）。"
                       f"当前积分：{_race_state['points']}，已领：{_race_state['coupons']} 张。")
                success = True

            html = f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>领取结果</title></head>
<body>
    <h1>领取结果</h1>
    <p>{msg}</p>
    <p>当前积分：<strong>{_race_state["points"]}</strong>，已领优惠券：<strong>{_race_state["coupons"]}</strong> 张</p>
    {'<p>竞争成功！继续并发领取或前往兑换。</p>' if success else ''}
    <p><a href="/">返回</a></p>
</body>
</html>"""
            self._send_html(html)
        elif parsed.path == "/redeem":
            if _race_state["points"] > 100:
                html = f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>兑换成功</title></head>
<body>
    <h1>兑换成功</h1>
    <p>积分 {_race_state["points"]} &gt; 100，兑换成功！</p>
    <p><strong>Flag:</strong> {self.flag}</p>
    <p>漏洞原因：领取接口"检查-扣减"非原子操作（TOCTOU），并发请求可在窗口内多次领取。</p>
</body>
</html>"""
                self._send_html(html)
            else:
                html = f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>兑换失败</title></head>
<body>
    <h1>兑换失败</h1>
    <p>当前积分 {_race_state["points"]} 不足，需要积分 &gt; 100。</p>
    <p>提示：并发请求 /claim 接口领取多张优惠券累积积分。</p>
    <p><a href="/">返回</a></p>
</body>
</html>"""
                self._send_html(html)
        else:
            self._send_json({"error": "not found"}, 404)


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8104
    run_server(Handler, port)
