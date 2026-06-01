"""
zhuwen_crawler 入口点

使用方式:
  python -m zhuwen_crawler run          # 完整流程
  python -m zhuwen_crawler crawl        # 仅爬取
  python -m zhuwen_crawler extract      # 仅提取
  python -m zhuwen_crawler preview      # 预览MD文件
  python -m zhuwen_crawler db-stats     # 查看数据库统计
  python -m zhuwen_crawler db-tasks     # 查看任务列表
"""

import sys
import os


def main():
    """CLI主入口"""
    # 默认配置路径
    config_path = os.environ.get('CRAWLER_CONFIG', 'config.yaml')
    fields_path = os.environ.get('CRAWLER_FIELDS', 'fields.yaml')

    # 查找配置文件（从当前目录或包目录）
    if not os.path.exists(config_path):
        package_dir = os.path.dirname(os.path.abspath(__file__))
        parent_config = os.path.join(os.path.dirname(package_dir), 'config.yaml')
        if os.path.exists(parent_config):
            config_path = parent_config

    if not os.path.exists(fields_path):
        package_dir = os.path.dirname(os.path.abspath(__file__))
        parent_fields = os.path.join(os.path.dirname(package_dir), 'fields.yaml')
        if os.path.exists(parent_fields):
            fields_path = parent_fields

    # 解析命令
    if len(sys.argv) < 2:
        print("用法: python -m zhuwen_crawler <command>")
        print("\n可用命令:")
        print("  run          执行完整流程（爬取→MD转换→字段提取→MongoDB存储）")
        print("  crawl        仅执行网页爬取和MD转换")
        print("  extract      仅执行字段提取（基于已有MD文件）")
        print("  preview      预览已生成的MD文件")
        print("  db-stats     查看MongoDB统计信息")
        print("  db-tasks     查看MongoDB中的任务列表")
        print("\n环境变量:")
        print("  CRAWLER_CONFIG   配置文件路径（默认: config.yaml）")
        print("  CRAWLER_FIELDS   字段配置路径（默认: fields.yaml）")
        print("  MONGODB_URI      MongoDB连接URI")
        print("  AI_API_KEY       AI提取API密钥")
        sys.exit(1)

    command = sys.argv[1]

    from .cli import (
        run_full_pipeline, run_crawl, run_extract, run_store,
        preview_md, show_db_stats, show_db_tasks
    )

    if command == 'run':
        # 完整流程
        run_full_pipeline(config_path, fields_path)

    elif command == 'crawl':
        # 仅爬取
        from .cli import print_banner, print_separator
        print_banner()
        print("▶ 模式: 仅爬取与MD转换")
        print_separator()
        output_dir = sys.argv[2] if len(sys.argv) > 2 else None
        results = run_crawl(config_path, output_dir)
        if results:
            print(f"\n✅ 爬取完成! 共 {len(results)} 个MD文件已保存")

    elif command == 'extract':
        # 仅提取
        from .cli import print_banner, print_separator
        print_banner()
        print("▶ 模式: 仅字段提取")
        print_separator()

        # 需要先有MD文件
        from .config import Config
        config = Config.from_yaml(config_path)
        storage_path = config.storage.md_storage_path

        # 读取所有MD文件
        from pathlib import Path
        md_dir = Path(storage_path)
        if not md_dir.exists():
            print(f"[ERROR] MD存储目录不存在: {storage_path}")
            print("[提示] 请先运行 'python -m zhuwen_crawler crawl' 生成MD文件")
            sys.exit(1)

        crawl_data = []
        for md_file in md_dir.glob('*.md'):
            content = md_file.read_text(encoding='utf-8')
            # 从文件名提取信息
            filename = md_file.name
            parts = filename.replace('.md', '').split('_')
            task_id = parts[0] + '_' + parts[1] + '_' + parts[2] + '_' + parts[3] if len(parts) >= 4 else 'unknown'

            crawl_data.append({
                'task_id': task_id,
                'url': '',
                'domain': parts[4] if len(parts) > 4 else 'unknown',
                'md_file_path': str(md_file),
                'md_file_name': filename,
                'md_content': content,
                'crawl_time': '',
                'encoding': 'utf-8',
                'title': ''
            })

        if not crawl_data:
            print("[ERROR] 未找到MD文件")
            sys.exit(1)

        results = run_extract(config_path, fields_path, crawl_data)
        if results:
            print(f"\n✅ 提取完成!")

    elif command == 'preview':
        # 预览MD文件
        from .config import Config
        config = Config.from_yaml(config_path)
        storage_path = config.storage.md_storage_path
        filename = sys.argv[2] if len(sys.argv) > 2 else None
        preview_md(storage_path, filename)

    elif command == 'db-stats':
        # 数据库统计
        show_db_stats(config_path)

    elif command == 'db-tasks':
        # 任务列表
        limit = int(sys.argv[2]) if len(sys.argv) > 2 else 10
        show_db_tasks(config_path, limit)

    else:
        print(f"未知命令: {command}")
        print("可用命令: run, crawl, extract, preview, db-stats, db-tasks")
        sys.exit(1)


if __name__ == '__main__':
    main()