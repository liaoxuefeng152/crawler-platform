# 🎯 Claude Code 项目开发指南

**CLAUDE.md 是项目开发的唯一文档入口，为您提供完整的项目背景和开发指导。**

**文档归档根路径: `./.claude/docs/`**

---

## 📋 项目核心信息

### 🏷️ 项目标识

- **项目名称**: 深瞳AI Coding
- **项目类型**: AI辅助开发平台 - 生产级功能开发
- **技术栈**: Next.js 16 + React 19 + TypeScript + shadcn/ui + Tailwind CSS 4
- **状态管理**: Zustand（轻量级持久化状态）
- **HTTP客户端**: Axios（拦截器 + 统一错误处理）
- **数据存储**: Prisma + MongoDB（生产级存储）
- **AI集成**: Claude Code + MCP (Model Context Protocol)

### 🎯 核心定位

- **核心理念**: AI辅助开发，人类战略决策
- **设计理念**: 组件化、主题化、可维护性
- **开发模式**: 功能完整开发 - 注重功能完整性、质量保证
- **协作模式**: 人类(战略决策) → Claude Code(战术执行) → 人类(质量把控)

### 🏗️ 项目架构原则

**数据层:**

- Prisma ORM + MongoDB数据库（生产级存储）
- 多环境数据隔离（开发/测试/生产）
- **表名前缀系统** - 多项目共用数据库时自动添加项目前缀（`PROJECT_TABLE_PREFIX`）

**状态层:**

- Zustand 全局状态
- 轻量级持久化（localStorage）

**API层:**

- Next.js API Routes
- Axios 拦截器统一错误处理

**UI层:**

- shadcn/ui 组件库
- Tailwind CSS 4 样式
- 主题化设计系统

### 🎯 功能完整开发原则

**必须实现**:

- ✅ **数据库存储** - 使用 Prisma + MongoDB
- ✅ **完整验证** - 前端基础校验 + 后端Zod Schema验证
- ✅ **功能闭环** - 每个功能必须有完整的用户旅途闭环
- ✅ **简单权限** - 基于用户ID的资源所有权检查

**权限设计原则**（简单为主）:

- ✅ **资源所有权检查** - 用户只能操作自己创建的资源
- ✅ **复用现有登录系统** - `useUserStore` + `/login`
- ✅ **后端userId验证** - 通过请求体或JWT获取用户标识
- ❌ **不需要复杂权限** - 无需RBAC、ACL等企业级权限

**禁止行为**:

- ❌ **重复开发登录系统** - 必须复用现有登录系统（`useUserStore` + `/login`）
- ❌ **只有UI不集成API** - 必须完整集成
- ❌ **只有代码不测试** - 必须通过测试验证
- ❌ **阻塞构建的类型错误** - 必须修复

---

## 🗺️ 文档导航地图

### 📍 快速定位指南

| 需求类型       | 立即访问                                                                      | 文件位置                    | 说明                         |
| -------------- | ----------------------------------------------------------------------------- | --------------------------- | ---------------------------- |
| 🎨 设计UI页面  | [THEME.md](./.claude/docs/THEME.md)                                           | `.claude/docs/THEME.md`     | 项目权威设计风格指南         |
| 🔧 开发新组件  | [组件开发指南](./.claude/docs/development/COMPONENT_DEVELOPMENT_CHECKLIST.md) | `.claude/docs/development/` | shadcn/ui组件开发流程        |
| 🗂️ 数据库开发  | [表名前缀系统](./.claude/docs/DATABASE_TABLE_PREFIX_MIGRATION.md)             | `.claude/docs/`             | 多项目数据隔离方案           |
| 🤖 使用MCP工具 | [MCP集成指南](./.claude/docs/claude/shadcn-mcp-guide.md)                      | `.claude/docs/claude/`      | MCP集成使用详细指南          |
| 💻 前端开发    | [frontend-expert](./.claude/agents/frontend-expert.md)                        | `.claude/agents/`           | React/Next.js/TypeScript专家 |
| 🏛️ 架构规划    | [架构规划专家](./.claude/agents/architecture-planning-expert.md)              | `.claude/agents/`           | 架构规划、需求拆解专家       |
| ⚙️ 后端开发    | [backend-expert](./.claude/agents/backend-expert.md)                          | `.claude/agents/`           | API设计、数据库架构专家      |
| 🧪 质量保证    | [qa-expert](./.claude/agents/qa-expert.md)                                    | `.claude/agents/`           | 测试策略、质量保证专家       |

