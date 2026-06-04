# 智能爬虫与数据提取平台 - PRD文档

## 一、项目概述

### 1.1 项目名称
智能爬虫与数据提取平台 (renhonglin)

### 1.2 项目目标
开发一个通用爬虫+数据提取工具，支持：
- 网页可视化配置与爬取
- MD格式转换与预览
- 自定义字段智能提取（基于AI模型）
- MongoDB数据存储与查看

### 1.3 技术栈
- **前端**: Next.js 16 + React 19 + TypeScript + shadcn/ui + Tailwind CSS 4
- **状态管理**: Zustand
- **后端**: Next.js API Routes
- **数据库**: MongoDB (通过Prisma ORM)
- **AI服务**: NewAPI (gpt-oss-120b模型)

---

## 二、核心功能模块

### 2.1 爬虫模块 (已完成)

#### 功能要求
- 支持自定义爬取网址（单个/多个）
- 完整爬取网页核心内容后，精准转换为MD格式存储
- 处理反爬机制（请求头配置、请求间隔）
- 支持网页编码自动识别

#### MD转换要求
- 保留网页层级结构（标题 ##/###、列表、表格等）
- 过滤广告/无关链接/重复内容
- 文件命名规范：`{任务ID}_{网址域名}_{爬取时间}.md`

#### 已实现
- `services/crawlService.ts`: 爬虫核心服务
- `app/api/crawl/route.ts`: 爬虫API接口
- `app/dashboard/crawler/page.tsx`: 爬虫工作台页面

---

### 2.2 字段提取模块 (已完成)

#### 功能要求
- 支持用户自定义主字段、子字段
- 每个字段可填写字段解释（语义描述）
- 调用NewAPI模型进行智能提取
- 输出整洁的JSON/BSON结构化数据

#### 配置项
- API地址: `https://newapi.dev.azshentong.com/v1`
- 模型: `gpt-oss-120b`
- 超时时间、重试次数可配置

#### 已实现
- `services/extractionService.ts`: AI字段提取服务
- `app/api/fields/route.ts`: 字段配置与提取API
- `app/dashboard/field-config/page.tsx`: 字段配置页面

---

### 2.3 MongoDB存储模块 (已完成)

#### 表结构设计

| 表名 | 核心字段 |
|------|----------|
| `crawl_tasks` | 任务ID、网址、爬取时间、MD文件存储路径、MD文件名称、MD内容、状态、日志 |
| `main_fields` | 主字段ID、名称、描述、所属任务ID、来源MD位置 |
| `sub_fields` | 子字段ID、名称、描述、提取值、所属主字段ID、所属任务ID、来源MD位置、值类型 |

#### 数据类型标注
- text (文本)
- number (数字)
- time (时间)
- array (数组)

#### 已实现
- `lib/db/crawlDataManager.ts`: 数据访问层
- `app/api/data/route.ts`: 数据查看API
- `app/dashboard/data-view/page.tsx`: 数据存储查看页面

---

## 三、前端页面结构

### 3.1 首页/工作台 (`/dashboard/crawler`)
- 任务ID自动生成（显示不可编辑）
- 网址输入框：支持单行/多行输入
- 开始爬取按钮 + 实时日志输出区
- 最近任务列表快捷入口

### 3.2 MD内容预览页 (`/dashboard/md-preview`)
- MD原文展示区
- MD渲染预览区
- 文件信息卡片：任务ID、域名、爬取时间、存储路径
- 下载MD文件按钮
- 跳转"字段提取"按钮

### 3.3 字段配置与提取页 (`/dashboard/field-config`)
- 关联任务选择（下拉选择已完成爬取的任务）
- 字段配置区：添加主字段、添加子字段、删除、清空、保存
- AI提取参数配置区（可折叠）
- 开始提取按钮
- 提取结果展示区（JSON格式）

### 3.4 数据存储查看页 (`/dashboard/data-view`)
- 三个标签页对应三张表
- 表格展示数据，支持按任务ID搜索
- 查看关联关系（主字段↔子字段）
- 数据类型标注

---

## 四、API接口设计

### 4.1 爬虫API (`/api/crawl`)
| 方法 | 功能 |
|------|------|
| POST | 创建爬取任务 |
| GET | 获取任务列表/单个任务详情 |
| DELETE | 删除任务 |

### 4.2 字段API (`/api/fields`)
| 方法 | 功能 |
|------|------|
| POST | 创建字段配置 / 执行AI提取(action=extract) |
| GET | 获取字段配置 |
| DELETE | 删除字段配置 |

### 4.3 数据查看API (`/api/data`)
| 方法 | 功能 |
|------|------|
| GET | 查看MongoDB数据（tasks/mainFields/subFields/relations） |

---

## 五、配置化设计

### 5.1 环境变量配置
```env
DATABASE_URL="mongodb://mongo-service.gms:27017/mianshizuoye"
PROJECT_TABLE_PREFIX="renhonglin"
NEWAPI_BASE_URL="https://newapi.dev.azshentong.com/v1"
NEWAPI_API_KEY="sk-s7U79khywzqVC6CDBAu52Pnqn3UzN56YXwB9h3kYhFDawn7I"
NEWAPI_MODEL="gpt-oss-120b"
```

### 5.2 前端可配置项
- 爬取网址
- 字段规则（名称、解释）
- AI提取参数（API地址、超时、重试次数）

---

## 六、验证流程

完整流程：爬取 → MD转换 → 字段提取 → MongoDB存储

测试网址示例：
- 百科类：百度百科条目（结构化信息提取）
- 新闻类：新闻门户文章页（标题/正文/时间提取）
- 电商类：商品详情页（价格/规格/评价提取）

---

## 七、部署信息

- 远程仓库：`https://git.dev.azshentong.com/shentong/quiz-projects/renhonglin`
- 部署地址：`https://renhonglin.azgpu05.azshentong.com/`
- 首次提交需加入 `[vendor]` 触发镜像构建

---

## 八、已完成内容清单

### 数据库层
- [x] Prisma Schema模板定义（三张表）
- [x] 数据访问层 DataManager

### API层
- [x] 爬虫API（创建任务、获取列表、删除）
- [x] 字段配置API（创建、获取、删除、AI提取）
- [x] 数据查看API（三张表+关联关系）

### 前端层
- [x] 爬虫工作台页面
- [x] MD预览页面
- [x] 字段配置与提取页面
- [x] 数据存储查看页面

### 服务层
- [x] 爬虫服务（HTML解析、MD转换）
- [x] AI字段提取服务（NewAPI调用）

### 构建
- [x] 项目构建成功

---

**请确认此PRD是否符合您的需求理解？如有偏差请指出。**