# 📚 Claude Code 项目文档

本目录包含项目的完整文档体系，为 Claude Code 和 AI Agent 提供开发指导。

---

## 📋 文档导航

### 🎨 核心设计文档

| 文档 | 说明 | 适合人群 |
|------|------|---------|
| [THEME.md](./THEME.md) | 项目UI/UX设计权威标准 | 所有开发 |
| [SHARED-CONSTRAINTS.md](./SHARED-CONSTRAINTS.md) | Agent共享约束（POC原则、API契约优先） | 所有Agent |

### 📖 API 开发文档

| 文档 | 说明 | 适合人群 |
|------|------|---------|
| [api-development-standards.md](./api-development-standards.md) | Next.js API Routes 开发规范 | 后端开发 |
| [spec-api-standard.md](./spec-api-standard.md) | spec-api 标准文档 | 架构设计 |
| [next-swagger-doc-integration.md](./next-swagger-doc-integration.md) | Swagger UI 集成指南 | 后端开发 |
| [openapi-development-best-practices.md](./openapi-development-best-practices.md) | OpenAPI 最佳实践 | 后端开发 |

### 🔧 开发规范文档

| 文档 | 说明 | 适合人群 |
|------|------|---------|
| [agent-collaboration-guide.md](./development/agent-collaboration-guide.md) | Agent 协作机制 | 架构专家 |
| [COMPONENT_DEVELOPMENT_CHECKLIST.md](./development/COMPONENT_DEVELOPMENT_CHECKLIST.md) | shadcn/ui 组件开发清单 | 前端开发 |
| [datetime-handling-guide.md](./development/datetime-handling-guide.md) | 日期时间处理规范 | 所有开发 |
| [dependency-management.md](./development/dependency-management.md) | 依赖管理与工具选型 | 所有开发 |
| [module-development-template.md](./development/module-development-template.md) | 模块开发模板 | 所有开发 |
| [poc-development-guide.md](./development/poc-development-guide.md) | POC 开发详细指南 | 所有开发 |

### 🧪 测试文档

| 文档 | 说明 | 适合人群 |
|------|------|---------|
| [error-taxonomy.md](./testing/error-taxonomy.md) | 错误分类学 | 测试专家 |
| [nextjs-error-handling-guide.md](./testing/nextjs-error-handling-guide.md) | Next.js 错误处理指南 | 测试专家 |
| [nextjs-error-quick-reference.md](./testing/nextjs-error-quick-reference.md) | Next.js 错误快速参考 | 测试专家 |

### 📚 参考文档

| 文档 | 说明 | 适合人群 |
|------|------|---------|
| [sequential-thinking-method.md](./references/sequential-thinking-method.md) | 任务拆解方法论 | 架构专家 |
| [ralph-loop-execution-guide.md](./references/ralph-loop-execution-guide.md) | Ralph Loop 执行指南 | 架构/测试专家 |
| [backend-api-testing-guide.md](./references/backend-api-testing-guide.md) | 后端 API 测试指南 | 后端/测试专家 |
| [frontend-e2e-testing-guide.md](./references/frontend-e2e-testing-guide.md) | 前端 E2E 测试指南 | 前端/测试专家 |

### 🎯 测试模板

| 文档 | 说明 | 适合人群 |
|------|------|---------|
| [playwright-test-report-template.md](./templates/playwright-test-report-template.md) | Playwright 测试报告模板 | 测试专家 |
| [swagger-test-report-template.md](./templates/swagger-test-report-template.md) | Swagger 测试报告模板 | 测试专家 |

### 📦 后端开发文档

| 文档 | 说明 | 适合人群 |
|------|------|---------|
| [nextjs-prisma-best-practices.md](./backend/nextjs-prisma-best-practices.md) | Next.js Prisma 最佳实践 | 后端开发 |
| [typescript-advanced-guide.md](./backend/typescript-advanced-guide.md) | TypeScript 高级指南 | 后端开发 |
| [zod-validation-integration.md](./backend/zod-validation-integration.md) | Zod 验证集成 | 后端开发 |

