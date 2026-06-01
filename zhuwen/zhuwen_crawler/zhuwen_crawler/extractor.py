"""
字段提取模块 - 基于语义的字段智能提取

设计思路：
1. 用户配置主字段和子字段，每个字段有语义描述
2. 支持基于规则的简单提取（正则匹配）
3. 支持基于AI的智能提取（可选）
4. 自动检测值类型（text/number/time/array/object）
5. 提取结果结构化存储，便于MongoDB入库
"""

import re
import json
from typing import List, Dict, Any, Optional, Union
from dataclasses import dataclass, field, asdict
from datetime import datetime

from .config import FieldsConfig, MainFieldConfig, SubFieldConfig, AIExtractionConfig


@dataclass
class ExtractionValue:
    """提取值结构"""
    value: Any
    value_type: str  # text, number, time, array, object, null
    confidence: float = 1.0  # 提取置信度
    source_location: Optional[str] = None  # 来源位置标记


@dataclass
class SubFieldExtraction:
    """子字段提取结果"""
    sub_field_id: str
    sub_field_name: str
    description: str
    extraction: ExtractionValue


@dataclass
class MainFieldExtraction:
    """主字段提取结果"""
    main_field_id: str
    main_field_name: str
    description: str
    extraction: ExtractionValue
    sub_fields: List[SubFieldExtraction] = field(default_factory=list)


@dataclass
class ExtractionResult:
    """完整提取结果"""
    task_id: str
    url: str
    md_file_path: str
    main_fields: List[MainFieldExtraction]
    extraction_time: datetime
    total_fields: int
    success_fields: int


def detect_value_type(value: Any) -> str:
    """检测值类型

    类型检测规则：
    - null: 空值
    - number: 数字类型
    - time: 时间格式（YYYY-MM-DD, YYYY/MM/DD, 中文日期等）
    - array: 数组类型
    - object: 对象类型
    - text: 默认文本类型

    Args:
        value: 待检测的值

    Returns:
        str: 类型名称
    """
    if value is None or value == '' or value == 'null':
        return 'null'

    if isinstance(value, bool):
        return 'text'

    if isinstance(value, (int, float)):
        return 'number'

    if isinstance(value, list):
        return 'array'

    if isinstance(value, dict):
        return 'object'

    if isinstance(value, str):
        # 时间格式检测
        time_patterns = [
            r'^\d{4}-\d{2}-\d{2}',  # YYYY-MM-DD
            r'^\d{4}/\d{2}/\d{2}',  # YYYY/MM/DD
            r'^\d{2}:\d{2}',  # HH:MM
            r'^\d{4}年\d{1,2}月\d{1,2}日',  # 中文日期
            r'^\d{1,2}月\d{1,2}日',  # 简化中文日期
        ]

        for pattern in time_patterns:
            if re.match(pattern, value):
                return 'time'

        # 数字字符串检测
        if re.match(r'^[\d,.\-+%]+$', value):
            try:
                # 尝试转换为数字
                cleaned = value.replace(',', '').replace('%', '').replace('+', '')
                float(cleaned)
                return 'number'
            except ValueError:
                pass

    return 'text'


