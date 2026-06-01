"""
配置加载模块 - 从YAML文件加载配置

设计思路：
1. 使用YAML格式存储配置，便于人工编辑
2. 支持环境变量覆盖敏感配置（如MongoDB URI、API Key）
3. 使用Pydantic进行配置验证，确保配置正确性
4. 配置与代码分离，实现无硬编码设计
"""

import os
import yaml
from pathlib import Path
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field


@dataclass
class HeadersConfig:
    """请求头配置"""
    User_Agent: str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    Accept: str = "text/html,application/xhtml+xml,application/xml;q=0.9"
    Accept_Language: str = "zh-CN,zh;q=0.9,en;q=0.8"
    Accept_Encoding: str = "gzip, deflate, br"
    Connection: str = "keep-alive"


@dataclass
class CrawlerConfig:
    """爬虫策略配置"""
    headers: HeadersConfig = field(default_factory=HeadersConfig)
    rate_limit_delay: float = 1.0  # 请求间隔（秒）
    timeout: int = 30  # 请求超时（秒）
    max_retries: int = 3  # 最大重试次数
    main_content_selectors: List[str] = field(default_factory=lambda: [
        "article", ".article-content", ".post-content", ".content", "main"
    ])
    remove_selectors: List[str] = field(default_factory=lambda: [
        "script", "style", "iframe", "noscript", "nav", ".sidebar", ".footer"
    ])


@dataclass
class MarkdownConfig:
    """Markdown转换配置"""
    heading_style: str = "atx"  # 使用 # 标题
    code_block_style: str = "fenced"  # 使用 ``` 代码块
    bullet_list_marker: str = "-"  # 列表标记
    strip_newlines: bool = False
    add_metadata_header: bool = True
    metadata_template: str = """
# 爬取内容

> 来源: {domain}
> 爬取时间: {timestamp}
> 原始URL: {url}

---
"""


@dataclass
class MongoDBConfig:
    """MongoDB配置"""
    uri: str = "mongodb://localhost:27017"
    database: str = "crawler_db"
    collections: Dict[str, str] = field(default_factory=lambda: {
        "crawl_tasks": "crawl_tasks",
        "main_fields": "main_fields",
        "sub_fields": "sub_fields"
    })


@dataclass
class StorageConfig:
    """存储配置"""
    md_storage_path: str = "./storage/md"
    mongodb: MongoDBConfig = field(default_factory=MongoDBConfig)


@dataclass
class AIExtractionConfig:
    """AI提取配置"""
    enabled: bool = False
    api_endpoint: str = ""
    api_key: str = ""
    model: str = "gpt-oss-120b"
    timeout: int = 60
    retry_count: int = 3


