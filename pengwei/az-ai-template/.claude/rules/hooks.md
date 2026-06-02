# Hooks 使用指南

## 🤖 MCP 工具集成

### MCP 工具使用规范

- ✅ 优先选择有 MCP 集成的工具（如 shadcn/ui）
- ✅ 测试前必须先连接 MCP 确认功能可用
- ✅ 不使用时必须卸载包并清理 MCP 配置
- ❌ 禁止 MCP 配置残留

### MCP 工具功能

- 📦 **组件查询**：查询现有组件
- ➕ **添加组件**：添加新组件到项目
- 🔍 **分析依赖**：分析组件依赖关系

> 💡 详细指南：[MCP 集成指南](./.claude/docs/claude/shadcn-mcp-guide.md)

## 🛠️ 开发工具集成

### 组件开发检查清单

1. 阅读设计规范 → [THEME.md](./.claude/docs/THEME.md)
2. 检查现有组件 → 使用 MCP 工具
3. 选择开发方案 → [组件检查清单](./.claude/docs/development/COMPONENT_DEVELOPMENT_CHECKLIST.md)
4. 开始开发 → frontend-expert

### API 开发规范

- ✅ 标准 Next.js API Routes 开发规范
- ✅ Zod Schema 验证标准
- ✅ JSDoc 注释规范（生成 OpenAPI 文档）
- ✅ 完整的 API 路由模板和最佳实践

> 💡 详细文档：[API 开发规范](./.claude/docs/api-development-standards.md)
