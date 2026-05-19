import argparse
import json
import os
import time
from typing import List, Optional
from pathlib import Path

from .config import ConfigLoader
from .fetcher import fetch_url
from .md_converter import html_to_structured_markdown
from .extractor import extract_fields
from .mongo_store import MongoStore
from .schemas import FieldDefinition
from .utils import make_task_filename


def load_fields_from_yaml(path: Optional[str]) -> List[FieldDefinition]:
    if not path:
        return []
    from ruamel.yaml import YAML
    yaml = YAML()
    with open(path, 'r', encoding='utf-8') as f:
        data = yaml.load(f)
    if not isinstance(data, list):
        return []
    return [FieldDefinition.parse_obj(item) for item in data]


def save_markdown(output_dir: str, filename: str, markdown: str) -> Path:
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    path = Path(output_dir) / filename
    path.write_text(markdown, encoding='utf-8')
    return path


def normalize_urls(raw: str) -> List[str]:
    if not raw:
        return []
    return [u.strip() for u in raw.split(',') if u.strip()]


def build_task_doc(task_id: str, url: str, md_path: str, md_text: str, metadata: dict) -> dict:
    return {
        'task_id': task_id,
        'source_url': url,
        'crawled_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'md_path': str(md_path),
        'md_filename': os.path.basename(md_path),
        'md_text': md_text,
        'metadata': metadata,
    }


def store_extraction(store: MongoStore, task_id: str, task_doc: dict, fields: List[FieldDefinition], extracted: dict):
    store.insert_task(task_doc)
    for field in fields:
        field_data = extracted.get(field.name, {})
        main_doc = {
            'main_field_id': f'{task_id}_{field.name}',
            'task_id': task_id,
            'name': field.name,
            'description': field.description,
        }
        store.insert_main_field(main_doc)
        sub_doc = {
            'sub_field_id': f'{task_id}_{field.name}_value',
            'task_id': task_id,
            'main_field_id': main_doc['main_field_id'],
            'name': field.name,
            'description': field.description,
            'extracted_value': field_data.get('value'),
            'value_type': field_data.get('value_type'),
            'source_snippet': field_data.get('source_snippet'),
            'confidence': field_data.get('confidence'),
        }
        store.insert_sub_field(sub_doc)
    store.upsert_extracted_document(task_id, {'task_id': task_id, 'fields': extracted, 'updated_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())})


def run_task(url: str, task_id: str, cfg, field_defs: List[FieldDefinition], out_dir: str):
    headers = {'User-Agent': cfg.crawler.user_agent}
    print(f'Fetching {url}')
    result = fetch_url(url, headers=headers, timeout=cfg.new_api.timeout, interval=cfg.crawler.request_interval_seconds, max_retries=cfg.crawler.max_retries)
    if result.detected_block:
        raise RuntimeError('Anti-bot content detected, manual intervention required.')
    markdown, metadata = html_to_structured_markdown(result.text)
    filename = make_task_filename(task_id, url)
    md_path = save_markdown(out_dir, filename, markdown)
    print(f'Saved markdown to {md_path}')
    extracted = {}
    if field_defs:
        extracted = extract_fields(markdown, field_defs, cfg.new_api.dict())
    store = MongoStore(cfg.mongo.uri, cfg.mongo.dbname)
    task_doc = build_task_doc(task_id, url, md_path, markdown, metadata)
    store_extraction(store, task_id, task_doc, field_defs, extracted)
    print(f'Stored task and extraction for {task_id}')
    return {'task_id': task_id, 'url': url, 'md_path': str(md_path), 'extracted': extracted}


def main():
    parser = argparse.ArgumentParser(description='Crawler + MD extractor')
    parser.add_argument('--url', required=True, help='Single or comma-separated target URLs')
    parser.add_argument('--task-id', required=True, help='Task ID for this run')
    parser.add_argument('--config', default='config.yaml', help='Config YAML path')
    parser.add_argument('--field-file', help='Optional YAML file containing custom field definitions')
    parser.add_argument('--output-dir', help='Override markdown output directory')
    args = parser.parse_args()

    loader = ConfigLoader(args.config)
    cfg = loader.load()
    output_dir = args.output_dir or cfg.crawler.output_dir
    field_defs = cfg.fields
    if args.field_file:
        field_defs = load_fields_from_yaml(args.field_file)
    urls = normalize_urls(args.url)
    results = []
    for url in urls:
        result = run_task(url, args.task_id, cfg, field_defs, output_dir)
        results.append(result)
    print(json.dumps(results, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()
