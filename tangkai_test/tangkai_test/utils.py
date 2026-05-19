import hashlib
import time
from urllib.parse import urlparse

def make_task_filename(task_id: str, url: str, ts: float = None) -> str:
    ts = ts or time.time()
    parsed = urlparse(url)
    domain = parsed.netloc.replace(':','_')
    timestr = time.strftime('%Y%m%d%H%M%S', time.localtime(ts))
    return f"{task_id}_{domain}_{timestr}.md"

def short_hash(s: str) -> str:
    return hashlib.sha1(s.encode('utf-8')).hexdigest()[:8]
