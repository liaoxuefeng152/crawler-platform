# 网页爬虫与数据提取工具 - 设计文档

## 一、爬虫策略设计思路

### 1.1 整体架构

采用 **Python 服务端爬虫** 方案，基于 requests + BeautifulSoup 实现，主要优势：
- 纯Python实现，无需浏览器环境，资源占用低
- 支持同步批量爬取，适合中小规模数据采集
- 配置化设计，URL和参数均可通过YAML文件配置

### 1.2 反爬机制处理

| 策略 | 实现方式 | 配置位置 |
|------|---------|----------|
| 请求头伪装 | 配置完整 User-Agent、Accept 等 | `config.yaml` → `crawler.headers` |
| 请求间隔 | 可配置延迟（默认1秒） | `config.yaml` → `crawler.rate_limit_delay` |
| 超时控制 | 可配置超时（默认30秒） | `config.yaml` → `crawler.timeout` |
| 错误重试 | 可配置重试次数（默认3次） | `config.yaml` → `crawler.max_retries` |

### 1.3 编码自动识别

```
检测优先级：
1. HTTP Content-Type 中的 charset 参数
2. HTML meta 标签中的 charset 声明
3. chardet 库自动检测
4. 默认 UTF-8 编码
```

实现位置：[zhuwen_crawler/fetcher.py:_detect_encoding](zhuwen_crawler/fetcher.py)

### 1.4 内容提取策略

```
提取流程：
1. 原始 HTML → 过滤广告/脚本/样式（基于remove_selectors配置）
2. 查找主内容区域（基于main_content_selectors配置）
3. 提取核心 HTML → 转换 Markdown
4. 清理多余空行、无意义字符
```

---

## 二、MD 格式转换的实现逻辑

### 2.1 技术选型

使用 **BeautifulSoup** 进行HTML解析，手动实现转换规则，主要考虑：
- 避免依赖第三方库（如 markdownify）的表格转换问题
- 精确控制转换规则，支持自定义处理

### 2.2 转换规则配置

```yaml
markdown:
  heading_style: "atx"       # 使用 # 标题格式
  code_block_style: "fenced" # 使用 ``` 代码块
  bullet_list_marker: "-"    # 列表使用 - 符号
  add_metadata_header: true  # 添加元信息头部
```

### 2.3 自定义表格转换

由于标准转换器对表格支持有限，自定义转换规则：

```
HTML表格 → Markdown表格：
| 列1 | 列2 | 列3 |
|---|---|---|
| 数据 | 数据 | 数据 |
```

实现位置：[zhuwen_crawler/md_converter.py:_convert_table_to_markdown](zhuwen_crawler/md_converter.py)

### 2.4 内容过滤

根据 `config.yaml` 中的 `remove_selectors` 配置移除：
- script, style, iframe, noscript 等技术元素
- nav, sidebar, footer 等导航元素
- 广告相关元素（class包含ad、banner等）

### 2.5 文件存储规范

```
文件命名格式：{taskId}_{domain}_{timestamp}.md
示例：task_20260601_143052_ab12_baike_baidu_com_20260601143052.md

存储路径：storage/md/（可配置）
```

---

## 三、基于 MD 的字段提取规则设计逻辑

### 3.1 提取流程

```
完整流程：
1. 用户在 fields.yaml 配置主字段/子字段 + 字段解释
2. 规则提取器根据字段语义进行匹配
3. （可选）AI提取器进行智能语义提取
4. 解析结果并自动检测值类型
5. 存储到 MongoDB
```

### 3.2 字段配置设计

```yaml
main_fields:
  - id: "title"
    name: "标题"
    description: "网页的主标题，通常是页面最显著的标题文字"
    sub_fields:
      - id: "main_title"
        name: "主标题"
        description: "页面的主要标题文字，不含副标题"
```

关键设计：
- **字段解释语义化**：用户描述字段含义而非提取规则
- **规则自动匹配**：根据字段ID、名称、描述进行关键词匹配
- **AI智能提取**（可选）：调用大模型进行语义理解

### 3.3 值类型自动检测

```python
def detect_value_type(value: any) -> str:
    # 检测规则：
    # - null: 空值
    # - number: 数字类型或数字字符串
    # - time: 时间格式（YYYY-MM-DD, 中文日期等）
    # - array: 数组类型
    # - object: 对象类型
    # - text: 默认文本类型