class RuleBasedExtractor:
    """基于规则的字段提取器"""

    def __init__(self, md_content: str):
        """初始化规则提取器

        Args:
            md_content: Markdown内容
        """
        self.md_content = md_content
        self.lines = md_content.split('\n')

    def extract_title(self) -> Optional[str]:
        """提取标题（第一个#标题）

        Returns:
            Optional[str]: 标题文本
        """
        for line in self.lines:
            if line.startswith('#'):
                # 移除#符号
                title = re.sub(r'^#+\s*', '', line).strip()
                return title if title else None
        return None

    def extract_by_keyword(self, keyword: str) -> Optional[str]:
        """基于关键词提取内容

        查找包含关键词的行，提取相关内容

        Args:
            keyword: 关键词

        Returns:
            Optional[str]: 提取的内容
        """
        for i, line in enumerate(self.lines):
            if keyword.lower() in line.lower():
                # 返回该行及后续相关内容
                content_parts = [line.strip()]
                # 查看后续几行是否相关
                for j in range(i + 1, min(i + 5, len(self.lines))):
                    next_line = self.lines[j].strip()
                    if next_line and not next_line.startswith('#'):
                        content_parts.append(next_line)
                    else:
                        break
                return ' '.join(content_parts)
        return None

    def extract_numbers(self) -> List[str]:
        """提取所有数字

        Returns:
            List[str]: 数字列表
        """
        numbers = []
        # 匹配各种数字格式
        patterns = [
            r'\d{1,3}(?:,\d{3})+(?:\.\d+)?',  # 带逗号的数字 1,234.56
            r'\d+\.\d+',  # 小数
            r'\d+',  # 整数
        ]

        for pattern in patterns:
            matches = re.findall(pattern, self.md_content)
            numbers.extend(matches)

        return numbers

    def extract_dates(self) -> List[str]:
        """提取所有日期

        Returns:
            List[str]: 日期列表
        """
        date_patterns = [
            r'\d{4}-\d{2}-\d{2}',
            r'\d{4}/\d{2}/\d{2}',
            r'\d{4}年\d{1,2}月\d{1,2}日',
        ]

        dates = []
        for pattern in date_patterns:
            matches = re.findall(pattern, self.md_content)
            dates.extend(matches)

        return dates

    def extract_urls(self) -> List[str]:
        """提取所有URL

        Returns:
            List[str]: URL列表
        """
        url_pattern = r'https?://[^\s\)]+'
        return re.findall(url_pattern, self.md_content)

    def extract_first_paragraph(self) -> Optional[str]:
        """提取第一个段落（摘要）

        Returns:
            Optional[str]: 第一段落内容
        """
        # 跳过元信息头部
        content_started = False
        for line in self.lines:
            if line.startswith('---'):
                content_started = True
                continue

            if content_started and line.strip() and not line.startswith('#'):
                # 收集段落内容
                paragraph = []
                for next_line in self.lines[self.lines.index(line):]:
                    if next_line.strip() and not next_line.startswith('#') and not next_line.startswith('-') and not next_line.startswith('|'):
                        paragraph.append(next_line.strip())
                    else:
                        break
                return ' '.join(paragraph) if paragraph else None

        return None


