#!/usr/bin/env python3
"""靶机 31：UAF（Use-After-Free）释放后重用 — 模拟 PWN 堆管理，delete 后重新 add 触发指针复用。"""
from base import TargetHandler, run_server
from urllib.parse import urlparse


def _val(body, key, default=""):
    """兼容 JSON / urlencoded 表单取值。"""
    v = body.get(key, default)
    if isinstance(v, list):
        return v[0] if v else default
    return v


class Handler(TargetHandler):
    flag_locations = ["delete 后重新 add 覆盖函数指针，show 触发劫持"]

    # 类级堆状态（跨请求持久，模拟进程堆）
    heap = {}        # {ptr: {"size": int, "data": str, "freed": bool, "reused": bool}}
    next_ptr = 1     # 下一个指针编号

    def _new_ptr(self):
        p = Handler.next_ptr
        Handler.next_ptr += 1
        return p

    def _menu_html(self, msg=""):
        rows = ""
        for ptr, blk in Handler.heap.items():
            if blk["reused"]:
                state = "已复用(UAF!)"
                data = "函数指针已被覆盖 → system('/bin/cat /flag')"
            elif blk["freed"]:
                state = "已释放(悬空指针)"
                data = blk["data"]
            else:
                state = "在用"
                data = blk["data"]
            rows += (
                f"<tr><td>{ptr}</td><td>{blk['size']}</td>"
                f"<td>{state}</td><td><code>{data}</code></td></tr>"
            )

        msg_html = f'<div class="msg">{msg}</div>' if msg else ""
        return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>堆管理器 - UAF</title>
<style>
body {{ font-family: sans-serif; background: #1e1e2e; color: #cdd6f4; max-width: 920px; margin: 0 auto; padding: 20px; }}
h1 {{ color: #cba6f7; }}
.box {{ background: #313244; padding: 20px; border-radius: 10px; margin: 15px 0; }}
button {{ padding: 8px 16px; margin: 5px; background: #cba6f7; color: #1e1e2e; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }}
input, select {{ padding: 8px; margin: 5px; background: #45475a; color: #cdd6f4; border: 1px solid #585b70; border-radius: 6px; }}
table {{ width: 100%; border-collapse: collapse; margin-top: 10px; }}
th, td {{ border: 1px solid #585b70; padding: 8px; text-align: left; }}
th {{ background: #45475a; }}
.msg {{ background: #a6e3a1; color: #1e1e2e; padding: 10px; border-radius: 6px; margin: 10px 0; font-family: monospace; word-break: break-all; }}
.hint {{ background: #f9e2af; color: #1e1e2e; padding: 12px; border-radius: 6px; }}
code {{ background: #45475a; padding: 2px 6px; border-radius: 4px; }}
</style>
</head>
<body>
<h1>🧩 堆管理器（模拟）</h1>
<p>菜单：1.add 2.delete 3.show 4.edit</p>
<div class="box">
<h3>操作</h3>
<form method="POST" action="/action">
  <label>操作:
    <select name="action">
      <option value="add">1. add (分配)</option>
      <option value="delete">2. delete (释放)</option>
      <option value="show">3. show (查看)</option>
      <option value="edit">4. edit (编辑)</option>
    </select>
  </label><br>
  <input name="size" placeholder="块大小(如 32)" value="32">
  <input name="ptr" placeholder="指针编号(delete/show/edit 用)">
  <input name="data" placeholder="数据(add/edit 用)">
  <button type="submit">执行</button>
</form>
</div>
{msg_html}
<div class="box">
<h3>堆块列表</h3>
<table>
<tr><th>指针</th><th>大小</th><th>状态</th><th>数据</th></tr>
{rows}
</table>
</div>
<div class="hint">
<strong>提示：</strong>delete 后指针不置空（悬空指针）。再次 add 相同大小的块会复用被释放的内存，
覆盖原对象的函数指针。此时对该指针调用 show 即可触发 UAF，劫持执行流拿到 Flag。<br>
<strong>攻击链：</strong>add(32) → delete(ptr) → add(32) 复用 → show(ptr) → Flag
</div>
</body>
</html>"""

    def handle_get(self, parsed: urlparse):
        if parsed.path == "/" or parsed.path == "/menu":
            self._send_html(self._menu_html())
        else:
            self._send_html("<h1>404</h1>", 404)

    def handle_post(self, parsed: urlparse):
        if parsed.path != "/action":
            self._send_json({"error": "not found"}, 404)
            return

        body = self._read_body()
        action = _val(body, "action", "")
        try:
            size = int(_val(body, "size", "32") or "32")
        except ValueError:
            size = 32
        ptr_raw = _val(body, "ptr", "")
        data = _val(body, "data", "")
        try:
            ptr = int(ptr_raw)
        except (ValueError, TypeError):
            ptr = -1

        msg = ""
        if action == "add":
            # 优先复用已释放的相同大小块（模拟 fastbin / tcache 复用）
            reused_ptr = None
            for p, blk in Handler.heap.items():
                if blk["freed"] and blk["size"] == size:
                    reused_ptr = p
                    break
            if reused_ptr is not None:
                Handler.heap[reused_ptr] = {
                    "size": size,
                    "data": data or "新对象(覆盖了函数指针)",
                    "freed": False,
                    "reused": True,
                }
                msg = (f"add 复用了已释放的堆块 ptr={reused_ptr}（UAF 触发！"
                       f"原函数指针已被覆盖）")
            else:
                p = self._new_ptr()
                Handler.heap[p] = {
                    "size": size,
                    "data": data or "新对象",
                    "freed": False,
                    "reused": False,
                }
                msg = f"add 分配新堆块 ptr={p} size={size}"
        elif action == "delete":
            if ptr in Handler.heap and not Handler.heap[ptr]["freed"]:
                # 释放但不删除条目、不置空指针（悬空指针）
                Handler.heap[ptr]["freed"] = True
                msg = (f"delete 已释放 ptr={ptr}（注意：指针未置空，存在悬空指针）")
            else:
                msg = f"delete 失败：ptr={ptr_raw} 不存在或已释放"
        elif action == "show":
            if ptr in Handler.heap:
                blk = Handler.heap[ptr]
                if blk["reused"]:
                    # UAF 触发：函数指针被覆盖，劫持到 system
                    msg = (f"show ptr={ptr}：检测到 UAF！函数指针被劫持，"
                           f"执行 system('/bin/cat /flag') → Flag: {self.flag}")
                elif blk["freed"]:
                    msg = (f"show ptr={ptr}：读取已释放内存（悬空指针）"
                           f"data={blk['data']}")
                else:
                    msg = f"show ptr={ptr} data={blk['data']}"
            else:
                msg = f"show 失败：ptr={ptr_raw} 不存在"
        elif action == "edit":
            if ptr in Handler.heap:
                Handler.heap[ptr]["data"] = data
                msg = f"edit ptr={ptr} data={data}"
            else:
                msg = f"edit 失败：ptr={ptr_raw} 不存在"
        else:
            msg = "未知操作"

        self._send_html(self._menu_html(msg))


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8111
    run_server(Handler, port)
