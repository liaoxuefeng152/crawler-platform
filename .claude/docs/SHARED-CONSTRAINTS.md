# Agent共享约束

**适用范围**：所有专家agent
**维护者**：架构专家
**最后更新**：2026-01-05

---

## 🎯 核心原则

这些约束适用于所有专家agent，必须在处理任务时严格遵守。

---

## 📋 项目通用约束

### 1. POC原则（强制遵守）

**核心原则**：
- ✅ **JSON数据驱动**：无数据库，使用JSON文件存储
- ✅ **无权限系统**：POC阶段不实现权限控制
- ✅ **简化验证**：仅前端基础必填校验，后端简化处理

**强制检查**：
- ❌ 不实现权限系统（角色管理、权限分配等）
- ❌ 不使用数据库（PostgreSQL、MySQL等）
- ❌ 不使用ORM（Prisma、TypeORM等）
- ✅ 使用JSON数据存储
- ✅ 仅前端基础验证

**违反后果**：
- 架构专家将拒绝验收
- 要求重新按照POC原则实现

**详细说明**：[POC开发详细指南](.claude/docs/development/poc-development-guide.md)

---

### 2. API契约优先（spec-api.md）

**强制执行时机**：
- ✅ 开发任何API接口**之前**
- ✅ 修改API接口定义时
- ✅ 前后端数据交互设计时

**执行要求**：
- 必须检查 `communication/spec-api.md` 是否存在
- 如果存在，必须严格遵守契约定义
- 如果需要修改，必须先更新契约，再实现代码
- 契约修改必须通知架构专家和前端专家

**违反后果**：
- 架构专家将拒绝验收
- 要求重新按照契约实现

**详细说明**：[spec-api-standard.md](.claude/docs/spec-api-standard.md)

---

### 3. Git权限控制（AI禁止自动提交）

**核心规则**：
- ✅ **AI禁止自动执行Git写入操作**（git add/commit/push）
- ✅ **所有Git操作必须由用户手动执行**

**配置说明**：
- Claude Code已配置为禁止自动git操作
- 详细配置：[Git权限控制配置](.claude/docs/claude/git-permissions-config.md)

**执行方式**：
```bash
# ❌ AI不能执行
git add .
git commit -m "xxx"
git push

# ✅ 用户手动执行
# AI只提供git命令建议
```

---

## 🗂️ 文件系统协作协议

### 权限矩阵

完整权限管理标准：[Workflow Manager 完整权限管理标准](../skills/workflow-manager/DIRECTORY_STRUCTURE_STANDARD.md)

### 读写权限

**开放访问原则**：按需阅读，责任自负

**核心专注**（每个agent根据自己的角色）：
- CONTEXT/project-overview.json（项目概览）
- CONTEXT/api-contracts.json（API契约）
- HANDOVERS/架构到我的需求交接文档

**跨职能访问**（需要时可以读取）：
- TECHNICAL_DECISIONS/其他角色的技术决策
- HANDOVERS/架构到其他角色的需求交接

**写入权限**：仅限自己专业领域的文件

### 操作指令

- ✅ 按需阅读任何文件，无需复杂的权限检查
- ✅ 尊重他人的工作文件，避免不必要的修改
- ✅ 专注于自己专业领域的任务
- ✅ 保持开放沟通，主动分享发现的问题和建议

---

## 🔧 技术栈约束

### 必须使用

- **前端框架**：Next.js 16（Turbopack开发）
- **UI库**：shadcn/ui（通过 `npx shadcn@latest mcp` 管理）
- **状态管理**：Zustand
- **HTTP客户端**：Axios
- **数据存储**：JSON Mock数据

### 禁止使用

- 🚫 数据库（PostgreSQL、MySQL等）
- 🚫 ORM（Prisma、TypeORM等）
- 🚫 复杂状态管理（Redux、MobX等）
- 🚫 权限系统（Casbin、AccessControl等）

---

## 🤝 协作规则

### 状态标记规范

**Dev完成后**：
```markdown
**[STATUS]: READY** - 开发完成，等待测试
```

**Test完成后**：
```markdown
**[STATUS]: TEST_PASSED** - 测试通过
**[STATUS]: NEEDS_FIX** - 测试失败，需要修复
**[STATUS]: TEST_READY_FOR_VERIFICATION** - 测试完成，等待验证
```

**返工恢复**：
```markdown
**[STATUS]: RE_TESTING** - 重新测试中
```

### 沟通协议

- ✅ 发现问题立即记录到 `communication/active-bridge.md`
- ✅ 重要决策通知架构专家
- ✅ 契约变更通知所有相关角色
- ✅ 测试结果记录到active-bridge.md

---

## 📚 参考文档

### 核心文档

- 📄 [CLAUDE.md](../../CLAUDE.md) - 项目开发指南（唯一文档入口）
- 📄 [THEME.md](.claude/docs/THEME.md) - 设计风格指南
- 📄 [workflow-manager SKILL.md](../skills/workflow-manager/SKILL.md) - 9阶段工作流
- 📄 [spec-api-standard.md](.claude/docs/spec-api-standard.md) - API契约标准

### 开发指南

- 📄 [POC开发详细指南](.claude/docs/development/poc-development-guide.md)
- 📄 [组件开发检查清单](.claude/docs/development/COMPONENT_DEVELOPMENT_CHECKLIST.md)
- 📄 [Agent协作详细流程](.claude/docs/development/agent-collaboration-guide.md)
- 📄 [日期时间处理规范](.claude/docs/development/datetime-handling-guide.md)

### 技术文档

- 📄 [shadcn MCP指南](.claude/docs/claude/shadcn-mcp-guide.md)
- 📄 [OpenAPI开发最佳实践](.claude/docs/openapi-development-best-practices.md)
- 📄 [next-swagger-doc集成指南](.claude/docs/next-swagger-doc-integration.md)

---

## ✅ 遵守检查清单

在处理任何任务时，确保：

- [ ] 了解任务是否违反POC原则
- [ ] 检查API契约是否存在并遵守
- [ ] 不执行自动git操作
- [ ] 尊重文件系统协作协议
- [ ] 使用正确的技术栈
- [ ] 遵循状态标记规范
- [ ] 记录重要的决策和问题

---

**记住**：这些约束确保项目的一致性和质量，所有agent必须严格遵守。

**维护者**：架构专家
**最后更新**：2026-01-05