class AIExtractor:
    """基于AI的字段提取器（可选）"""

    def __init__(self, config: AIExtractionConfig):
        """初始化AI提取器

        Args:
            config: AI配置
        """
        self.config = config

    def _build_prompt(self, md_content: str, fields: List[MainFieldConfig]) -> str:
        """构建AI提取提示词

        Args:
            md_content: Markdown内容
            fields: 字段配置列表

        Returns:
            str: 提示词
        """
        field_descriptions = []
        for field in fields:
            desc = f"- **{field.name}**: {field.description}"
            if field.sub_fields:
                desc += "\n  子字段:"
                for sf in field.sub_fields:
                    desc += f"\n  - **{sf.name}**: {sf.description}"
            field_descriptions.append(desc)

        prompt = f"""你是一个专业的数据提取助手。请从以下 Markdown 内容中提取指定的字段信息。

## 待提取字段说明
{chr(10).join(field_descriptions)}

## Markdown 内容
{md_content}

## 提取要求
1. 根据字段描述的语义，从 Markdown 内容中精准提取对应信息
2. 如果某个字段信息不存在，返回 null
3. 保持原始数据的格式和精度
4. 对于数值类型，只提取数字部分，去除单位和符号
5. 对于时间类型，保持原始格式

## 输出格式
请以 JSON 格式输出提取结果，格式如下：
{
  "{fields[0].name if fields else 'field1'}": "提取的值或null"
}

对于有子字段的字段，使用嵌套结构：
{
  "主字段名": {
    "子字段1": "值",
    "子字段2": "值"
  }
}

请直接输出 JSON，不要添加任何解释或说明。"""

        return prompt

    def _clean_json_response(self, response: str) -> Dict:
        """清理AI响应，提取JSON

        Args:
            response: AI原始响应

        Returns:
            Dict: 解析后的JSON对象
        """
        # 移除可能的Markdown代码块标记
        cleaned = response.strip()
        cleaned = re.sub(r'^```json\s*', '', cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r'^```\s*', '', cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r'\s*```$', '', cleaned, flags=re.IGNORECASE)

        # 尝试找到JSON对象
        json_match = re.search(r'\{[\s\S]*\}', cleaned)
        if json_match:
            cleaned = json_match.group(0)

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            print(f"[WARN] JSON解析失败: {cleaned[:100]}")
            return {}

    def extract(self, md_content: str, fields: List[MainFieldConfig]) -> Dict[str, Any]:
        """使用AI提取字段

        Args:
            md_content: Markdown内容
            fields: 字段配置列表

        Returns:
            Dict[str, Any]: 提取结果字典
        """
        if not self.config.enabled or not self.config.api_key:
            print("[WARN] AI提取未启用或API Key未配置，跳过AI提取")
            return {}

        try:
            # 动态导入openai（可选依赖）
            from openai import OpenAI

            client = OpenAI(
                api_key=self.config.api_key,
                base_url=self.config.api_endpoint if self.config.api_endpoint else None
            )

            prompt = self._build_prompt(md_content, fields)

            response = client.chat.completions.create(
                model=self.config.model,
                messages=[
                    {"role": "system", "content": "你是一个专业的数据提取助手，擅长从文本中精准提取结构化信息。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=2000
            )

            content = response.choices[0].message.content
            return self._clean_json_response(content)

        except ImportError:
            print("[WARN] openai库未安装，跳过AI提取")
            return {}
        except Exception as e:
            print(f"[ERROR] AI提取失败: {e}")
            return {}


class FieldExtractor:
    """字段提取器主类"""

    def __init__(self, fields_config: FieldsConfig, ai_config: Optional[AIExtractionConfig] = None):
        """初始化字段提取器

        Args:
            fields_config: 字段配置
            ai_config: AI配置（可选）
        """
        self.fields_config = fields_config
        self.ai_config = ai_config

    def _rule_based_extract(self, md_content: str, field: MainFieldConfig) -> ExtractionValue:
        """基于规则提取单个字段

        Args:
            md_content: Markdown内容
            field: 字段配置

        Returns:
            ExtractionValue: 提取值
        """
        extractor = RuleBasedExtractor(md_content)

        # 根据字段ID和描述进行匹配
        field_id = field.id.lower()
        field_name = field.name.lower()
        description = field.description.lower()

        value = None

        # 根据常见字段类型进行匹配
        if 'title' in field_id or '标题' in field_name:
            value = extractor.extract_title()

        elif 'summary' in field_id or '摘要' in field_name or '简介' in description:
            value = extractor.extract_first_paragraph()

        elif 'author' in field_id or '作者' in field_name or '来源' in description:
            value = extractor.extract_by_keyword('作者') or extractor.extract_by_keyword('来源')

        elif 'time' in field_id or '时间' in field_name or '日期' in description:
            dates = extractor.extract_dates()
            value = dates[0] if dates else None

        elif 'keyword' in field_id or '关键词' in field_name or '标签' in description:
            value = extractor.extract_by_keyword('关键词') or extractor.extract_by_keyword('标签')

        elif 'price' in field_id or '价格' in field_name:
            numbers = extractor.extract_numbers()
            # 尝试找到价格相关的数字
            for num in numbers:
                context = extractor.extract_by_keyword(num)
                if context and any(kw in context.lower() for kw in ['价格', '价', '元', '￥']):
                    value = num
                    break

        elif 'number' in description or '数值' in description:
            numbers = extractor.extract_numbers()
            value = numbers[0] if numbers else None

        else:
            # 尝试关键词匹配
            keywords = [field_name, field_id] + description.split()
            for kw in keywords:
                if len(kw) > 2:  # 忽略太短的关键词
                    value = extractor.extract_by_keyword(kw)
                    if value:
                        break

        value_type = detect_value_type(value)
        return ExtractionValue(
            value=value,
            value_type=value_type,
            confidence=0.8 if value else 0.0
        )

    def extract(self, md_content: str, task_id: str, url: str, md_file_path: str) -> ExtractionResult:
        """执行字段提取

        Args:
            md_content: Markdown内容
            task_id: 任务ID
            url: 原始URL
            md_file_path: MD文件路径

        Returns:
            ExtractionResult: 提取结果
        """
        print(f"[INFO] 开始字段提取，共 {len(self.fields_config.main_fields)} 个主字段")

        main_field_results = []

        # 尝试AI提取（如果启用）
        ai_results = {}
        if self.ai_config and self.ai_config.enabled:
            ai_extractor = AIExtractor(self.ai_config)
            ai_results = ai_extractor.extract(md_content, self.fields_config.main_fields)

        # 处理每个主字段
        for main_field in self.fields_config.main_fields:
            # 先尝试AI结果
            ai_value = ai_results.get(main_field.name)

            if ai_value is not None:
                # 使用AI提取结果
                extraction = ExtractionValue(
                    value=ai_value,
                    value_type=detect_value_type(ai_value),
                    confidence=0.95
                )
            else:
                # 使用规则提取
                extraction = self._rule_based_extract(md_content, main_field)

            # 处理子字段
            sub_field_results = []
            for sub_field in main_field.sub_fields:
                # 尝试从AI结果中获取子字段值
                if isinstance(ai_value, dict):
                    sub_ai_value = ai_value.get(sub_field.name)
                else:
                    sub_ai_value = None

                if sub_ai_value is not None:
                    sub_extraction = ExtractionValue(
                        value=sub_ai_value,
                        value_type=detect_value_type(sub_ai_value),
                        confidence=0.95
                    )
                else:
                    # 规则提取子字段
                    sub_extraction = self._rule_based_extract(md_content, MainFieldConfig(
                        id=sub_field.id,
                        name=sub_field.name,
                        description=sub_field.description,
                        sub_fields=[]
                    ))

                sub_field_results.append(SubFieldExtraction(
                    sub_field_id=sub_field.id,
                    sub_field_name=sub_field.name,
                    description=sub_field.description,
                    extraction=sub_extraction
                ))

            main_field_results.append(MainFieldExtraction(
                main_field_id=main_field.id,
                main_field_name=main_field.name,
                description=main_field.description,
                extraction=extraction,
                sub_fields=sub_field_results
            ))

        # 统计成功数量
        success_count = sum(
            1 for mf in main_field_results
            if mf.extraction.value is not None and mf.extraction.value != ''
        )

        print(f"[SUCCESS] 字段提取完成: 成功 {success_count}/{len(main_field_results)} 个主字段")

        return ExtractionResult(
            task_id=task_id,
            url=url,
            md_file_path=md_file_path,
            main_fields=main_field_results,
            extraction_time=datetime.now(),
            total_fields=len(main_field_results),
            success_fields=success_count
        )

    def to_dict(self, result: ExtractionResult) -> Dict[str, Any]:
        """将提取结果转换为字典（便于MongoDB存储）

        Args:
            result: 提取结果

        Returns:
            Dict[str, Any]: 字典格式
        """
        return {
            'task_id': result.task_id,
            'url': result.url,
            'md_file_path': result.md_file_path,
            'extraction_time': result.extraction_time.isoformat(),
            'total_fields': result.total_fields,
            'success_fields': result.success_fields,
            'main_fields': [
                {
                    'main_field_id': mf.main_field_id,
                    'main_field_name': mf.main_field_name,
                    'description': mf.description,
                    'extraction': {
                        'value': mf.extraction.value,
                        'value_type': mf.extraction.value_type,
                        'confidence': mf.extraction.confidence,
                    },
                    'sub_fields': [
                        {
                            'sub_field_id': sf.sub_field_id,
                            'sub_field_name': sf.sub_field_name,
                            'description': sf.description,
                            'extraction': {
                                'value': sf.extraction.value,
                                'value_type': sf.extraction.value_type,
                                'confidence': sf.extraction.confidence,
                            }
                        }
                        for sf in mf.sub_fields
                    ]
                }
                for mf in result.main_fields
            ]
        }