### 🔌 MCP 集成文档

| 文档 | 说明 | 适合人群 |
|------|------|---------|
| [shadcn-mcp-guide.md](./claude/shadcn-mcp-guide.md) | shadcn/ui MCP 集成指南 | 所有开发 |
| [openapi-mcp-readme.md](./claude/openapi-mcp-readme.md) | OpenAPI MCP 说明 | 后端开发 |
| [git-permissions-config.md](./claude/git-permissions-config.md) | Git 权限配置说明 | 所有用户 |

---

## 🚀 快速开始

### 前端开发

1. 阅读 [THEME.md](./THEME.md) 了解设计规范
2. 查看 [COMPONENT_DEVELOPMENT_CHECKLIST.md](./development/COMPONENT_DEVELOPMENT_CHECKLIST.md) 了解组件开发流程
3. 参考 [frontend-e2e-testing-guide.md](./references/frontend-e2e-testing-guide.md) 编写测试

### 后端开发

1. 阅读 [api-development-standards.md](./api-development-standards.md) 了解 API 开发规范
2. 查看 [dependency-management.md](./development/dependency-management.md) 了解依赖管理
3. 参考 [backend-api-testing-guide.md](./references/backend-api-testing-guide.md) 编写测试

### 架构设计

1. 阅读 [SHARED-CONSTRAINTS.md](./SHARED-CONSTRAINTS.md) 了解项目约束
2. 查看 [agent-collaboration-guide.md](./development/agent-collaboration-guide.md) 了解协作模式
3. 参考 [sequential-thinking-method.md](./references/sequential-thinking-method.md) 进行任务拆解

---

## 📂 目录结构

```
.claude/docs/
├── README.md                        # 本文档
├── THEME.md                         # 设计规范
├── SHARED-CONSTRAINTS.md            # Agent共享约束
├── api-development-standards.md     # API开发规范
├── spec-api-standard.md             # spec-api标准
├── next-swagger-doc-integration.md  # Swagger集成
├── openapi-development-best-practices.md  # OpenAPI最佳实践
├── development/                     # 开发规范
│   ├── agent-collaboration-guide.md
│   ├── COMPONENT_DEVELOPMENT_CHECKLIST.md
│   ├── datetime-handling-guide.md
│   ├── dependency-management.md
│   ├── GIT_HOOKS_GUIDE.md
│   ├── GITHUB_ACTIONS_CI_GUIDE.md
│   ├── module-development-template.md
│   └── poc-development-guide.md
├── backend/                         # 后端开发
│   ├── nextjs-prisma-best-practices.md
│   ├── typescript-advanced-guide.md
│   └── zod-validation-integration.md
├── claude/                          # Claude配置
│   ├── git-permissions-config.md
│   ├── openapi-mcp-readme.md
│   └── shadcn-mcp-guide.md
├── references/                      # 参考文档
│   ├── backend-api-testing-guide.md
│   ├── frontend-e2e-testing-guide.md
│   ├── ralph-loop-execution-guide.md
│   └── sequential-thinking-method.md
├── templates/                       # 测试模板
│   ├── playwright-test-report-template.md
│   └── swagger-test-report-template.md
└── testing/                         # 测试文档
    ├── error-taxonomy.md
    ├── nextjs-error-handling-guide.md
    └── nextjs-error-quick-reference.md
```

---

## 📝 文档维护

### 文档更新原则

- ✅ 保持文档与代码同步
- ✅ 更新时记录版本和日期
- ✅ 删除过时内容，避免误导
- ✅ 使用清晰的标题和结构

### 文档贡献

如需更新或新增文档：

1. 确定文档类型和位置
2. 遵循现有文档格式
3. 更新本 README.md 的导航
4. 通知团队成员变更

---

**最后更新**: 2026-01-26
**文档版本**: v2.0.0
