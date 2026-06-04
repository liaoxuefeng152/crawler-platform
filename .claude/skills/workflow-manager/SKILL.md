---
name: workflow-manager
description: Quality-driven 9-stage workflow management system for feature development with 100% user journey closure rate, 100% test coverage, and serial development strategy (backend → OpenAPI → Swagger test → frontend). Use when developing new features requiring complete validation through Plan → Clarify → Tasks → Dev → OpenAPI → Test → Verification → QA → Security Review stages, with automatic AUTO_MODE scheduling and rework mechanisms. Ideal for Next.js + TypeScript + shadcn/ui + Prisma/MongoDB stack where quality gates, user journey completeness and security are critical.
---

# Workflow Manager 工作流管理器

质量驱动的开发工作流，通过系统化的9阶段流程确保100%闭环率和完整测试覆盖率，包含自动验证和返工机制。

## 核心原则

1. **⭐ 用户旅途闭环**: 闭环率 = 100%（可量化指标）
2. **🚨 P0强制验证**: 自动化脚本确保质量标准不被跳过
3. **🔄 串行开发**: 后端 → OpenAPI → Swagger测试 → 前端，契约优先

## 9阶段工作流概览

```
Plan → Clarify → Tasks → Dev (Serial) → OpenAPI → Test → Verification → QA → Security Review
```

**阶段执行者**:

1. **Plan** → fullstack-requirement-expert
2. **Clarify** → fullstack-requirement-expert
3. **Tasks** → architecture-planning-expert
4. **Dev** → backend-expert + frontend-expert (串行)
5. **OpenAPI** → backend-expert
6. **Test** → test-expert
7. **Verification** → architecture-planning-expert
8. **QA** → qa-expert
9. **Security Review** → security-reviewer

## 各阶段核心要求

### Plan: 定义需求和用户旅途（闭环率=100%）
- 分析需求，拆解功能模块（至少3个核心模块）
- **⭐ 生成时序图**（新增）:
  - 需求专家调用 `Skill(user-story-mermaid)`
  - 每个功能模块生成一个标准化Mermaid时序图
  - 时序图嵌入 `user-journeys.md`
- 设计用户旅途，定义可视化入口和可操作路径
- 创建 `plan.md` 和 `user-journeys.md`
- **⭐ 用户确认时序图**（新增）:
  - 展示时序图给用户确认需求理解准确
  - 确认后进入Clarify阶段
- 验证: `python3 scripts/validate_user_journeys.py --plan-dir ".az/plan-xxx" --min-journeys 3 --min-closure-rate 100`
- **新增验证**: `python3 scripts/validate_sequence_diagrams.py --plan-dir ".az/plan-xxx" --min-diagrams 3`

### Clarify: 交互式澄清（最多5轮AskUserQuestion）
- **⭐ 时序图反馈处理**（新增）:
  - 基于用户对时序图的反馈进行澄清
  - 如需调整，重新调用 `Skill(user-story-mermaid)` 更新时序图
  - 再次展示确认
- **⭐ 最终确认**（新增）:
  - 展示完整时序图清单和API路径总数
  - 用户确认后进入Tasks阶段
- 开发原则确认：简单权限、Prisma+MongoDB、Zod验证、功能闭环
- 记录决策到 `communication/active-bridge.md`

### Tasks: 拆解任务和定义API契约
- **⭐ 读取时序图**（新增）:
  - 读取 `user-journeys.md` 中每个模块的时序图
  - 基于时序图API路径定义 `spec-api.md`
  - 确保spec-api.md覆盖所有时序图中的API
- 单个任务 ≤6小时，在 `communication/spec-api.md` 定义API契约（RESTful+Zod）
- 导航任务标记P0，验证: `python3 scripts/validate_navigation_tasks.py`

### Dev: 串行开发（后端→前端）
- **后端**: 实现API端点，添加JSDoc，自检，标记 `[STATUS]: BACKEND_READY`
- **前端**: 等待Swagger测试100%通过，基于 `public/openapi.json` 开发，实现返回按钮

### OpenAPI: 生成API文档
- 调用generate-openapi-doc skill，生成 `public/openapi.json`，验证Swagger UI

### Test: 后端Swagger测试 + 前端E2E测试
- **后端Swagger**: 访问 `/api-docs`，测试每个端点（无路由404，返回200/201，匹配spec-api.md）
- **前端E2E**: Playwright自动化，导航测试P0，功能测试P1，通过率=100%

### Verification: 覆盖率和闭环率验证
- 计算闭环率: `python3 scripts/calculate_closure_rate.py --min-rate 100`
- 检查E2E执行: `bash scripts/verify-e2e-executed.sh`
- E2E覆盖率=100% 且 闭环率=100% → 通过

### QA: 质量审计（拥有最终否决权）
- `npm run build` + `npm run dev` + API完整性 + 侧边栏入口 + 闭环率验证

### Security Review: 安全漏洞检测
- `npm audit` + 密钥泄露检测 + OWASP Top 10分析 + 代码安全审查

## 返工机制

**触发条件**: 关键错误>0 | 测试失败率>20% | 覆盖率<100% | 虚假测试 | 严重安全漏洞

**返工恢复流程**:
```
发现问题 → 标记NEEDS_FIX → 创建修复任务 → Dev修复 → 重新执行Test阶段 → 验证通过
```

**⚠️ 关键原则**: R1返工后，**必须重新执行Test阶段**，禁止跳过

**返工次数限制**: 同一问题最多5次返工，安全问题最多3次

## 串行开发策略

**执行顺序**: backend-expert实现API → 自检 → 生成openapi.json → Swagger测试100%通过 → frontend-expert开发页面

**关键依赖**: 前端等待后端Swagger测试100%通过，基于 `public/openapi.json` 而非直接与后端通信

## AUTO_MODE使用

**设置**: 在 `communication/active-bridge.md` 中添加 `[AUTO_MODE]: true`

**行为**: 自动继续下一迭代 | 自动执行测试 | 保持标志不变

**禁止**: 询问"继续？" | 等待确认 | 仅静态检查不实际测试

## 质量标准

| 指标 | 标准 |
|------|------|
| E2E测试覆盖率 | = 100% |
| 用户旅途闭环率 | = 100% |
| API契约完整性 | 100% |
| 后端Swagger测试通过率 | 100% |
| 前端E2E测试通过率 | 100% |
| 安全漏洞 | 无严重漏洞 |

## 资源

### scripts/
- `validate_user_journeys.py`: 验证用户旅途（Plan阶段）
- `validate_sequence_diagrams.py`: 验证时序图数量和API路径（Plan阶段）⭐ 新增
- `validate_navigation_tasks.py`: 验证导航任务（Tasks阶段）
- `calculate_closure_rate.py`: 计算闭环率（Verification阶段）
- `verify-e2e-executed.sh`: 验证E2E执行（Verification阶段）

### references/
- `9-stages-workflow.md`: 完整阶段定义
- `roles-collaboration.md`: 角色职责和协作
- `auto-continue-mechanism.md`: 阶段完成主动确认机制

### assets/
- `user-journeys-template.md`: 用户旅途文档模板
- `tasks-template.md`: 任务看板模板
