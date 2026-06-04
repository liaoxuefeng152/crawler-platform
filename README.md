# 深瞳AI Coding

> 基于 Claude Code 的智能 AI 编码助手平台，提供完整的 AI 辅助开发工作流和标准化开发流程。

**技术栈**: Next.js 16 | React 19 | TypeScript | Tailwind CSS 4 | shadcn/ui | Prisma + MongoDB | Claude Code + MCP

---

## 版本更新对比

### 业务功能

| 功能 | v1 | v2 |
|------|----|----|
| 登录方式 | 用户名/密码、手机验证码 | ✨ **飞书 OAuth2 登录**、用户名/密码 |
| 用户体系 | 无角色区分 | ✨ **用户角色体系**（user/admin/super_admin） |
| 数据存储 | JSON 文件存储 | ✨ **Prisma + MongoDB** 生产级存储 |
| 数据隔离 | 无 | ✨ **表名前缀系统**（多项目共用数据库） |

### UI/UX 设计

| 功能 | v1 | v2 |
|------|----|----|
| 浅色模式 | 蓝白商务风格 | 蓝白商务风格（保持不变） |
| 深色模式 | 纯黑 + 白色强调 | ✨ **深蓝灰科技感 + 浅蓝强调** `#89ceff` |
| 科技装饰 | 不支持 | ✨ **浅蓝网格 + 浮动粒子 + 发光阴影** |
| 表面层级 | 无 | ✨ **五级表面层次**（`#070d1f` ~ `#2e3447`） |
| 标题字体 | Geist Sans | ✨ **Space Grotesk** 科技感标题 |

### AI 能力增强

| 能力 | v1 | v2 |
|------|----|----|
| Skills 数量 | ~20 个 | ✨ **40+ Skills**（完整技能生态） |
| 新增 Skills | - | ✨ az-init、auto-mode、claude-api、feishu-reader 等 |
| 知识库 | 无 | ✨ **superdoc 知识库**（React/Agent/Superdoc 文档） |
| 需求命令 | /require | ✨ /require + **/require-plan**（确认后执行） |
| Bug 命令 | /bug | ✨ /bug + **/bug-plan**（确认后执行） |
| 工作流协调 | WorkflowCoordinator | ✨ **Agent 隔离策略**（简单任务不隔离） |

### 工程规范

| 规范 | v1 | v2 |
|------|----|----|
| 强制规则 | 8 条 | ✨ **12 条强制规则** |
| 新增规则 | - | ✨ agents.md、config-management.md、database-design.md、tech-stack-awareness.md 等 |
| 开发流程 | POC 原则 | ✨ **全链路开发规范**（数据库 → API → 前端） |
| 第三方 API | 无限制 | ✨ **后端代理模式强制**（密钥安全） |

---

## 快速开始

```bash
/az-init
```

一键初始化开发环境，自动检查并配置：
- ✅ 项目依赖（npm install）
- ✅ 数据库连接（MongoDB）
- ✅ 表名前缀配置（多项目数据隔离）
- ✅ YOLO 模式（可选）

---

## 核心命令

| 命令 | 用途 | 工作流 |
|------|------|--------|
| `/az-init` | 环境初始化 | 一次性配置 |
| `/az-coding` | 9 阶段标准化工作流 | Plan → Clarify → Tasks → Dev → OpenAPI → Test → Verification → QA → Security Review |
| `/require` | 需求协调（直接执行） | 分析 → 执行 |
| `/require-plan` ✨ | 需求协调（确认后执行） | 分析 → 方案 → 确认 → 执行 |
| `/bug` | 错误修复（直接执行） | 分析 → 修复 |
| `/bug-plan` ✨ | 错误修复（确认后执行） | 分析 → 方案 → 确认 → 修复 |

---

## 技术架构

