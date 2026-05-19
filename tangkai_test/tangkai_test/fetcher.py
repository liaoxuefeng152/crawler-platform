import time
import requests
from typing import Tuple

class FetchResult:
    def __init__(self, url: str, status_code: int, text: str, headers: dict, detected_block=False):
        self.url = url
        self.status_code = status_code
        self.text = text
        self.headers = headers
        self.detected_block = detected_block

def fetch_url(url: str, headers: dict = None, timeout: int = 15, interval: float = 1.0, max_retries: int = 2) -> FetchResult:
    headers = headers or {}
    last_exc = None
    for attempt in range(max_retries+1):
        try:
            resp = requests.get(url, headers=headers, timeout=timeout)
            text = resp.text
            detected = detect_antibot(text, resp.status_code)
            return FetchResult(url, resp.status_code, text, dict(resp.headers), detected_block=detected)
        except requests.RequestException as e:
            last_exc = e
            time.sleep(interval)
    raise last_exc

def detect_antibot(html: str, status_code: int) -> bool:
    if status_code in (403, 429):
        return True
    # common Chinese anti-bot phrases
    flags = ["访问异常", "请完成下方验证", "滑动", "验证码", "扫码验证"]
    for f in flags:
        if f in html:
            return True
    return False
