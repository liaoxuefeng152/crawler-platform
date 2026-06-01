"""
工具函数模块

提供通用的辅助功能
"""

import re
import hashlib
from datetime import datetime
from typing import Optional


def safe_filename(text: str, max_length: int = 50) -> str:
    """将文本转换为安全的文件名

    Args:
        text: 原始文本
        max_length: 最大长度

    Returns:
        str: 安全文件名
    """
    # 移除不安全字符
    safe = re.sub(r'[^\w\-]', '_', text)
    # 截断
    safe = safe[:max_length]
    return safe


def compute_hash(content: str) -> str:
    """计算内容的MD5哈希

    Args:
        content: 文本内容

    Returns:
        str: MD5哈希值
    """
    return hashlib.md5(content.encode('utf-8')).hexdigest()


def format_datetime(dt: datetime, fmt: str = '%Y-%m-%d %H:%M:%S') -> str:
    """格式化日期时间

    Args:
        dt: 日期时间对象
        fmt: 格式字符串

    Returns:
        str: 格式化后的字符串
    """
    return dt.strftime(fmt)


def truncate_text(text: str, max_length: int = 100, suffix: str = '...') -> str:
    """截断文本

    Args:
        text: 原始文本
        max_length: 最大长度
        suffix: 截断后缀

    Returns:
        str: 截断后的文本
    """
    if len(text) <= max_length:
        return text
    return text[:max_length - len(suffix)] + suffix


def clean_text(text: str) -> str:
    """清理文本（去除多余空白、特殊字符）

    Args:
        text: 原始文本

    Returns:
        str: 清理后的文本
    """
    # 去除首尾空白
    text = text.strip()
    # 合并连续空白
    text = re.sub(r'\s+', ' ', text)
    # 移除零宽字符
    text = re.sub(r'[​‌‍﻿]', '', text)
    return text