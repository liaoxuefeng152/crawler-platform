"""
爬虫模块 - 网页抓取与内容提取

设计思路：
1. 支持同步和异步两种爬取模式
2. 自动检测网页编码，支持GBK/UTF-8等
3. 模拟浏览器请求头，绕过简单反爬
4. 提取主内容区域，过滤广告和无关元素
5. 支持批量爬取和错误重试
"""

import time
import chardet
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from typing import List, Optional, Dict, Any
from dataclasses import dataclass
from datetime import datetime

from .config import Config, CrawlerConfig


@dataclass
class CrawlResult:
    """爬取结果数据结构"""
    url: str
    html: str
    domain: str
    encoding: str
    title: str
    crawl_time: datetime
    status_code: int
    error_message: Optional[str] = None


class WebFetcher:
    """网页爬取器"""

    def __init__(self, config: Config):
        """初始化爬虫

        Args:
            config: 配置对象，包含爬虫策略参数
        """
        self.config = config
        self.crawler_config = config.crawler
        self.session = requests.Session()
        self.session.headers.update(config.get_headers_dict())

    def _detect_encoding(self, content: bytes, content_type: Optional[str] = None) -> str:
        """检测网页编码

        编码检测优先级：
        1. HTTP Content-Type 中的 charset
        2. HTML meta 标签中的 charset
        3. chardet 自动检测
        4. 默认 UTF-8

        Args:
            content: 响应内容字节
            content_type: HTTP Content-Type 头

        Returns:
            str: 检测到的编码名称
        """
        # 从 Content-Type 检测
        if content_type:
            import re
            charset_match = re.search(r'charset=["\']?([^"\';\s>]+)', content_type, re.IGNORECASE)
            if charset_match:
                return charset_match.group(1).lower()

        # 从 HTML meta 标签检测
        try:
            html_preview = content[:1000].decode('utf-8', errors='ignore')
            charset_match = BeautifulSoup(html_preview, 'lxml').find('meta', charset=True)
            if charset_match:
                return charset_match.get('charset').lower()

            # 检查 meta http-equiv="Content-Type"
            meta_ct = BeautifulSoup(html_preview, 'lxml').find('meta', {'http-equiv': 'Content-Type'})
            if meta_ct and meta_ct.get('content'):
                import re
                charset_match = re.search(r'charset=["\']?([^"\';\s>]+)', meta_ct.get('content'), re.IGNORECASE)
                if charset_match:
                    return charset_match.group(1).lower()
        except Exception:
            pass

        # 使用 chardet 自动检测
        try:
            detected = chardet.detect(content)
            if detected and detected.get('encoding'):
                return detected['encoding'].lower()
        except Exception:
            pass

        return 'utf-8'

    def _extract_domain(self, url: str) -> str:
        """从URL提取域名

        Args:
            url: 网页URL

        Returns:
            str: 域名（点号替换为下划线）
        """
        try:
            parsed = urlparse(url)
            return parsed.hostname.replace('.', '_') if parsed.hostname else 'unknown_domain'
        except Exception:
            return 'unknown_domain'

    def _filter_content(self, soup: BeautifulSoup) -> BeautifulSoup:
        """过滤广告和无关内容

        根据配置中的 remove_selectors 移除：
        - script, style, iframe 等技术元素
        - nav, sidebar, footer 等导航元素
        - 广告相关元素

        Args:
            soup: BeautifulSoup 对象

        Returns:
            BeautifulSoup: 过滤后的对象
        """
        for selector in self.crawler_config.remove_selectors:
            # 处理 CSS 选择器
            if selector.startswith('.') or selector.startswith('#') or selector.startswith('['):
                for element in soup.select(selector):
                    element.decompose()
            else:
                # 处理标签名
                for element in soup.find_all(selector):
                    element.decompose()

        return soup

    def _extract_main_content(self, soup: BeautifulSoup) -> str:
        """提取主要内容区域

        策略：按优先级遍历配置中的选择器，找到第一个包含足够内容的区域

        Args:
            soup: BeautifulSoup 对象

        Returns:
            str: 主内容区域的HTML
        """
        for selector in self.crawler_config.main_content_selectors:
            elements = soup.select(selector)
            for element in elements:
                text_length = len(element.get_text(strip=True))
                if text_length > 100:  # 至少100字符才算有效内容
                    return str(element)

        # 没找到则返回 body 内容
        body = soup.find('body')
        return str(body) if body else str(soup)

    def _extract_title(self, soup: BeautifulSoup) -> str:
        """提取页面标题

        Args:
            soup: BeautifulSoup 对象

        Returns:
            str: 页面标题
        """
        title_tag = soup.find('title')
        if title_tag:
            return title_tag.get_text(strip=True)

        h1_tag = soup.find('h1')
        if h1_tag:
            return h1_tag.get_text(strip=True)

        return "无标题"

    def fetch_single(self, url: str) -> CrawlResult:
        """爬取单个URL

        Args:
            url: 目标URL

        Returns:
            CrawlResult: 爬取结果
        """
        crawl_time = datetime.now()
        domain = self._extract_domain(url)

        print(f"[INFO] 开始爬取: {url}")

        for attempt in range(self.crawler_config.max_retries):
            try:
                response = self.session.get(
                    url,
                    timeout=self.crawler_config.timeout,
                    allow_redirects=True
                )

                # 检测编码
                encoding = self._detect_encoding(
                    response.content,
                    response.headers.get('Content-Type', '')
                )
                print(f"[INFO] 检测到编码: {encoding}")

                # 解码HTML
                try:
                    if encoding.lower() in ['gbk', 'gb2312', 'gb18030']:
                        html = response.content.decode('gbk', errors='ignore')
                    else:
                        html = response.content.decode(encoding, errors='ignore')
                except Exception:
                    html = response.content.decode('utf-8', errors='ignore')

                # 解析HTML
                soup = BeautifulSoup(html, 'lxml')

                # 提取标题
                title = self._extract_title(soup)

                # 过滤内容
                soup = self._filter_content(soup)

                print(f"[SUCCESS] 爬取成功: {url} (状态码: {response.status_code})")

                return CrawlResult(
                    url=url,
                    html=str(soup),
                    domain=domain,
                    encoding=encoding,
                    title=title,
                    crawl_time=crawl_time,
                    status_code=response.status_code
                )

            except requests.exceptions.Timeout:
                print(f"[WARN] 超时 (尝试 {attempt + 1}/{self.crawler_config.max_retries}): {url}")
            except requests.exceptions.RequestException as e:
                print(f"[WARN] 请求失败 (尝试 {attempt + 1}/{self.crawler_config.max_retries}): {e}")

            # 重试前等待
            if attempt < self.crawler_config.max_retries - 1:
                time.sleep(self.crawler_config.rate_limit_delay)

        # 所有重试失败
        print(f"[ERROR] 爬取失败: {url}")
        return CrawlResult(
            url=url,
            html='',
            domain=domain,
            encoding='',
            title='',
            crawl_time=crawl_time,
            status_code=0,
            error_message="请求失败，已达到最大重试次数"
        )

    def fetch_batch(self, urls: List[str]) -> List[CrawlResult]:
        """批量爬取URL列表

        Args:
            urls: URL列表

        Returns:
            List[CrawlResult]: 爬取结果列表
        """
        results = []
        total = len(urls)

        print(f"[INFO] 开始批量爬取，共 {total} 个URL")

        for i, url in enumerate(urls):
            print(f"[INFO] 正在爬取第 {i + 1}/{total} 个URL")
            result = self.fetch_single(url)
            results.append(result)

            # 请求间隔（防止被封）
            if i < total - 1:
                time.sleep(self.crawler_config.rate_limit_delay)

        success_count = len([r for r in results if r.status_code == 200])
        print(f"[SUCCESS] 批量爬取完成: 成功 {success_count}/{total}")

        return results

    def close(self):
        """关闭会话"""
        self.session.close()


def generate_task_id() -> str:
    """生成业务任务ID

    格式: task_YYYYMMDD_HHmmss_xxxx

    Returns:
        str: 任务ID
    """
    now = datetime.now()
    date_str = now.strftime('%Y%m%d')
    time_str = now.strftime('%H%M%S')
    random_suffix = str(int(time.time() * 1000) % 10000).zfill(4)
    return f"task_{date_str}_{time_str}_{random_suffix}"