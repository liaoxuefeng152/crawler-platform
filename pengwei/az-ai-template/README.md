# 深瞳AI Coding

基于 Claude Code 的智能 AI 编码助手平台，提供完整的 AI 辅助开发工作流和标准化开发流程。


## 快速开始

```bash
/az-init
```

一键初始化开发环境，自动检查并配置：
- 项目依赖（npm install）
- YOLO 模式（可选）
- claude-hud 插件（推荐）

## 核心命令

### `/az-init` - 环境初始化

一键式开发环境初始化命令，自动检查并配置所有必要的开发工具和插件。

**检查项目：**
- ✅ 项目依赖安装状态
- ⚠️ YOLO 模式配置（可选）
- ⭐ claude-hud 插件（推荐）

**使用示例：**
```bash
/az-init
```

### `/az-coding` - 标准化工作流

启动 9 阶段质量驱动开发流程，确保 100% 用户旅途闭环和完整测试覆盖率。

**9 阶段工作流：**
```
Plan → Clarify → Tasks → Dev → OpenAPI → Test → Verification → QA → Security Review
```

**核心特性：**
- 🎯 用户旅途闭环率 = 100%
- 🚨 P0 强制验证（构建/启动/功能可访问性）
- 🔄 串行开发（后端 → OpenAPI → 测试 → 前端）
- 📊 完整测试覆盖率（核心 ≥ 60%，整体 ≥ 80%）

**使用示例：**
```bash
/az-coding 开发一个用户管理系统，包含增删改查功能
```

### `/bug` - 错误分析与修复

智能错误分析器，自动诊断并提供修复方案。

**支持模式：**
- 快速分析：`/bug <错误信息>`
- 自动化工作流：`/bug --workflow "<错误信息>"`

**使用示例：**
```bash
/bug TypeError: Cannot read property 'map' of undefined
```

### `/require` - 需求协调

需求分析与任务协调指挥官，自动安排对应专家完成开发。

**使用示例：**
```bash
/require 我需要增加一个用户评论功能，支持评论、回复和点赞
```

## 特色工作流

### 9 阶段标准化开发流程

**Plan** → 需求规划与用户旅途设计（预期闭环率 100%）

**Clarify** → 交互式需求澄清与 POC 原则合规性检查

**Tasks** → 任务拆解与 API 契约定义（spec-api.md）

**Dev** → 串行开发（后端 → OpenAPI → 前端，严格遵守 API 契约）

**OpenAPI** → 自动生成 OpenAPI 文档与 Swagger UI 验证

**Test** → 后端 Swagger 测试 + 前端 E2E 测试（禁止跨层读取）

**Verification** → 功能验证与测试覆盖率确认

**QA** → 质量审计（npm run build + npm run dev + 浏览器验证）

**Security Review** → 安全审查与漏洞检测

### 专家协作系统

**7 位专业 Agent：**
- `fullstack-requirement-expert` - 需求分析与用户旅途设计
- `architecture-planning-expert` - 架构规划与任务拆解
- `backend-expert` - API 开发与数据库设计
- `frontend-expert` - React/Next.js 组件开发
- `test-expert` - 测试代码编写（E2E + 单元测试）
- `qa-expert` - 质量检查与构建验证
- `security-reviewer` - 安全审查与漏洞检测

**协作模式：**
- 直接协作（简单任务，< 4 小时）
- Workflow 协作（复杂项目，≥ 4 小时，使用 `/az-coding`）

### 质量驱动机制

**强制验证：**
- ✅ npm run build 必须成功
- ✅ npm run dev 必须启动成功
- ✅ 浏览器访问必须正常
- ✅ 测试覆盖率必须达标

**返工机制：**
- Test 失败 → test-expert 统计问题 → 架构专家分析 → 创建修复任务 → 分配专家执行 → 重新测试
- QA 失败 → qa-expert 统计问题 → 架构专家分析 → 创建修复任务 → 分配专家执行 → 重新测试 → 重新 QA
- Security Review 失败 → security-reviewer 统计问题 → 架构专家分析 → 创建修复任务 → 分配专家执行 → 重新安全审查

**WorkflowCoordinator：**
- 实时跟踪工作流状态（`.az/workflow-state.json`）
- 自动继续下一阶段（防止工作流中断）
- 阻塞问题管理与解决

## .claude 目录结构

### 📋 rules/ - 强制性规则（自动加载）

每个 agent 调用时自动加载的全局规则，定义项目开发的"宪法"：

- `agents.md` - Agent 协作模式与调用规则
- `coding-style.md` - 依赖版本管理（稳定版本优先）
- `security.md` - Git 权限控制与交互式确认原则
- `testing.md` - 测试质量要求（功能闭环、返工机制）
- `git-workflow.md` - Git 工作流与协作原则
- `performance.md` - React/Next.js 性能优化规范（强制执行）
- `patterns.md` - 常见模式（日期时间格式、POC 原则）
- `hooks.md` - MCP 工具集成与开发工具

### 🤖 agents/ - 专业代理配置

7 位专业 Agent 的详细配置和能力说明：

