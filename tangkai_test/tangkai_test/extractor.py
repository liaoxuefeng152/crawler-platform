import json
import re
from typing import Any, Dict, List, Optional
import requests
from dateutil.parser import parse as parse_date

from .schemas import FieldDefinition

# Constants
CONFIDENCE_HIGH = 0.9
CONFIDENCE_MEDIUM = 0.85
CONFIDENCE_LOW = 0.65

# Patterns
PRICE_PATTERN = re.compile(r'[¥￥$]\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)')
DATE_PATTERN = re.compile(r'\b(\d{4}[年\-/]\d{1,2}[月\-/]\d{1,2})\b')
GENERIC_FIELD_PATTERN = re.compile(r'{field_name}[:：\s]*([^\n\r]+)')


def normalize_price(original: str, amount_str: str) -> Optional[Dict[str, Any]]:
    """Normalize price string to amount and currency.

    Args:
        original: The original matched string containing currency symbol (e.g., '¥1,234')
        amount_str: The extracted numeric string (e.g., '1,234')

    Returns:
        Dict with 'amount' and 'currency', or None if parsing fails.
    """
    cleaned = amount_str.replace(',', '').strip()
    try:
        amount = float(cleaned)
        currency = 'CNY' if '¥' in original or '￥' in original else ('USD' if '$' in original else None)
        return {'amount': amount, 'currency': currency}
    except ValueError:
        return None


def normalize_date(value: str) -> Optional[str]:
    try:
        dt = parse_date(value)
        return dt.date().isoformat()
    except (ValueError, TypeError):
        return None


def infer_value_type(hint: str, value: Any) -> Optional[str]:
    """Infer the value type based on hint and presence of value."""
    if not value:
        return None
    hint_lower = hint.lower() if hint else ''
    if hint_lower in ('price', 'money'):
        return 'number'
    if hint_lower in ('date', 'time'):
        return 'date'
    return 'text'


def build_field_result(
    value: Optional[str],
    hint: str,
    source_snippet: Optional[str],
    confidence: float
) -> Dict[str, Any]:
    """Build a standardized field result dictionary."""
    hint_lower = hint.lower() if hint else ''
    return {
        'value': value,
        'value_type': infer_value_type(hint_lower, value),
        'value_normalized': normalize_price(source_snippet or '', value) if hint_lower in ('price', 'money') and value
                            else (normalize_date(value) if hint_lower in ('date', 'time') and value else None),
        'source_snippet': source_snippet,
        'confidence': confidence,
    }


def rule_extract(md: str, fields: List[FieldDefinition]) -> Dict[str, Any]:
    results: Dict[str, Any] = {}
    for field in fields:
        name = field.name
        hint = (field.type_hint or '').lower()
        value = None
        source_snippet = None
        confidence = 0.0

        if hint in ('price', 'money', 'currency'):
            m = PRICE_PATTERN.search(md)
            if m:
                value = m.group(1).strip()
                source_snippet = m.group(0).strip()
                confidence = CONFIDENCE_HIGH
        elif hint in ('date', 'time'):
            m = DATE_PATTERN.search(md)
            if m:
                value = m.group(1)
                source_snippet = value
                confidence = CONFIDENCE_MEDIUM
        else:
            pattern = GENERIC_FIELD_PATTERN.pattern.format(field_name=re.escape(name))
            m = re.search(pattern, md)
            if m:
                value = m.group(1).strip()
                source_snippet = m.group(0).strip()
                confidence = CONFIDENCE_LOW

        if not value:
            results[name] = build_field_result(None, hint, None, 0.0)
        else:
            results[name] = build_field_result(value, hint, source_snippet, confidence)

    return results


def build_prompt(md: str, fields: List[FieldDefinition]) -> Dict[str, Any]:
    field_defs = []
    for field in fields:
        field_defs.append({
            'name': field.name,
            'description': field.description,
            'type_hint': field.type_hint or 'text'
        })
    template = {
        'md': md,
        'fields': field_defs,
        'instructions': [
            '返回严格 JSON 格式',
            '每个字段输出 value、value_type、value_normalized、source_snippet、confidence',
            '若字段不存在，返回 value:null 和 confidence:0.0',
        ]
    }
    return template


def call_new_api(md: str, fields: List[FieldDefinition], api_cfg: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    url = api_cfg.get('url')
    if not url:
        return None
    payload = build_prompt(md, fields)
    headers = {'Content-Type': 'application/json'}
    if api_cfg.get('api_key'):
        headers['Authorization'] = f"Bearer {api_cfg.get('api_key')}"
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=api_cfg.get('timeout', 15))
        response.raise_for_status()
        return response.json()
    except requests.RequestException:
        return None


def extract_fields(md: str, fields: List[FieldDefinition], api_cfg: Dict[str, Any]) -> Dict[str, Any]:
    rule_results = rule_extract(md, fields)
    low_confident = [name for name, res in rule_results.items() if res.get('confidence', 0.0) < 0.8]
    api_results = None
    if low_confident and api_cfg and api_cfg.get('url'):
        api_results = call_new_api(md, fields, api_cfg)

    final: Dict[str, Any] = {}
    for field in fields:
        name = field.name
        rule_res = rule_results.get(name, {})
        api_res = api_results.get('fields', {}).get(name) if api_results else None
        chosen = rule_res
        if api_res and (rule_res.get('confidence', 0.0) < api_res.get('confidence', 0.0)):
            chosen = api_res
        if chosen is None:
            chosen = build_field_result(None, '', None, 0.0)
        final[name] = chosen
    return final