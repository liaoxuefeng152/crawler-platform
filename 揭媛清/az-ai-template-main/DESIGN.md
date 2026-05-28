# 网页爬虫 + 智能数据提取工具设计说明

## 项目概述

本项目基于 Next.js 16 + React 19 + TypeScript + Prisma + MongoDB 技术栈，开发一个通用的网页爬虫和智能数据提取工具，支持网页爬取、MD格式转换、自定义字段提取和MongoDB存储。

---

## 一、爬虫策略设计思路

### 1.1 核心架构

爬虫模块采用分层架构设计：

```
用户输入 → URL解析 → 网页抓取 → HTML清洗 → MD转换 → 内容存储
```

### 1.2 关键设计

#### 反爬机制处理
- **请求头配置**：模拟真实浏览器 User-Agent，添加 Accept、Accept-Language 等标准请求头
- **请求间隔控制**：默认 500ms 间隔，避免频繁请求触发限流
- **重试机制**：最多 3 次重试，每次间隔 1 秒递增

#### 编码自动识别
- 优先从 HTTP Content-Type 头部检测 charset
- 其次从 HTML meta 标签检测编码声明
- 支持 UTF-8、GBK、GB2312 等常见中文编码

#### 内容清洗策略
- 移除 `<script>`、`<style>`、`<noscript>` 等非内容标签
- 移除 `<nav>`、`<footer>`、`<aside>` 等导航类元素
- 识别并移除广告、弹窗相关 class/id 元素
- 提取 `<main>`、`<article>` 等核心内容区域

---

## 二、MD 格式转换的实现逻辑

### 2.1 HTML → Markdown 转换流程

使用 Turndown 库进行转换，配合自定义规则：

#### 标准转换规则
- 标题 `<h1>` ~ `<h6>` → `#` ~ `######`
- 列表 `<ul>`、`<ol>` → `-` 列表标记
- 代码块 `<pre><code>` → fenced code block
- 链接 `<a href="">` → `[text](url)`
- 图片 `<img src="">` → `![alt](src)`

#### 表格特殊处理
自定义表格转换规则，保留表格结构：
```markdown
| 列1 | 列2 | 列3 |
| --- | --- | --- |
| 数据 | 数据 | 数据 |
```

#### 内容清理
- 合并连续空行（最多保留 2 个换行）
- 移除 Markdown 内嵌的图片链接（防止广告图片）
- 移除空链接标记

### 2.2 MD 文件命名规范

格式：`{任务ID}_{域名}_{时间}.md`

示例：`task_1234567_baidu_com_2026-05-28T10-30-00.md`

---

## 三、基于 MD 的字段提取规则设计逻辑

### 3.1 AI 提取架构

```
字段配置 → 提示词构建 → AI模型调用 → JSON解析 → 数据存储
```

### 3.2 提示词设计策略

#### 系统提示
- 定义角色为"专业数据提取助手"
- 强调输出必须是严格 JSON 格式
- 禁止添加推测内容

#### 用户提示结构
```
# Markdown内容:
{截取前8000字符的MD内容}

# 需要提取的字段:
1. 主字段 "{字段名}": {字段解释}
   子字段: - {子字段名}: {子字段解释}

# 输出要求:
返回 JSON 数组，包含字段名、提取值、值类型
```

### 3.3 值类型自动识别

根据提取结果自动判断类型：
- **number**：纯数字格式（含小数）
- **time**：符合日期时间格式（如 `2026-05-28`、`2026年5月28日`）
- **array**：包含分隔符（逗号）或 JSON 数组格式
- **text**：其他情况默认为文本

### 3.4 重试与超时机制

- 默认超时 60 秒
- 最大重试 3 次
- 每次重试间隔 2 秒

---

## 四、MongoDB 表结构设计思路

### 4.1 表结构设计

#### 基础任务表 (crawler_tasks)