| 层级 | 技术 | 说明 |
|------|------|------|
| **框架** | Next.js 16 + React 19 | App Router + RSC |
| **语言** | TypeScript | 全链路类型安全 |
| **样式** | Tailwind CSS 4 | OKLCH 色彩空间 |
| **组件库** | shadcn/ui | New York 风格 |
| **状态管理** | Zustand | 轻量级持久化 |
| **HTTP 客户端** | Axios | 拦截器 + 统一错误处理 |
| **数据存储** | Prisma + MongoDB ✨ | 生产级持久化（v1: JSON 文件） |
| **AI 集成** | Claude Code + MCP | 40+ Skills + 知识库 |

---

## 专家协作系统

**7 位专业 Agent**（自动调用，无需手动指定）：

| Agent | 职责 |
|-------|------|
| `fullstack-requirement-expert` | 需求分析与用户旅途设计 |
| `architecture-planning-expert` | 架构规划与任务拆解 |
| `backend-expert` | API 开发与数据库设计 |
| `frontend-expert` | React/Next.js 组件开发 |
| `test-expert` | 测试代码编写（E2E + 单元测试） |
| `qa-expert` | 质量检查与构建验证 |
| `security-reviewer` | 安全审查与漏洞检测 |

**协作模式**：
- 直接协作（简单任务 < 4 小时）
- Workflow 协作（复杂项目 ≥ 4 小时，使用 `/az-coding`）

---

## .claude 目录结构

### 📋 rules/ - 强制性规则（12 条）

自动加载的全局规则，定义项目开发的"宪法"：

| 规则文件 | 说明 |
|----------|------|
| agents.md ✨ | Agent 协作模式、调用标准、隔离策略 |
| coding-style.md | 依赖版本管理（稳定版本优先） |
| config-management.md ✨ | 配置管理规则（禁止敏感配置兜底） |
| database-design.md ✨ | 数据库命名规范（snake_case） |
| fullstack-development.md ✨ | 全链路开发规则（三层完整实现） |
| git-workflow.md | Git 工作流与合并规则 |
| hooks.md | MCP 工具集成 |
| patterns.md | 常见模式（日期时间、项目配置） |
| performance.md | React/Next.js 性能优化规范 |
| security.md | Git 权限控制 + 第三方 API 代理 |
| tech-stack-awareness.md ✨ | 项目类型自动检测与技术栈适配 |
| testing.md | 测试质量要求（功能闭环、返工机制） |
| tool-selection.md ✨ | 工具选型验证规则 |

### 🔧 commands/ - 用户命令

| 命令文件 | 说明 |
|----------|------|
| az-init.md | 环境初始化 |
| az-coding.md | 9 阶段工作流 |
| require.md | 需求协调 |
| require-plan.md ✨ | 需求协调（确认后执行） |
| bug.md | 错误修复 |
| bug-plan.md ✨ | 错误修复（确认后执行） |

### 🎓 skills/ - 技能库（40+）

**分类**：前端开发 | 后端开发 | 工作流管理 | 测试与质量 | 文档生成 | 组件库 | 其他

**v2 新增 Skills**：az-init ✨、auto-mode ✨、claude-api ✨、feishu-reader ✨

### 📚 docs/ - 详细文档

| 核心文档 | 说明 |
|----------|------|
| THEME.md ✨ | 设计风格指南（v2 深蓝灰科技感） |
| DATABASE_TABLE_PREFIX_MIGRATION.md ✨ | 表名前缀系统 |
| api-development-standards.md | API 开发规范 |

### 🧠 knowledge/ - 知识库 ✨

| 知识库 | 说明 |
|--------|------|
| superdoc/ | React/Agent/Superdoc 完整文档 |
| llms.txt | LLM 优化文档索引 |

---

## 开发文档

**[CLAUDE.md](./CLAUDE.md)** - 项目开发的唯一文档导航入口

---

## 许可证

本项目采用 MIT 许可证。

---

> ✨ = v2 新增/变更