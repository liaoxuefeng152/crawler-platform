"""
CLI入口模块 - 命令行接口

使用方式：
  python -m zhuwen_crawler crawl              # 爬取并生成MD
  python -m zhuwen_crawler extract            # 基于MD提取字段
  python -m zhuwen_crawler run                # 完整流程
  python -m zhuwen_crawler preview            # 预览MD文件
  python -m zhuwen_crawler db-stats           # 查看数据库统计
  python -m zhuwen_crawler db-tasks           # 查看任务列表
"""

import sys
import os
import json
from pathlib import Path
from datetime import datetime
from typing import Optional


def print_banner():
    """打印程序横幅"""
    banner = """
╔══════════════════════════════════════════════╗
║     zhuwen_crawler - 网页爬虫与数据提取工具    ║
╚══════════════════════════════════════════════╝
"""
    print(banner)


def print_separator():
    """打印分隔线"""
    print("\n" + "=" * 60 + "\n")


def run_crawl(config_path: str, output_dir: Optional[str] = None) -> list:
    """执行爬取流程

    Args:
        config_path: 配置文件路径
        output_dir: 输出目录（覆盖配置）

    Returns:
        list: 爬取结果列表
    """
    from .config import Config
    from .fetcher import WebFetcher, generate_task_id
    from .md_converter import MarkdownConverter, generate_md_filename

    # 加载配置
    config = Config.from_yaml(config_path)

    if not config.urls:
        print("[ERROR] 未配置爬取URL，请在config.yaml中添加urls")
        return []

    # 覆盖输出目录
    if output_dir:
        config.storage.md_storage_path = output_dir

    # 生成任务ID
    task_id = generate_task_id()
    print(f"[INFO] 任务ID: {task_id}")

    # 初始化爬虫
    fetcher = WebFetcher(config)

    # 爬取URL
    print(f"[INFO] 开始爬取 {len(config.urls)} 个URL")
    crawl_results = fetcher.fetch_batch(config.urls)

    # 初始化MD转换器
    converter = MarkdownConverter(config.markdown)

    # 转换并保存MD
    saved_files = []
    for result in crawl_results:
        if result.status_code != 200 or not result.html:
            print(f"[WARN] 跳过失败URL: {result.url}")
            continue

        # 转换为Markdown
        conversion = converter.convert(
            html=result.html,
            domain=result.domain,
            url=result.url,
            timestamp=result.crawl_time
        )

        # 生成文件名
        md_filename = generate_md_filename(task_id, result.domain)

        # 保存文件
        storage_path = config.storage.md_storage_path
        md_file_path = os.path.join(storage_path, md_filename)
        converter.save_to_file(conversion.markdown, md_file_path)

        saved_files.append({
            'task_id': task_id,
            'url': result.url,
            'domain': result.domain,
            'encoding': result.encoding,
            'title': result.title,
            'crawl_time': result.crawl_time.isoformat(),
            'md_file_path': md_file_path,
            'md_file_name': md_filename,
            'md_content': conversion.markdown,
        })

    fetcher.close()

    print(f"\n[SUCCESS] 爬取完成! 共生成 {len(saved_files)} 个MD文件")
    return saved_files


def run_extract(config_path: str, fields_path: str, crawl_data: Optional[list] = None) -> list:
    """执行字段提取流程

    Args:
        config_path: 配置文件路径
        fields_path: 字段配置文件路径
        crawl_data: 爬取数据（如未提供则从MD文件读取）

    Returns:
        list: 提取结果列表
    """
    from .config import Config, FieldsConfig
    from .extractor import FieldExtractor

    # 加载配置
    config = Config.from_yaml(config_path)
    fields_config = FieldsConfig.from_yaml(fields_path)

    if not fields_config.main_fields:
        print("[ERROR] 未配置提取字段，请在fields.yaml中添加main_fields")
        return []

    # 初始化提取器
    extractor = FieldExtractor(fields_config, config.ai_extraction)

    # 读取MD内容
    extraction_results = []

    if crawl_data:
        for item in crawl_data:
            md_content = item.get('md_content', '')
            if not md_content and item.get('md_file_path'):
                try:
                    with open(item['md_file_path'], 'r', encoding='utf-8') as f:
                        md_content = f.read()
                except Exception as e:
                    print(f"[WARN] 读取MD文件失败: {e}")
                    continue

            print(f"\n[INFO] 提取: {item.get('url', 'unknown')}")

            result = extractor.extract(
                md_content=md_content,
                task_id=item['task_id'],
                url=item.get('url', ''),
                md_file_path=item.get('md_file_path', '')
            )

            extraction_results.append(extractor.to_dict(result))

    return extraction_results


