# 设计说明

## 1. 爬虫策略设计思路

- 抓取层采用 HTTP 请求器（requests）并支持自定义请求头、请求间隔和重试次数。
- 反爬识别采用状态码过滤（403、429）和内容关键字检测（"访问异常"、"请完成下方验证"、"滑动"、"验证码"、"扫码验证"）。
- 若检测到反爬，立即中断并提示人工介入；这避免在未经授权情况下盲目绕过滑块/扫码验证。
- 后续可扩展为“浏览器式抓取插件”，即引入 Playwright/Headless Chromium 来完成页面渲染并携带人工验证后的 session cookies。

## 2. MD 格式转换的实现逻辑

- 使用 BeautifulSoup 解析 HTML 并抽取页面标题、摘要、基本信息框（infobox）与主要内容块。
- 使用 markdownify 将主要内容区域转换为 Markdown，保持标题层级、段落、列表、表格等结构。
- 对页面摘要与标题进行预置，生成符合“标题+摘要+正文”结构的 Markdown 文件。
- 输出文件名采用 `{task_id}_{域名}_{YYYYMMDDHHMMSS}.md` 规范，保证唯一且可追踪。
- 同时保留源 Markdown 文本于 MongoDB 任务文档字段，实现“本地存储 + 文本双存储”。

## 3. 基于 MD 的字段提取规则设计逻辑

- 抽取逻辑采用“规则优先 + 模型回退”的策略：
  - 规则引擎先根据字段类型提示实行简单正则匹配，例如价格、日期、字段名后缀的值抽取。
  - 若规则结果置信度低，则调用 new-api 模型执行语义提取。
- new-api 交互体现在 `extractor.py` 中，将 Markdown 文本和字段定义发送给模型，并要求返回严格 JSON 结果。
- 输出结构包含：`value`、`value_type`、`value_normalized`、`source_snippet`、`location`、`confidence`。
- 同时支持用户自定义字段：主字段与子字段可以通过配置文件或额外 YAML 文件定义。

## 4. MongoDB 表结构设计思路

### 4.1 任务表 `tasks`

- `task_id`：任务唯一标识
- `source_url`：目标网页
- `crawled_at`：抓取时间
- `md_path`：本地 Markdown 存储路径
- `md_filename`：Markdown 文件名
- `md_text`：Markdown 原文备份
- `metadata`：页面标题、摘要、infobox 等元数据

### 4.2 主字段表 `main_fields`

- `main_field_id`：主字段唯一 ID
- `task_id`：所属任务
- `name`：字段名称
- `description`：字段解释
- `md_location`：来源 MD 位置或标题路径

### 4.3 子字段表 `sub_fields`

- `sub_field_id`：子字段唯一 ID
- `task_id`：所属任务
- `main_field_id`：所属主字段 ID
- `name`：字段名称
- `description`：字段解释
- `extracted_value`：抽取结果
- `value_type`：自动适配类型（text/number/date/array 等）
- `source_snippet`：原文片段
- `md_location`：来源 MD 位置
- `confidence`：模型或规则置信度

### 4.4 关联与唯一性

- `sub_fields` 建立复合唯一索引 `{task_id, main_field_id, name}`，保障同一任务内字段不重复插入。
- `main_fields` 建索引 `{task_id, name}`，方便按任务查询。
- `tasks` 使用 `task_id` 唯一索引。

## 5. 可配置性与扩展性

- 所有可变逻辑写入 `config.yaml`，包括 MongoDB 连接、new-api 调用参数、爬虫间隔、输出目录、字段定义等。
- 支持外部字段 YAML 文件，用户新增字段无需修改核心代码。
- 组件化设计：抓取模块、MD 转换模块、提取模块、Mongo 存储模块松耦合，便于后续扩展插件。
