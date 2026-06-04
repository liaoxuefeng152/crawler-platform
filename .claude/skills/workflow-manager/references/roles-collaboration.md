# Roles and Collaboration

6个角色的职责与协作关系

## 角色清单

1. **用户 (POD)** - 提出需求、确认需求澄清、最终验收
2. **需求专家 (fullstack-requirement-expert)** - Plan和Clarify阶段
3. **架构专家 (architecture-planning-expert)** - 指挥官，协调Dev、Test、Verification、QA阶段
4. **后端专家 (backend-expert)** - 后端开发和OpenAPI生成
5. **前端专家 (frontend-expert)** - 前端开发和导航功能实现
6. **测试专家 (test-expert)** - 后端Swagger测试和前端E2E测试
7. **QA专家 (qa-expert)** - 质量审计，拥有最终否决权

## 详细职责

### 1. 用户 (POD)

**职责**:

- 提出需求
- 确认需求澄清
- 最终验收

**协作**:

- Plan阶段：提出新功能开发需求
- Clarify阶段：回答问题（最多5轮）
- QA阶段：最终验收

### 2. 需求专家 (fullstack-requirement-expert)

**职责**:

- Plan阶段：需求分析、用户旅程设计
- Clarify阶段：交互式澄清、开发原则确认

**协作**:

- 输入：用户原始需求
- 输出：plan.md + user-journeys.md
- 提交给：架构专家（Tasks阶段）

### 3. 架构专家 (architecture-planning-expert)

**职责**:

- **指挥官**：协调Dev、Test、Verification、QA阶段
- Tasks阶段：任务拆解、API契约定义
- Verification阶段：E2E覆盖率检查、闭合率计算
- **返工机制**：分析问题、分配修复任务、验证修复完整性

**协作**:

- 输入：plan.md + user-journeys.md
- 输出：tasks.md + spec-api.md
- 调度：backend-expert → test-expert → frontend-expert

### 4. 后端专家 (backend-expert)

**职责**:

- Dev阶段（4-1）：实现所有API端点
- OpenAPI阶段：生成public/openapi.json

**协作**:

- 输入：tasks.md + spec-api.md
- 输出：API代码 + JSDoc注释 + public/openapi.json
- 提交给：test-expert（Swagger测试）

### 5. 前端专家 (frontend-expert)

**职责**:

- Dev阶段（4-2）：实现所有前端页面
- 混合策略：15分钟组件发现
- 导航功能实现：返回按钮、闭环完整性

**协作**:

- 输入：tasks.md + public/openapi.json（后端Swagger测试通过后）
- 输出：功能代码 + component-decisions.md
- 提交给：test-expert（E2E测试）

### 6. 测试专家 (test-expert)

**职责**:

- Test阶段（6-1）：后端Swagger测试
- Test阶段（6-2）：前端E2E测试
- 区分两类测试：功能测试 + 导航测试（P0强制）

**协作**:

- 输入：spec-api.md + tasks.md + public/openapi.json
- 输出：swagger-test-report.md + playwright-test-report.md
- 提交给：架构专家（Verification阶段）

### 7. QA专家 (qa-expert)

**职责**:

- QA阶段：API契约完整性检查、用户旅程闭环完整性验收
- 质量审计、撰写qa-report.md
- **拥有任务关闭的最终否决权**

**协作**:

- 输入：active-bridge.md + plan.md + tasks.md
- 输出：qa-report.md
- 最终决定：PASS或FAIL（触发返工）

## 协作流程图

```
用户
  ↓ 提出需求
需求专家 (Plan + Clarify)
  ↓ plan.md + user-journeys.md
架构专家 (Tasks)
  ↓ tasks.md + spec-api.md
架构专家 (指挥) → 后端专家 (Dev 4-1)
  ↓ API代码 + JSDoc
后端专家 + generate-openapi-doc skill (OpenAPI)
  ↓ public/openapi.json
架构专家 (指挥) → 测试专家 (Test 6-1: Swagger)
  ↓ swagger-test-report.md
架构专家 (指挥) → 前端专家 (Dev 4-2)
  ↓ 前端代码
架构专家 (指挥) → 测试专家 (Test 6-2: E2E)
  ↓ playwright-test-report.md
架构专家 (Verification)
  ↓ 验证通过
QA专家 (QA)
  ↓ qa-report.md
用户 (最终验收)
```

## 关键协作点

1. **Plan → Tasks**: 需求专家 → 架构专家
   - 交付物：plan.md + user-journeys.md

2. **Tasks → Backend Dev**: 架构专家 → 后端专家
   - 交付物：spec-api.md

3. **Backend Dev → OpenAPI**: 后端专家 → 后端专家
   - 交付物：public/openapi.json

4. **OpenAPI → Swagger Test**: 后端专家 → 测试专家
   - 依赖：public/openapi.json生成成功

5. **Swagger Test → Frontend Dev**: 测试专家 → 前端专家
   - 前置条件：Swagger测试100%通过

6. **Frontend Dev → E2E Test**: 前端专家 → 测试专家
   - 交付物：前端代码

7. **E2E Test → Verification**: 测试专家 → 架构专家
   - 交付物：playwright-test-report.md

8. **Verification → QA**: 架构专家 → QA专家
   - 前置条件：E2E覆盖率100% + 闭合率100%

9. **QA → User**: QA专家 → 用户
   - 交付物：qa-report.md

## 返工协作流程

```
Test/Verification/QA 发现问题
  ↓
架构专家分析问题
  ↓
创建修复任务（R1, R2...）
  ↓
分配给相应专家（backend/frontend-expert）
  ↓
专家修复并标记 [STATUS]: FIXED
  ↓
架构专家验证修复完整性
  ↓
架构专家明确通知Test专家："开始重新Test"
  ↓
Test专家标记 [STATUS]: RE_TESTING
  ↓
Test专家重新执行完整测试
  ↓
Test专家标记 [STATUS]: TEST_PASSED
  ↓
进入Verification阶段
```

**状态流转**:

```
TESTING → NEEDS_FIX → FIXING → FIXED → RE_TESTING → TEST_PASSED → READY_FOR_VERIFICATION
```