| 字段 | 类型 | 说明 |
|------|------|------|
| taskId | String (unique) | 业务任务ID |
| urls | String (JSON) | 网址列表 |
| status | String | 任务状态 |
| logs | String (JSON) | 日志记录 |
| mdContent | String | MD内容（存储到MongoDB） |
| mdFileName | String | MD文件名 |
| mdFilePath | String | MD文件路径 |
| createdAt | DateTime | 创建时间 |
| completedAt | DateTime | 完成时间 |

#### 主字段表 (main_fields)

| 字段 | 类型 | 说明 |
|------|------|------|
| fieldId | String (unique) | 字段业务ID |
| name | String | 字段名称 |
| description | String | 字段解释 |
| taskId | String | 所属任务ID |
| mdPosition | String | 来源MD位置 |
| createdAt | DateTime | 创建时间 |

#### 子字段表 (sub_fields)

| 字段 | 类型 | 说明 |
|------|------|------|
| subFieldId | String (unique) | 子字段业务ID |
| name | String | 子字段名称 |
| description | String | 子字段解释 |
| value | String | 提取值 |
| valueType | String | 值类型 (text/number/time/array) |
| parentFieldId | String | 所属主字段ID |
| taskId | String | 所属任务ID |
| mdPosition | String | 来源MD位置 |
| createdAt | DateTime | 创建时间 |

### 4.2 关联关系

```
CrawlerTask (taskId) ←→ MainField (taskId) ←→ SubField (parentFieldId)
```

- 一个任务可以包含多个主字段
- 一个主字段可以包含多个子字段
- 子字段通过 `parentFieldId` 关联主字段
- 所有字段通过 `taskId` 关联原始任务

### 4.3 数据隔离策略

使用 Prisma 表名前缀系统，支持多项目共用数据库时的数据隔离：
- 表名格式：`{PROJECT_TABLE_PREFIX}-crawler_tasks`
- 自动生成，无需手动配置

---

## 五、技术栈说明

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | Next.js 16 (App Router) | 服务端渲染 + API Routes |
| UI组件 | shadcn/ui + Tailwind CSS 4 | 现代化组件库 |
| 状态管理 | Zustand | 轻量级全局状态 |
| 数据存储 | Prisma + MongoDB | ORM + 文档数据库 |
| HTTP客户端 | Axios | 请求拦截 + 错误处理 |
| 爬虫核心 | Cheerio + Turndown | HTML解析 + MD转换 |
| AI调用 | NewAPI (gpt-oss-120b) | 字段智能提取 |

---

## 六、API 接口设计

### 6.1 爬虫相关

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/crawl/start` | POST | 启动爬取任务 |
| `/api/crawl/status` | GET | 查询任务状态 |
| `/api/crawl/result` | GET | 获取爬取结果 |
| `/api/crawl/list` | GET | 获取任务列表 |

### 6.2 字段相关

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/fields/config` | POST/GET | 保存/获取字段配置 |
| `/api/fields/extract` | POST | 执行AI字段提取 |
| `/api/fields/list` | GET | 获取字段数据 |

### 6.3 数据查看

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/data/tasks` | GET | 查看任务数据 |
| `/api/data/main-fields` | GET | 查看主字段数据 |
| `/api/data/sub-fields` | GET | 查看子字段数据 |

---

## 七、前端页面结构

| 页面 | 路径 | 功能 |
|------|------|------|
| 工作台 | `/dashboard/crawler` | 任务创建、实时日志、任务列表 |
| MD预览 | `/dashboard/crawler/preview/[taskId]` | MD内容渲染预览 |
| 字段提取 | `/dashboard/crawler/extract/[taskId]` | 字段配置、AI提取 |
| 数据查看 | `/dashboard/crawler/data` | MongoDB数据展示 |

---

## 八、配置化设计

所有关键参数均支持前端配置：

- **爬取配置**：URL列表、请求间隔、超时时间
- **字段配置**：主/子字段名称、字段解释
- **AI配置**：API地址、模型选择、超时时间、重试次数
- **无硬编码**：所有配置从用户输入获取

---

**文档版本**: v1.0
**创建日期**: 2026-05-28
**作者**: Claude Code AI Assistant