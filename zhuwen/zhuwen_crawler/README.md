# zhuwen_crawler - 网页爬虫与数据提取工具

一个可配置的Python爬虫工具，支持网页爬取、Markdown转换、字段提取和MongoDB存储。

## 功能特点

- ✅ **可配置爬取**：URL、请求头、超时等参数均可通过YAML配置
- ✅ **MD格式转换**：HTML自动转换为结构化Markdown
- ✅ **字段智能提取**：支持规则匹配和AI语义提取
- ✅ **MongoDB存储**：完整的任务、主字段、子字段存储结构
- ✅ **CLI命令行**：便捷的命令行操作界面

## 快速开始

### 1. 安装依赖

```bash
cd zhuwen_crawler
pip install -r requirements.txt
```

### 2. 配置爬取URL

编辑 `config.yaml`，添加目标网址：

```yaml
urls:
  - "https://baike.baidu.com/item/Python/405313"
```

### 3. 配置提取字段

编辑 `fields.yaml`，定义需要提取的字段：

```yaml
main_fields:
  - id: "title"
    name: "标题"
    description: "网页的主标题"
  - id: "content_summary"
    name: "内容摘要"
    description: "页面正文内容的摘要"
```

### 4. 运行完整流程

```bash
python -m zhuwen_crawler run
```

## CLI命令

```bash
# 完整流程（爬取→MD转换→字段提取→MongoDB存储）
python -m zhuwen_crawler run

# 仅爬取与MD转换
python -m zhuwen_crawler crawl

# 仅字段提取（基于已有MD文件）
python -m zhuwen_crawler extract

# 预览MD文件
python -m zhuwen_crawler preview

# 查看MongoDB统计
python -m zhuwen_crawler db-stats

# 查看任务列表
python -m zhuwen_crawler db-tasks
```

## 配置文件说明

### config.yaml - 爬虫配置

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| urls | 目标网址列表 | [] |
| crawler.headers | 请求头配置 | 模拟浏览器 |
| crawler.rate_limit_delay | 请求间隔(秒) | 1.0 |
| crawler.timeout | 超时时间(秒) | 30 |
| crawler.max_retries | 最大重试次数 | 3 |
| storage.md_storage_path | MD文件存储路径 | ./storage/md |
| storage.mongodb.uri | MongoDB连接URI | mongodb://localhost:27017 |

### fields.yaml - 字段配置

| 配置项 | 说明 |
|--------|------|
| main_fields.id | 字段唯一标识 |
| main_fields.name | 字段显示名称 |
| main_fields.description | 字段语义描述（用于提取） |
| main_fields.sub_fields | 子字段列表 |

## 项目结构

```
zhuwen_crawler/
├── config.yaml          # 爬虫配置
├── fields.yaml          # 字段配置
├── requirements.txt     # 依赖包
├── DESIGN.md            # 设计文档
├── README.md            # 使用说明
└ zhuwen_crawler/        # 主包
│   ├── __init__.py
│   ├── __main__.py      # CLI入口
│   ├── cli.py           # CLI命令
│   ├── config.py        # 配置加载
│   ├── fetcher.py       # 爬虫模块
│   ├── md_converter.py  # MD转换
│   ├── extractor.py     # 字段提取
│   ├── mongo_store.py   # MongoDB存储
│   ├── schemas.py       # 数据模型
│   └ utils.py           # 工具函数
└ storage/               # 存储目录
    └ md/                # MD文件
```

## MongoDB表结构

### crawl_tasks（爬取任务表）
- task_id: 业务ID
- url: 爬取URL
- domain: 域名
- crawl_time: 爬取时间
- md_file_path: MD文件路径
- title: 页面标题

### main_fields（主字段表）
- main_field_id: 主字段ID
- name: 字段名
- description: 字段描述
- task_id: 关联任务ID
- extracted_value: 提取值
- value_type: 值类型

### sub_fields（子字段表）
- sub_field_id: 子字段ID
- main_field_id: 关联主字段ID
- task_id: 关联任务ID
- extracted_value: 提取值

## 环境变量

| 变量 | 说明 |
|------|------|
| MONGODB_URI | MongoDB连接URI（覆盖配置） |
| AI_API_KEY | AI提取API密钥 |
| CRAWLER_CONFIG | 配置文件路径 |
| CRAWLER_FIELDS | 字段配置路径 |

## 示例验证

完整流程验证（以百度百科为例）：

1. 配置URL：
```yaml
urls:
  - "https://baike.baidu.com/item/Python/405313"
```

2. 运行爬取：
```bash
python -m zhuwen_crawler run
```

3. 查看结果：
```bash
# 预览MD文件
python -m zhuwen_crawler preview

# 查看MongoDB数据
python -m zhuwen_crawler db-stats
python -m zhuwen_crawler db-tasks
```

## 注意事项

- MongoDB需要提前安装并启动
- AI提取功能需要配置API密钥（可选）
- 请遵守目标网站的robots.txt规则

## 许可证

MIT License