def run_store(config_path: str, crawl_data: list, extraction_data: list) -> bool:
    """执行MongoDB存储流程

    Args:
        config_path: 配置文件路径
        crawl_data: 爬取数据
        extraction_data: 提取数据

    Returns:
        bool: 是否成功
    """
    from .config import Config
    from .mongo_store import MongoStore, CrawlTaskDocument

    # 加载配置
    config = Config.from_yaml(config_path)

    # 初始化MongoDB
    store = MongoStore(
        uri=config.storage.mongodb.uri,
        database=config.storage.mongodb.database,
        collections=config.storage.mongodb.collections
    )

    if not store.is_connected():
        print("[WARN] MongoDB未连接，数据仅保存到本地文件")
        store.close()
        return False

    # 保存爬取任务
    for item in crawl_data:
        task = CrawlTaskDocument(
            task_id=item['task_id'],
            url=item.get('url', ''),
            domain=item.get('domain', ''),
            crawl_time=datetime.fromisoformat(item['crawl_time']) if isinstance(item.get('crawl_time'), str) else item.get('crawl_time'),
            md_file_path=item.get('md_file_path', ''),
            md_file_name=item.get('md_file_name', ''),
            md_content=item.get('md_content'),
            encoding=item.get('encoding', ''),
            title=item.get('title', ''),
            status='completed',
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        store.save_crawl_task(task)

    # 保存提取结果
    for ext_data in extraction_data:
        store.save_extraction_result(ext_data)

    store.close()
    return True


def run_full_pipeline(config_path: str, fields_path: str):
    """执行完整流程：爬取 → MD转换 → 字段提取 → MongoDB存储

    Args:
        config_path: 配置文件路径
        fields_path: 字段配置文件路径
    """
    print_banner()
    print("▶ 完整流程: 爬取 → MD转换 → 字段提取 → MongoDB存储")
    print_separator()

    # Step 1: 爬取
    print("【步骤1/4】网页爬取与MD转换")
    print("-" * 40)
    crawl_data = run_crawl(config_path)

    if not crawl_data:
        print("[ERROR] 爬取失败，流程终止")
        return

    print_separator()

    # Step 2: MD预览
    print("【步骤2/4】MD文件预览")
    print("-" * 40)
    for item in crawl_data:
        print(f"\n📄 文件: {item['md_file_name']}")
        print(f"🔗 URL: {item['url']}")
        print(f"📝 标题: {item['title']}")
        # 预览前10行
        content_lines = item.get('md_content', '').split('\n')[:10]
        print("📋 内容预览:")
        for line in content_lines:
            print(f"   {line}")
        print("   ...")

    print_separator()

    # Step 3: 字段提取
    print("【步骤3/4】字段提取")
    print("-" * 40)
    extraction_data = run_extract(config_path, fields_path, crawl_data)

    if extraction_data:
        # 展示提取结果
        for ext in extraction_data:
            print(f"\n📊 任务 {ext['task_id']} 提取结果:")
            print(f"   主字段数: {ext['total_fields']}, 成功: {ext['success_fields']}")
            for mf in ext['main_fields']:
                value = mf['extraction']['value']
                vtype = mf['extraction']['value_type']
                conf = mf['extraction']['confidence']
                print(f"   ✦ {mf['main_field_name']}: {value} (类型: {vtype}, 置信度: {conf})")
                for sf in mf.get('sub_fields', []):
                    svalue = sf['extraction']['value']
                    stype = sf['extraction']['value_type']
                    print(f"     └ {sf['sub_field_name']}: {svalue} (类型: {stype})")

    print_separator()

    # Step 4: MongoDB存储
    print("【步骤4/4】MongoDB存储")
    print("-" * 40)
    success = run_store(config_path, crawl_data, extraction_data)

    if success:
        print("[SUCCESS] 数据已存储到MongoDB")
    else:
        print("[WARN] MongoDB存储失败，数据已保存到本地MD文件")

    print_separator()
    print("✅ 完整流程执行完毕!")


def preview_md(storage_path: str, filename: Optional[str] = None):
    """预览MD文件

    Args:
        storage_path: 存储路径
        filename: 文件名（如未指定则列出所有文件）
    """
    from .config import Config

    md_dir = Path(storage_path)

    if not filename:
        # 列出所有MD文件
        if not md_dir.exists():
            print(f"[ERROR] 存储目录不存在: {storage_path}")
            return

        md_files = list(md_dir.glob('*.md'))
        if not md_files:
            print("[INFO] 未找到MD文件")
            return

        print(f"\n📂 存储目录: {storage_path}")
        print(f"📄 MD文件列表 ({len(md_files)} 个):\n")

        for i, f in enumerate(md_files, 1):
            size = f.stat().st_size
            mtime = datetime.fromtimestamp(f.stat().st_mtime)
            print(f"  {i}. {f.name}")
            print(f"     大小: {size} 字节, 修改时间: {mtime.strftime('%Y-%m-%d %H:%M:%S')}")

        # 预览最新文件
        latest = max(md_files, key=lambda f: f.stat().st_mtime)
        print(f"\n📋 最新文件预览: {latest.name}")
        print("-" * 40)
        content = latest.read_text(encoding='utf-8')
        for line in content.split('\n')[:30]:
            print(f"  {line}")
        if len(content.split('\n')) > 30:
            print("  ...")

    else:
        file_path = md_dir / filename
        if not file_path.exists():
            print(f"[ERROR] 文件不存在: {filename}")
            return

        content = file_path.read_text(encoding='utf-8')
        print(f"\n📋 文件: {filename}")
        print("-" * 40)
        for line in content.split('\n')[:50]:
            print(f"  {line}")
        if len(content.split('\n')) > 50:
            print("  ...")


def show_db_stats(config_path: str):
    """显示数据库统计信息

    Args:
        config_path: 配置文件路径
    """
    from .config import Config
    from .mongo_store import MongoStore

    config = Config.from_yaml(config_path)

    store = MongoStore(
        uri=config.storage.mongodb.uri,
        database=config.storage.mongodb.database,
        collections=config.storage.mongodb.collections
    )

    if not store.is_connected():
        print("[ERROR] MongoDB未连接")
        store.close()
        return

    stats = store.get_statistics()

    print("\n📊 MongoDB 统计信息")
    print("-" * 40)
    print(f"  爬取任务数: {stats.get('crawl_tasks_count', 0)}")
    print(f"  主字段数:   {stats.get('main_fields_count', 0)}")
    print(f"  子字段数:   {stats.get('sub_fields_count', 0)}")

    latest = stats.get('latest_task')
    if latest:
        print(f"\n  最新任务:")
        print(f"    任务ID: {latest.get('task_id')}")
        print(f"    URL: {latest.get('url')}")
        print(f"    爬取时间: {latest.get('crawl_time')}")
        print(f"    状态: {latest.get('status')}")

    store.close()


def show_db_tasks(config_path: str, limit: int = 10):
    """显示数据库中的任务列表

    Args:
        config_path: 配置文件路径
        limit: 显示数量
    """
    from .config import Config
    from .mongo_store import MongoStore

    config = Config.from_yaml(config_path)

    store = MongoStore(
        uri=config.storage.mongodb.uri,
        database=config.storage.mongodb.database,
        collections=config.storage.mongodb.collections
    )

    if not store.is_connected():
        print("[ERROR] MongoDB未连接")
        store.close()
        return

    tasks = store.list_all_tasks(limit=limit)

    print(f"\n📋 爬取任务列表 (最近 {len(tasks)} 个)")
    print("-" * 60)

    for i, task in enumerate(tasks, 1):
        print(f"\n  {i}. 任务ID: {task.get('task_id')}")
        print(f"     URL: {task.get('url')}")
        print(f"     域名: {task.get('domain')}")
        print(f"     标题: {task.get('title')}")
        print(f"     状态: {task.get('status')}")
        print(f"     爬取时间: {task.get('crawl_time')}")

        # 显示关联字段
        task_id = task.get('task_id')
        main_fields = store.get_main_fields_by_task(task_id)
        if main_fields:
            print(f"     主字段 ({len(main_fields)} 个):")
            for mf in main_fields:
                value = mf.get('extracted_value', '')
                vtype = mf.get('value_type', '')
                print(f"       ✦ {mf.get('name')}: {value} ({vtype})")

    store.close()