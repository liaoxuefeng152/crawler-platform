"""schemas模块 - 数据结构定义"""

from .extractor import (
    ExtractionValue,
    SubFieldExtraction,
    MainFieldExtraction,
    ExtractionResult,
    detect_value_type,
)

from .mongo_store import (
    CrawlTaskDocument,
    MainFieldDocument,
    SubFieldDocument,
)

__all__ = [
    "ExtractionValue",
    "SubFieldExtraction",
    "MainFieldExtraction",
    "ExtractionResult",
    "detect_value_type",
    "CrawlTaskDocument",
    "MainFieldDocument",
    "SubFieldDocument",
]