### 🔍 智能问题快速定位

| 常见问题             | 解决方案                                           | 文档位置                                         |
| -------------------- | -------------------------------------------------- | ------------------------------------------------ |
| "我应该用什么颜色？" | 使用主题变量 `--color-primary`                     | THEME.md#配色方案                                |
| "标准间距是多少？"   | 使用 `gap-4` (16px)                                | THEME.md#间距系统                                |
| "如何开发新组件？"   | 遵循检查清单和模板                                 | COMPONENT_DEVELOPMENT_CHECKLIST.md               |
| "如何创建新数据表？" | 编辑 schema.template.prisma + 运行 generate:schema | DATABASE_TABLE_PREFIX_MIGRATION.md               |
| "如何查询现有组件？" | 使用MCP工具                                        | shadcn-mcp-guide.md                              |
| "如何管理工作流？"   | 使用workflow-manager技能 + 工作流协调器            | workflow-manager技能 + WorkflowCoordinator       |
| "前端问题找谁？"     | frontend-expert                                    | `.claude/agents/frontend-expert.md`              |
| "架构问题怎么处理？" | architecture-planning-expert                       | `.claude/agents/architecture-planning-expert.md` |
| "后端问题找谁？"     | backend-expert                                     | `.claude/agents/backend-expert.md`               |

---

## 🚨 强制性规则

**本项目中的所有 AI 交互，首先必须严格遵守项目根目录下 `.claude/rules/` 中定义的强制性规则。**

### 📋 强制性规则清单

这些规则在每个 agent 调用时自动加载，必须严格遵守：

- 📋 [Agent 协作与调用规则](./.claude/rules/agents.md) - Agent 协作模式、调用标准、工作流协调器
- 🔧 [依赖版本管理](./.claude/rules/coding-style.md) - 稳定版本优先、MCP工具选型规范
- 🔐 [Git权限与交互式确认](./.claude/rules/security.md) - Git 权限控制、操作前确认机制
- 🧪 [测试质量要求](./.claude/rules/testing.md) - 功能闭环、构建门槛、返工机制
- 📝 [Git工作流](./.claude/rules/git-workflow.md) - Git 原则、工作流协调器使用
- ⚡ [性能优化规范](./.claude/rules/performance.md) - React/Next.js 性能优化规范（强制）
- 🎨 [常见模式](./.claude/rules/patterns.md) - 日期时间格式、技术栈一致性、开发原则
- 🔗 [MCP工具集成](./.claude/rules/hooks.md) - MCP工具使用、开发工具集成

### 🎯 规则层次

```
第一层：.claude/rules/ (强制)
├── 全局强制规则
├── 每个 agent 自动加载
└── 不可违背的底线

第二层：CLAUDE.md (项目指南)
├── 项目核心信息（是什么）
├── 项目架构原则
├── 文档导航地图
└── 首先遵守 rules

第三层：.claude/docs/ (详细文档)
├── 设计系统文档
├── 开发指南文档
└── Agent 协作指南
```

---

## 🚀 功能开发快速开始

### 📋 开发前检查清单

- [ ] **阅读 THEME.md** - 了解设计风格要求
- [ ] **确认配色方案** - 使用主题变量避免硬编码
- [ ] **了解间距标准** - 默认使用 `gap-4`
- [ ] **检查现有组件** - 优先使用shadcn/ui组件库
- [ ] **确认数据方案** - 使用 Prisma + MongoDB，并通过 DataManager/数据访问层封装

### ⚡ 技术栈一致性

- ✅ **前端组件**: 优先使用shadcn/ui
- ✅ **状态管理**: 使用Zustand
- ✅ **数据存储**: 使用 Prisma + MongoDB + DataManager
- ✅ **API设计**: 使用Next.js API Routes
- ✅ **类型安全**: 全链路TypeScript

---

## 💡 快速参考

### 常用开发命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 代码格式化
npm run format

