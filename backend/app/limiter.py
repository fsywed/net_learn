"""IP 限流：内存 LRU Map，限制每 IP 同时运行的实例数 + 提交频率。"""
from __future__ import annotations

import time
from collections import defaultdict, deque
from typing import Deque, Dict

from app.config import settings


class IPRateLimiter:
    """简单的滑动窗口限流器。

    - max_concurrent: 每 IP 同时存在的实例上限
    - submit_window_sec: 提交 Flag 的最小间隔
    """

    def __init__(self, max_concurrent: int, submit_window_sec: float = 2.0) -> None:
        self.max_concurrent = max_concurrent
        self.submit_window_sec = submit_window_sec
        self._concurrent: Dict[str, int] = defaultdict(int)
        self._submit_log: Dict[str, Deque[float]] = defaultdict(deque)

    def can_spawn(self, ip: str) -> bool:
        return self._concurrent[ip] < self.max_concurrent

    def acquire(self, ip: str) -> None:
        self._concurrent[ip] += 1

    def release(self, ip: str) -> None:
        if self._concurrent[ip] > 0:
            self._concurrent[ip] -= 1

    def can_submit(self, ip: str) -> bool:
        now = time.monotonic()
        log = self._submit_log[ip]
        # 清理窗口外的旧记录
        while log and now - log[0] > self.submit_window_sec:
            log.popleft()
        return len(log) < 3  # 每 2 秒最多 3 次提交

    def record_submit(self, ip: str) -> None:
        self._submit_log[ip].append(time.monotonic())


limiter = IPRateLimiter(
    max_concurrent=settings.TARGET_MAX_PER_IP,
    submit_window_sec=2.0,
)
