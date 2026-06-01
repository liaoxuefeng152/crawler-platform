"""
zhuwen_crawler - 网页爬虫与数据提取工具

功能：
- 可配置的网页爬取
- HTML转Markdown转换
- 基于语义的字段提取
- MongoDB数据存储
"""

__version__ = "1.0.0"
__author__ = "Claude Code"

from .config import Config
from .fetcher import WebFetcher
from .md_converter import MarkdownConverter
from .extractor import FieldExtractor
from .mongo_store import MongoStore

__all__ = [
    "Config",
    "WebFetcher",
    "MarkdownConverter",
    "FieldExtractor",
    "MongoStore",
]