```

实现位置：[zhuwen_crawler/extractor.py:detect_value_type](zhuwen_crawler/extractor.py)

### 3.4 双重提取策略

| 策略 | 适用场景 | 特点 |
|------|---------|------|
| 规则提取 | 标准字段（标题、日期、关键词） | 快速、无API依赖 |
| AI提取 | 复杂语义字段（摘要、特定业务字段） | 智能理解、需API配置 |

---

## 四、MongoDB 表结构设计思路

### 4.1 表设计概览

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ crawl_tasks │────<│ main_fields │────<│ sub_fields  │
│ (基础表)    │     │ (主字段表)  │     │ (子字段表)  │
└─────────────┘     └─────────────┘     └─────────────┘
      1                   N                   N
```

### 4.2 crawl_tasks（基础表）

| 字段 | 类型 | 说明 |
|------|------|------|
| task_id | String (unique) | 业务ID: task_YYYYMMDD_HHmmss_xxxx |
| url | String | 爬取URL |
| domain | String | 域名 |
| crawl_time | DateTime | 爬取时间 |
| md_file_path | String | MD文件路径 |
| md_file_name | String | MD文件名 |
| md_content | String (可选) | MD内容（可直接存储） |
| encoding | String | 编码类型 |
| title | String | 页面标题 |
| status | String | 任务状态 |
| created_at | DateTime | 创建时间 |
| updated_at | DateTime | 更新时间 |

### 4.3 main_fields（主字段表）

| 字段 | 类型 | 说明 |
|------|------|------|
| main_field_id | String (unique) | 业务ID: mf_taskId_xxxx |
| name | String | 字段名 |
| description | String | 字段语义描述 |
| task_id | String | 关联任务ID |
| extracted_value | Any | 提取结果 |
| value_type | String | 值类型 |
| confidence | Float | 提取置信度 |
| created_at | DateTime | 创建时间 |
| updated_at | DateTime | 更新时间 |

### 4.4 sub_fields（子字段表）

| 字段 | 类型 | 说明 |
|------|------|------|
| sub_field_id | String (unique) | 业务ID: sf_mainFieldId_xxxx |
| name | String | 子字段名 |
| description | String | 子字段语义描述 |
| main_field_id | String | 关联主字段ID |
| task_id | String | 关联任务ID（双重关联） |
| extracted_value | Any | 提取结果 |
| value_type | String | 值类型 |
| confidence | Float | 提取置信度 |
| created_at | DateTime | 创建时间 |
| updated_at | DateTime | 更新时间 |

### 4.5 索引设计

```python
# crawl_tasks 索引
- task_id (unique)
- url
- crawl_time (descending)

# main_fields 索引
- main_field_id (unique)
- task_id
- name

# sub_fields 索引
- sub_field_id (unique)
- main_field_id
- task_id
```

---

## 五、配置化设计

### 5.1 config.yaml - 爬虫配置

```yaml
urls:                          # 目标网址列表（可配置多个）
  - "https://example.com/page1"

crawler:                       # 爬虫策略
  headers:                     # 请求头配置
    User-Agent: "..."
  rate_limit_delay: 1.0        # 请求间隔
  timeout: 30                  # 超时时间
  max_retries: 3               # 重试次数
  main_content_selectors: []   # 内容选择器
  remove_selectors: []         # 移除元素选择器

storage:                       # 存储配置
  md_storage_path: "./storage/md"
  mongodb:
    uri: "mongodb://localhost:27017"
    database: "crawler_db"
```

### 5.2 fields.yaml - 字段配置

```yaml
main_fields:                   # 主字段列表
  - id: "title"
    name: "标题"
    description: "页面主标题"
    sub_fields: []             # 子字段列表
```

---

## 六、技术栈总结

| 层级 | 技术 | 说明 |
|------|------|------|
| CLI | Python + Click | 命令行接口 |
| 爬虫 | requests + BeautifulSoup | HTTP请求、HTML解析 |
| MD转换 | BeautifulSoup | 手动转换规则 |
| 字段提取 | 规则匹配 + AI（可选） | 双重提取策略 |
| 数据库 | MongoDB + PyMongo | 文档存储 |
| 配置 | YAML + dataclasses | 配置管理 |

---

## 七、验证流程

完整流程验证步骤：
1. 配置 `config.yaml` 设置目标URL
2. 配置 `fields.yaml` 设置提取字段
3. 运行 `python -m zhuwen_crawler run`
4. 检查 `storage/md/` 目录中的MD文件
5. 运行 `python -m zhuwen_crawler db-stats` 查看MongoDB数据

---

文档版本：v1.0
创建日期：2026-06-01
作者：Claude Code