# 代码质量检查
npm run lint:fix
```

### 技术栈特性

- **Zustand**: 轻量级状态管理
- **Axios**: HTTP客户端，支持拦截器
- **Prisma数据**: MongoDB 持久化存储，DataManager 封装动态 CRUD
- **TypeScript**: 全链路类型安全
- **ESLint + Prettier**: 代码规范自动化

---

## 📚 分类文档指南

### 🎨 设计系统文档

- **[THEME.md](./.claude/docs/THEME.md)** - 项目UI/UX设计的唯一权威标准
  - 配色方案、字体排版、间距系统
  - 组件样式、阴影动画
  - 开发任何页面前的第一参考文档

### 🔧 开发指南文档

- **[依赖管理与工具选型指南](./.claude/docs/development/dependency-management.md)** ⭐ 依赖管理的必读文档
  - 推荐稳定版本清单
  - 常见依赖问题速查
  - MCP工具选型规范
  - 依赖安装标准流程

- **[API 开发规范](./.claude/docs/api-development-standards.md)** ⭐ API 开发的必读文档
  - 标准 Next.js API Routes 开发规范
  - Zod Schema 验证标准
  - JSDoc 注释规范（生成 OpenAPI 文档）
  - 完整的 API 路由模板和最佳实践

- **[组件开发检查清单](./.claude/docs/development/COMPONENT_DEVELOPMENT_CHECKLIST.md)**
  - shadcn/ui组件开发决策流程和标准
  - 开发新组件前的必读检查清单
  - MCP使用、组件评估、设计系统集成

- **[POC/功能开发指南](./.claude/docs/development/poc-development-guide.md)**
  - 功能完整开发的完整指南
  - Prisma + MongoDB 数据库存储
  - 简单权限系统设计原则

- **[模块开发模板](./.claude/docs/development/module-development-template.md)**
  - 基于当前技术栈的标准化开发流程
  - DataManager、API路由、Zustand Store模板
  - 前端组件开发示例

- **[Agent协作详细流程](./.claude/docs/development/agent-collaboration-guide.md)**
  - Agent协作机制和最佳实践
  - 直接协作 vs Workflow协作
  - 工作流详解

- **[日期时间处理规范](./.claude/docs/development/datetime-handling-guide.md)**
  - 统一的日期时间格式标准
  - 前后端格式转换工具
  - API验证Schema规范

- **[数据库表名前缀系统](./.claude/docs/DATABASE_TABLE_PREFIX_MIGRATION.md)** ⭐ 数据库开发的必读文档
  - 多项目数据隔离方案
  - 表名前缀自动添加机制
  - 新表开发流程（编辑 schema.template.prisma + 运行 generate:schema）
  - 防重复添加前缀的安全机制

### 🤖 Claude Code 集成文档

- **[shadcn MCP指南](./.claude/docs/claude/shadcn-mcp-guide.md)**
  - shadcn/ui MCP集成使用详细指南
  - MCP工具查询组件、添加组件、分析依赖

### 📁 专家代理配置

位于 `.claude/agents/` 目录：

- **[frontend-expert](./.claude/agents/frontend-expert.md)** - React/Next.js/TypeScript前端开发
- **[backend-expert](./.claude/agents/backend-expert.md)** - 后端API、数据库、服务器架构
- **[architecture-planning-expert](./.claude/agents/architecture-planning-expert.md)** - 架构规划、需求拆解、开发协调
- **[qa-expert](./.claude/agents/qa-expert.md)** - 测试策略、质量保证专家
- **[test-expert](./.claude/agents/test-expert.md)** - 测试代码编写、E2E测试专家

---

## 📊 文档维护指南

### 🔄 更新流程

- **设计风格更新** → `.claude/docs/THEME.md` → 更新CLAUDE.md引用
- **开发流程更新** → `.claude/docs/development/` → 同步更新MCP指南
- **Claude配置更新** → `.claude/` → 测试并更新文档

### 📈 质量保证

- ✅ **路径有效性** - 所有链接指向正确文件
- ✅ **内容一致性** - 文档间信息无冲突
- ✅ **版本同步** - 相关文档版本保持一致
- ✅ **用户体验** - 新用户能快速定位信息

---

**💡 记住**:

- 功能完整开发的核心是确保每个功能都有完整的用户旅途闭环
- 质量优先，每个功能必须经过完整测试验证
- Prisma + MongoDB 生产级存储，支持数据持久化和多环境隔离
- 遇到问题时，优先查阅本文档的导航指南

**🔗 项目入口**: [README.md](./README.md) | **开发指南**: 本文档 | **设计规范**: [THEME.md](./.claude/docs/THEME.md)