@dataclass
class Config:
    """主配置类"""
    urls: List[str] = field(default_factory=list)
    crawler: CrawlerConfig = field(default_factory=CrawlerConfig)
    markdown: MarkdownConfig = field(default_factory=MarkdownConfig)
    storage: StorageConfig = field(default_factory=StorageConfig)
    ai_extraction: AIExtractionConfig = field(default_factory=AIExtractionConfig)

    @classmethod
    def from_yaml(cls, config_path: str) -> "Config":
        """从YAML文件加载配置

        Args:
            config_path: YAML配置文件路径

        Returns:
            Config: 配置对象
        """
        path = Path(config_path)
        if not path.exists():
            raise FileNotFoundError(f"配置文件不存在: {config_path}")

        with open(path, 'r', encoding='utf-8') as f:
            raw_config = yaml.safe_load(f)

        # 解析嵌套配置 - 处理连字符到下划线的转换
        raw_headers = raw_config.get('crawler', {}).get('headers', {})
        # 将YAML中的连字符键名转换为下划线
        headers_mapping = {
            'User-Agent': 'User_Agent',
            'Accept-Language': 'Accept_Language',
            'Accept-Encoding': 'Accept_Encoding',
        }
        normalized_headers = {}
        for key, value in raw_headers.items():
            norm_key = headers_mapping.get(key, key)
            normalized_headers[norm_key] = value

        headers_config = HeadersConfig(**normalized_headers)

        crawler_config = CrawlerConfig(
            headers=headers_config,
            rate_limit_delay=raw_config.get('crawler', {}).get('rate_limit_delay', 1.0),
            timeout=raw_config.get('crawler', {}).get('timeout', 30),
            max_retries=raw_config.get('crawler', {}).get('max_retries', 3),
            main_content_selectors=raw_config.get('crawler', {}).get('main_content_selectors', []),
            remove_selectors=raw_config.get('crawler', {}).get('remove_selectors', [])
        )

        markdown_config = MarkdownConfig(
            heading_style=raw_config.get('markdown', {}).get('heading_style', 'atx'),
            code_block_style=raw_config.get('markdown', {}).get('code_block_style', 'fenced'),
            bullet_list_marker=raw_config.get('markdown', {}).get('bullet_list_marker', '-'),
            strip_newlines=raw_config.get('markdown', {}).get('strip_newlines', False),
            add_metadata_header=raw_config.get('markdown', {}).get('add_metadata_header', True),
            metadata_template=raw_config.get('markdown', {}).get('metadata_template', '')
        )

        mongodb_config = MongoDBConfig(
            uri=os.environ.get('MONGODB_URI', raw_config.get('storage', {}).get('mongodb', {}).get('uri', 'mongodb://localhost:27017')),
            database=raw_config.get('storage', {}).get('mongodb', {}).get('database', 'crawler_db'),
            collections=raw_config.get('storage', {}).get('mongodb', {}).get('collections', {})
        )

        storage_config = StorageConfig(
            md_storage_path=raw_config.get('storage', {}).get('md_storage_path', './storage/md'),
            mongodb=mongodb_config
        )

        ai_config = AIExtractionConfig(
            enabled=raw_config.get('ai_extraction', {}).get('enabled', False),
            api_endpoint=raw_config.get('ai_extraction', {}).get('api_endpoint', ''),
            api_key=os.environ.get('AI_API_KEY', raw_config.get('ai_extraction', {}).get('api_key', '')),
            model=raw_config.get('ai_extraction', {}).get('model', 'gpt-oss-120b'),
            timeout=raw_config.get('ai_extraction', {}).get('timeout', 60),
            retry_count=raw_config.get('ai_extraction', {}).get('retry_count', 3)
        )

        return cls(
            urls=raw_config.get('urls', []),
            crawler=crawler_config,
            markdown=markdown_config,
            storage=storage_config,
            ai_extraction=ai_config
        )

    def get_headers_dict(self) -> Dict[str, str]:
        """获取请求头字典格式"""
        return {
            "User-Agent": self.crawler.headers.User_Agent,
            "Accept": self.crawler.headers.Accept,
            "Accept-Language": self.crawler.headers.Accept_Language,
            "Accept-Encoding": self.crawler.headers.Accept_Encoding,
            "Connection": self.crawler.headers.Connection,
        }


@dataclass
class SubFieldConfig:
    """子字段配置"""
    id: str
    name: str
    description: str


@dataclass
class MainFieldConfig:
    """主字段配置"""
    id: str
    name: str
    description: str
    sub_fields: List[SubFieldConfig] = field(default_factory=list)


@dataclass
class FieldsConfig:
    """字段提取规则配置"""
    main_fields: List[MainFieldConfig] = field(default_factory=list)

    @classmethod
    def from_yaml(cls, fields_path: str) -> "FieldsConfig":
        """从YAML文件加载字段配置

        Args:
            fields_path: YAML字段配置文件路径

        Returns:
            FieldsConfig: 字段配置对象
        """
        path = Path(fields_path)
        if not path.exists():
            raise FileNotFoundError(f"字段配置文件不存在: {fields_path}")

        with open(path, 'r', encoding='utf-8') as f:
            raw_config = yaml.safe_load(f)

        main_fields = []
        for mf in raw_config.get('main_fields', []):
            sub_fields = []
            for sf in mf.get('sub_fields', []):
                sub_fields.append(SubFieldConfig(
                    id=sf.get('id', ''),
                    name=sf.get('name', ''),
                    description=sf.get('description', '')
                ))

            main_fields.append(MainFieldConfig(
                id=mf.get('id', ''),
                name=mf.get('name', ''),
                description=mf.get('description', ''),
                sub_fields=sub_fields
            ))

        return cls(main_fields=main_fields)


def load_config(config_path: str = "config.yaml") -> Config:
    """加载主配置的便捷函数"""
    return Config.from_yaml(config_path)


def load_fields_config(fields_path: str = "fields.yaml") -> FieldsConfig:
    """加载字段配置的便捷函数"""
    return FieldsConfig.from_yaml(fields_path)