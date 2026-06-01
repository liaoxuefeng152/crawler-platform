"""
MD转换模块 - HTML转Markdown

设计思路：
1. 使用 markdownify 库进行基础转换
2. 自定义表格转换规则（markdownify默认不支持表格）
3. 添加元信息头部（来源、时间、URL）
4. 清理多余空行和无意义字符
5. 配置化的转换参数（标题风格、代码块风格等）
"""

import re
from bs4 import BeautifulSoup
from typing import Optional
from datetime import datetime
from dataclasses import dataclass

from .config import MarkdownConfig


@dataclass
class ConversionResult:
    """转换结果"""
    markdown: str
    original_length: int
    converted_length: int
    domain: str
    url: str
    timestamp: datetime


class MarkdownConverter:
    """HTML转Markdown转换器"""

    def __init__(self, config: MarkdownConfig):
        """初始化转换器

        Args:
            config: Markdown转换配置
        """
        self.config = config

    def _convert_table_to_markdown(self, table_html: str) -> str:
        """将HTML表格转换为Markdown表格格式

        Markdown表格格式：
        | 列1 | 列2 | 列3 |
        |---|---|---|
        | 数据 | 数据 | 数据 |

        Args:
            table_html: 表格HTML字符串

        Returns:
            str: Markdown表格字符串
        """
        soup = BeautifulSoup(table_html, 'lxml')
        table = soup.find('table')

        if not table:
            return ''

        rows = []
        # 处理表头
        header_row = table.find('tr')
        if header_row:
            headers = []
            for th in header_row.find_all(['th', 'td']):
                headers.append(th.get_text(strip=True))
            if headers:
                rows.append(f"| {headers.join(' | ')} |")
                rows.append(f"| {'---' * len(headers)} |")

        # 处理数据行
        for tr in table.find_all('tr')[1:]:
            cells = []
            for td in tr.find_all(['td', 'th']):
                cells.append(td.get_text(strip=True))
            if cells:
                rows.append(f"| {' | '.join(cells)} |")

        return '\n' + '\n'.join(rows) + '\n' if rows else ''

    def _clean_markdown(self, markdown: str) -> str:
        """清理Markdown内容

        处理：
        1. 移除连续多个空行（保留最多2个）
        2. 移除行首行尾空白
        3. 移除无意义的特殊字符

        Args:
            markdown: 原始Markdown

        Returns:
            str: 清理后的Markdown
        """
        # 移除连续空行
        cleaned = re.sub(r'\n{3,}', '\n\n', markdown)

        # 移除行首行尾空白
        cleaned = '\n'.join(line.strip() for line in cleaned.split('\n'))

        # 移除首尾空白
        cleaned = cleaned.strip()

        return cleaned

    def _build_metadata_header(self, domain: str, url: str, timestamp: datetime) -> str:
        """构建元信息头部

        Args:
            domain: 域名
            url: 原始URL
            timestamp: 爬取时间

        Returns:
            str: 元信息头部Markdown
        """
        if not self.config.add_metadata_header:
            return ''

        template = self.config.metadata_template
        header = template.format(
            domain=domain,
            url=url,
            timestamp=timestamp.strftime('%Y-%m-%d %H:%M:%S')
        )

        return header.strip() + '\n\n'

    def convert(self, html: str, domain: str, url: str, timestamp: Optional[datetime] = None) -> ConversionResult:
        """将HTML转换为Markdown

        Args:
            html: HTML内容
            domain: 域名
            url: 原始URL
            timestamp: 爬取时间（默认当前时间）

        Returns:
            ConversionResult: 转换结果
        """
        if timestamp is None:
            timestamp = datetime.now()

        original_length = len(html)

        # 使用BeautifulSoup解析
        soup = BeautifulSoup(html, 'lxml')

        # 处理表格（在转换前处理）
        for table in soup.find_all('table'):
            table_md = self._convert_table_to_markdown(str(table))
            if table_md:
                # 创建一个包含Markdown的div标记
                table.replace_with(BeautifulSoup(f'<div class="markdown-table">{table_md}</div>', 'lxml').find('div'))

        # 基础转换逻辑（手动实现，避免依赖markdownify的表格问题）
        markdown_lines = []

        # 处理标题
        for i in range(1, 7):
            for tag in soup.find_all(f'h{i}'):
                prefix = '#' * i
                text = tag.get_text(strip=True)
                markdown_lines.append(f"{prefix} {text}\n")

        # 处理段落
        for p in soup.find_all('p'):
            text = p.get_text(strip=True)
            if text:
                markdown_lines.append(f"{text}\n\n")

        # 处理列表
        for ul in soup.find_all('ul'):
            for li in ul.find_all('li', recursive=False):
                text = li.get_text(strip=True)
                if text:
                    markdown_lines.append(f"- {text}\n")

        for ol in soup.find_all('ol'):
            for idx, li in enumerate(ol.find_all('li', recursive=False), 1):
                text = li.get_text(strip=True)
                if text:
                    markdown_lines.append(f"{idx}. {text}\n")

        # 处理代码块
        for pre in soup.find_all('pre'):
            code = pre.find('code') or pre
            text = code.get_text()
            markdown_lines.append(f"```\n{text}\n```\n\n")

        # 处理链接
        for a in soup.find_all('a'):
            href = a.get('href', '')
            text = a.get_text(strip=True)
            if href and text:
                markdown_lines.append(f"[{text}]({href})\n")

        # 处理图片
        for img in soup.find_all('img'):
            src = img.get('src', '')
            alt = img.get('alt', '图片')
            if src:
                markdown_lines.append(f"![{alt}]({src})\n")

        # 处理表格标记
        for div in soup.find_all('div', class_='markdown-table'):
            markdown_lines.append(div.get_text())

        # 处理引用
        for blockquote in soup.find_all('blockquote'):
            text = blockquote.get_text(strip=True)
            if text:
                quoted = '\n'.join(f"> {line}" for line in text.split('\n'))
                markdown_lines.append(f"{quoted}\n\n")

        # 处理分隔线
        for hr in soup.find_all('hr'):
            markdown_lines.append("---\n\n")

        # 处理强调
        for strong in soup.find_all('strong'):
            text = strong.get_text(strip=True)
            if text:
                markdown_lines.append(f"**{text}**")

        for em in soup.find_all('em'):
            text = em.get_text(strip=True)
            if text:
                markdown_lines.append(f"*{text}*")

        # 合并所有内容
        markdown_body = ''.join(markdown_lines)

        # 清理内容
        markdown_body = self._clean_markdown(markdown_body)

        # 添加元信息头部
        metadata_header = self._build_metadata_header(domain, url, timestamp)
        final_markdown = metadata_header + markdown_body

        converted_length = len(final_markdown)

        print(f"[INFO] Markdown转换完成: {original_length} -> {converted_length} 字符")

        return ConversionResult(
            markdown=final_markdown,
            original_length=original_length,
            converted_length=converted_length,
            domain=domain,
            url=url,
            timestamp=timestamp
        )

    def save_to_file(self, markdown: str, file_path: str) -> str:
        """保存Markdown到文件

        Args:
            markdown: Markdown内容
            file_path: 文件路径

        Returns:
            str: 实际保存的文件路径
        """
        import os
        from pathlib import Path

        # 确保目录存在
        Path(file_path).parent.mkdir(parents=True, exist_ok=True)

        # 写入文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(markdown)

        print(f"[SUCCESS] Markdown文件已保存: {file_path}")
        return file_path


def generate_md_filename(task_id: str, domain: str) -> str:
    """生成MD文件名

    格式: {task_id}_{domain}_{timestamp}.md

    Args:
        task_id: 任务ID
        domain: 域名

    Returns:
        str: 文件名
    """
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    return f"{task_id}_{domain}_{timestamp}.md"