- `fullstack-requirement-expert.md` - 需求分析与用户旅途设计专家
- `architecture-planning-expert.md` - 架构规划与任务拆解专家
- `backend-expert.md` - 后端开发与 API 设计专家
- `frontend-expert.md` - 前端开发与 React/Next.js 专家
- `test-expert.md` - 测试代码编写专家（E2E + 单元测试）
- `qa-expert.md` - 质量检查与构建验证专家
- `security-reviewer.md` - 安全审查与漏洞检测专家

### 🔧 commands/ - Claude Code 命令

用户可直接调用的命令：

- `az-init.md` - 环境初始化命令
- `az-coding.md` - 9 阶段标准化工作流命令
- `bug.md` - 错误分析与修复命令
- `require.md` - 需求协调命令
- `chinese.md` - 中文交互模式
- `learn.md` - 提取可重用模式命令
- `sys-check.md` - 系统检查命令

### 🎓 skills/ - 技能库（可复用能力）

**前端开发：**
- `frontend-patterns` - 前端开发模式与最佳实践
- `frontend-design` - 前端设计能力
- `react-best-practices` - React 性能优化规范（40+ 规则）

**后端开发：**
- `backend-patterns` - 后端架构模式与 API 设计

**工作流管理：**
- `workflow-manager` - 9 阶段工作流管理器（核心技能）
- `continuous-learning-v2` - 持续学习系统（基于本能的学习）
- `strategic-compact` - 策略压缩（在逻辑边界建议手动压缩）

**测试与质量：**
- `webapp-testing` - Web 应用测试技能
- `bug` - 错误分析与修复技能

**文档生成：**
- `generate-openapi-doc` - 自动生成 OpenAPI 文档
- `generate-e2e-tests` - 自动生成 E2E 测试
- `doc-coauthoring` - 文档协作编写

**组件库：**
- `component-library-guide` - 组件库开发指南
- `component-library/` - 可复用组件集合（表格、按钮、卡片等）

**其他技能：**
- `mcp-builder` - MCP 服务器构建器
- `skill-creator` - 技能创建器
- `system-optimizer` - 系统优化器
- `theme-factory` - 主题工厂
- `ui-ux-pro-max` - UI/UX 设计专家

### 📚 docs/ - 详细文档

**开发指南：**
- `THEME.md` - 项目权威设计风格指南（配色、间距、组件样式）
- `development/` - 完整开发规范（组件开发、POC 指南、依赖管理、日期时间处理等）
- `api-development-standards.md` - API 开发规范
- `next-swagger-doc-integration.md` - Swagger 文档集成指南

**Claude Code 集成：**
- `claude/git-permissions-config.md` - Git 权限控制配置
- `claude/shadcn-mcp-guide.md` - shadcn MCP 集成指南
- `claude/openapi-mcp-readme.md` - OpenAPI MCP 说明

**测试指南：**
- `references/frontend-e2e-testing-guide.md` - 前端 E2E 测试指南
- `references/backend-api-testing-guide.md` - 后端 API 测试指南
- `testing/` - 测试相关文档（错误分类、错误处理指南）

**参考资料：**
- `references/sequential-thinking-method.md` - 顺序思考方法
- `references/ralph-loop-execution-guide.md` - Ralph 循环执行指南

### ⚙️ hooks.json - Hooks 配置

自动化触发器配置：

- `userPromptSubmitHook` - 用户输入提交时触发（中文模式 + 技能注入）
- `PostToolUse` - 工具使用后触发（Prettier 格式化 + TypeScript 类型检查）

### 🔗 mcp.json - MCP 服务器配置

MCP (Model Context Protocol) 服务器配置，集成外部能力（如 shadcn UI 组件查询）。

### 🎨 templates/ - 模板文件

项目使用的模板文件（如 `login-seed.json` 登录数据种子文件）。

## 项目架构

### 技术栈

- **框架**: Next.js 16 + React 19
- **语言**: TypeScript
- **样式**: Tailwind CSS 4
- **组件库**: shadcn/ui (New York 风格)
- **状态管理**: Zustand（轻量级持久化）
- **HTTP 客户端**: Axios（拦截器 + 统一错误处理）
- **数据存储**: JSON 文件（开发/测试环境）
- **AI 集成**: Claude Code + MCP

### 架构原则

**数据层:** JSON 文件存储 + DataManager 统一管理 CRUD

**状态层:** Zustand 全局状态 + localStorage 持久化

**API 层:** Next.js API Routes + Axios 拦截器

**UI 层:** shadcn/ui 组件库 + Tailwind CSS 4 + 主题化设计系统

### POC 禁止项

- ❌ 无权限系统（POC 阶段不实现）
- ❌ 复杂验证（仅前端基础校验）
- ❌ 数据库（JSON 文件存储足够）
- ❌ 过度设计（功能优先）
- ❌ 重复开发登录系统（必须复用 `useUserStore` + `/login`）

## 开发文档

**[CLAUDE.md](./CLAUDE.md)** - 项目开发的唯一文档导航入口

包含完整的文档导航地图、强制性规则说明、POC 开发指南和快速参考。

## 许可证

本项目采用 MIT 许可证。
