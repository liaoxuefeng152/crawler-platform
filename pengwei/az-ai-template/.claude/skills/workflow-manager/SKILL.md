---
name: workflow-manager
description: Quality-driven 9-stage workflow management system for feature development with 100% user journey closure rate, 100% test coverage, and serial development strategy (backend → OpenAPI → Swagger test → frontend). Use when developing new features requiring complete validation through Plan → Clarify → Tasks → Dev → OpenAPI → Test → Verification → QA → Security Review stages, with automatic AUTO_MODE scheduling and rework mechanisms. Ideal for Next.js + TypeScript + shadcn/ui + Prisma/MongoDB stack where quality gates, user journey completeness and security are critical.
---

# Workflow Manager 工作流管理器

质量驱动的开发工作流，通过系统化的9阶段流程确保100%闭环率和完整测试覆盖率，包含自动验证和返工机制。

## 核心原则

**不是"自动化开发"而是"质量驱动的自动化开发循环管理"**

**三大创新**:
1. **⭐ 用户旅途闭环**: 闭环率 = 100%（可量化指标）
2. **🚨 P0强制验证**: 自动化脚本确保质量标准不被跳过
3. **🔄 串行开发**: 后端 → OpenAPI → Swagger测试 → 前端，契约优先

**核心价值**:
- ✅ 确保用户能够完整使用功能（闭环率 = 100%）
- ✅ 确保代码质量可验证（测试覆盖率 = 100%）
- ✅ 确保前后端契约一致性（API 100%实现）
- ✅ 确保问题必须修复（返工机制）

## 适用场景

在以下场景使用此工作流:
- 需要端到端验证的新功能开发
- 具有导航流程的用户界面功能
- 需要契约验证的API实现
- 需要完整功能和质量保证的项目
- 多专家协作管理（后端、前端、测试、QA）

**触发示例**:
- "开发一个用户管理功能"
- "实现一个订单系统"
- "创建商品拼团功能"
- "Build a new feature for X"

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
9. **Security Review** → security-reviewer ⭐ 新增

## 快速开始工作流

### 步骤 1: Plan 阶段

**目标**: 定义需求和用户旅途，预期闭环率 = 100%

**行动**:
1. 分析需求可行性和技术栈要求
2. **⭐ 设计用户旅途**（至少3个旅途）:
   - 定义可视化入口（眼睛看得到）
   - 定义可操作路径（鼠标点得到）
   - 确保每个页面都有返回方法
   - 计算预期闭环率 = 100%
3. 创建 `plan.md` 和 `user-journeys.md`
4. **运行验证**: `python3 scripts/validate_user_journeys.py --plan-dir ".az/plan-xxx" --min-journeys 3 --min-closure-rate 100`

**完成标准**:
- ✅ 至少定义3个用户旅途
- ✅ 每个旅途有完整操作路径（开始→操作→结束→返回）
- ✅ 预期闭环率 = 100%
- ✅ 验证脚本通过

### 步骤 2: Clarify 阶段

**目标**: 交互式澄清和开发原则确认

**行动**:
1. 使用AskUserQuestion工具（最多5轮）
2. **⭐ 开发原则确认**:
   - 权限系统: 简单权限（基于用户ID的资源所有权）
   - 数据库: 使用Prisma + MongoDB
   - 验证: 前端基础验证 + 后端Zod Schema验证
   - 功能完整性: 用户旅途闭环
3. 记录决策到 `communication/active-bridge.md`
4. 更新 `plan.md`

**完成标准**:
- ✅ 所有问题已回答
- ✅ 用户确认开发原则
- ✅ 最多5轮澄清

### 步骤 3: Tasks 阶段

**目标**: 拆解任务和定义API契约

**行动**:
1. 拆解任务（单个任务 ≤6小时）
2. **⭐ 在 `communication/spec-api.md` 定义API契约**:
   - 符合RESTful规范
   - 每个接口包含成功标准
   - 完整的Zod schema定义
3. **⭐ 拆解导航任务**（P0优先级）:
   - 为每个页面"实现返回按钮"
   - 使用PageHeader组件的leftContent
4. 创建 `tasks.md`
5. **运行验证**: `python3 scripts/validate_navigation_tasks.py --plan-dir ".az/plan-xxx" --user-journeys .az/plan-xxx/user-journeys.md`

**完成标准**:
- ✅ 任务拆解合理（每项 ≤6小时）
- ✅ spec-api.md完整包含Zod schemas
- ✅ 导航任务标记为P0
- ✅ 验证脚本通过

### 步骤 4: Dev 阶段 (串行开发)

**⚠️ 关键**: 前端必须等待后端Swagger测试100%通过

#### 4-1: 后端开发


- 任务: 实现所有API端点
- 迭代: 每次3-4个端点
- 最大迭代: 10次
- 完成承诺: 所有端点实现完成，TypeScript检查通过，npm run build成功

**AUTO_MODE 处理**:
- 检查 `communication/active-bridge.md` 中的 `[AUTO_MODE]: true`
- 如果存在 → 自动继续（不询问用户）
- ❌ 禁止在检测到AUTO_MODE时询问"继续？"

**行动**:
1. 迭代1: 实现端点1-3
2. 迭代2: 实现端点4-6
3. 迭代N: 实现剩余端点
4. 后端自检（ESLint + TypeScript + API测试）
5. 添加完整的JSDoc注释
6. 标记 `[STATUS]: BACKEND_READY`

**完成标准**:
- ✅ 严格遵守spec-api.md契约
- ✅ 完整的JSDoc注释
- ✅ 自检通过

#### 4-2: 前端开发


- 任务: 实现所有前端页面
- 迭代: 每次1-2个页面
- 最大迭代: 10次

**行动**:
1. 执行混合策略（15分钟组件发现）
2. 实现包含导航功能的页面
3. **⭐ 实现返回按钮**（PageHeader leftContent）
4. 前端自检（TypeScript + lint）
5. 标记 `[STATUS]: READY`

**完成标准**:
- ✅ 基于tasks.md完成所有任务
- ✅ 基于 `public/openapi.json` 集成API
- ✅ `npm run type-check` 通过（0错误）
- ✅ 所有导航功能实现

### 步骤 5: OpenAPI 阶段

**执行者**: backend-expert + generate-openapi-doc skill

**行动**:
1. 调用generate-openapi-doc skill
2. 扫描所有API路由
3. 检查JSDoc完整性
4. 同步JSDoc与代码实现
5. 生成 `public/openapi.json`
6. 验证Swagger UI正确加载

**完成标准**:
- ✅ `public/openapi.json` 生成成功
- ✅ 所有端点有JSDoc注释
- ✅ JSDoc与代码100%匹配
- ✅ Swagger UI可访问

### 步骤 6: Test 阶段

#### 6-1: 后端Swagger测试


**测试方法**: 通过Swagger UI手动测试（不写测试代码）

**行动**:
1. 访问 http://localhost:3000/api-docs
2. 测试每个端点（与spec-api.md对比）:
   - 端点路径正确（**无路由404**）
   - 请求参数匹配契约
   - **响应状态码必须是200/201**（正常流程）
   - 响应格式匹配契约
   - 错误码匹配契约
3. 生成 `swagger-test-report.md`

**🚨 完成标准（严格执行）**:
- ✅ 所有端点测试通过（100%）
- ✅ **无路由404错误**（所有API端点已实现）
- ✅ **所有API返回200/201状态码**（正常流程）
- ✅ 匹配spec-api.md（100%）
- ✅ 无P0错误

**🚨 失败标准（必须触发返工）**:
- ❌ 任何API端点返回路由404
- ❌ 任何API端点返回500/502/503
- ❌ 响应格式与spec-api.md不一致
- ❌ 测试通过率 < 100%

**⚠️ 关键**: 前端开发前必须100%通过

#### 6-2: 前端E2E测试


**测试方法**: Playwright自动化

**⭐ 区分两类测试**:

1. **功能测试**（P1）:
   - 业务逻辑验证
   - 表单提交、数据保存等

2. **导航测试**（**P0强制**）:
   - 用户旅途闭环完整性
   - 返回按钮功能
   - **错误场景导航**（P1）:
     - 验证失败时的返回按钮
     - API失败时的返回按钮
     - 网络错误时的返回按钮

**行动**:
1. 编写E2E测试代码（N次迭代）
2. 运行 `npx playwright test`
3. 生成 `playwright-test-report.md`
4. 统计: E2E覆盖率 = 100%，闭环率 = 100%

**🚨 完成标准（严格执行）**:
- ✅ 所有用户故事测试通过（100%）
- ✅ **无页面404错误**（所有页面路由可访问）
- ✅ 测试通过率 = 100% (passed = total, failed = 0)
- ✅ 闭环率 = 100%
- ✅ 导航测试验证通过

### 步骤 7: Verification 阶段

**执行者**: architecture-planning-expert

**行动**:
1. 阅读 `playwright-test-report.md`
2. **⭐ 计算闭环率**:
```bash
python3 .claude/skills/workflow-manager/scripts/calculate_closure_rate.py \
  --plan-dir ".az/plan-xxx" \
  --report-type playwright \
  --min-rate 100
```

3. **⭐ 检查E2E执行**:
```bash
bash .claude/skills/workflow-manager/scripts/verify-e2e-executed.sh .az/plan-xxx $MODULE
```

4. 评估结果:
   - **情况A**: E2E覆盖率 = 100% 且 闭环率 = 100% ✅
     → 标记 `[STATUS]: VERIFICATION_PASSED`
     → 进入QA阶段
   - **情况B**: 任一 < 100% ❌
     → 触发返工流程

**完成标准**:
- ✅ E2E测试覆盖率 = 100%
- ✅ 用户旅途闭环率 = 100%
- ✅ 所有验证脚本通过

**阻塞条件**:
- ❌ E2E测试文件不存在
- ❌ E2E测试从未执行
- ❌ 无测试执行证据
- ❌ 覆盖率或闭环率 < 100%

### 步骤 8: QA 阶段

**执行者**: qa-expert（拥有最终否决权）

**行动**:
1. **⭐ 步骤1: API契约完整性检查**:
```bash
# 统计spec-api.md中的端点数
API_COUNT=$(grep -E "^POST|^GET|^DELETE|^PATCH" .az/plan-*/spec-api.md | wc -l)
# 验证每个端点已实现且可访问
```

2. **⭐ 步骤2: 用户旅途闭环手动验证**:
```bash
npm run dev &
# 根据user-journeys.md手动测试所有旅途
```

3. **步骤3: 质量验收**:
```bash
npm run build
npm run dev
```

4. 撰写 `qa-report.md`

**最终决策**:
- **所有条件满足**:
  - ✅ npm run build 成功
  - ✅ npm run dev 启动
  - ✅ API端点100%实现
  - ✅ 闭环率 = 100%
  - ✅ qa-report.md 完成
  → **QA通过 ✅，项目完成！**

- **任一条件失败**:
  → 触发返工

**完成标准**:
- ✅ 构建成功
- ✅ 所有API已实现
- ✅ 闭环率 = 100%
- ✅ QA报告完成

### 步骤 9: Security Review 阶段 ⭐ 新增

**执行者**: security-reviewer agent

**触发条件**: QA阶段通过

**目标**: 安全漏洞检测和修复建议

**行动**:

1. **⭐ 依赖安全检查**:
```bash
npm audit --audit-level=high
```

2. **⭐ 密钥泄露检测**:
```bash
# 检查硬编码密钥
grep -r "api[_-]?key\|password\|secret\|token" \
  --include="*.js" --include="*.ts" --include="*.json" \
  --exclude-dir=node_modules --exclude-dir=.next .
```

3. **⭐ OWASP Top 10分析**:
   - 注入漏洞（SQL、NoSQL、命令）
   - 认证和授权问题
   - 敏感数据暴露
   - XSS、SSRF等

4. **代码安全审查**:
   - 输入验证和清理
   - 访问控制
   - 速率限制
   - 日志安全

5. **生成安全报告**: `security-review-report.md`

**完成标准**:
- ✅ 无严重（Critical）安全漏洞
- ✅ 高危（High）漏洞≤3个
- ✅ 无硬编码密钥泄露
- ✅ OWASP Top 10检查通过
- ✅ 安全报告完成

**🚨 失败标准（必须触发返工）**:
- ❌ 发现严重安全漏洞
- ❌ 发现硬编码密钥/密码
- ❌ 高危漏洞>3个
- ❌ 存在SQL注入、XSS、命令注入

**最终决策**:
- **所有条件满足**:
  - ✅ 无严重安全漏洞
  - ✅ 高危漏洞≤3个
  - ✅ 无硬编码密钥
  - ✅ security-review-report.md 完成
  → **Security Review通过 ✅，项目完成！**

- **任一条件失败**:
  → 触发返工

## 返工机制

### 触发条件

**Test阶段**:
- ❌ 关键错误 > 0
- ❌ 测试失败率 > 20%
- ❌ 覆盖率 < 100%
- ❌ 虚假测试（仅描述未执行）

**Verification阶段**:
- ❌ E2E覆盖率 < 100%
- ❌ 闭环率 < 100%

**QA阶段**:
- ❌ 构建失败
- ❌ API未100%实现
- ❌ 闭环率 < 100%

**Security Review阶段** ⭐ 新增:
- ❌ 严重（Critical）安全漏洞
- ❌ 硬编码密钥/密码泄露
- ❌ 高危漏洞 > 3个
- ❌ 存在SQL注入、XSS、命令注入

### 返工恢复流程

**⚠️ 关键原则**: R1返工后，**必须重新执行Test阶段**

```
Test专家发现关键错误
→ 标记 [STATUS]: NEEDS_FIX
→ 在tasks.md创建修复任务（R1, R2...）
→ 架构专家分配修复任务
→ Dev阶段修复
→ Dev标记 [STATUS]: FIXED
→ 架构专家验证修复完整性
→ 🚨 架构专家明确通知Test专家："开始重新Test" ⭐
→ Test专家标记 [STATUS]: RE_TESTING ⭐
→ Test专家执行完整测试:
  1. 后端: Swagger UI手动测试
  2. 前端: npx playwright test
  3. 记录结果（passed/failed/screenshot）
  4. 标记 [STATUS]: TEST_PASSED ⭐
→ 只有所有步骤完成，才标记 TEST_READY_FOR_VERIFICATION
→ 进入Verification阶段
```

**状态流转**:
```
TESTING → NEEDS_FIX → FIXING → FIXED → RE_TESTING ⭐ → TEST_PASSED ⭐ → READY_FOR_VERIFICATION
```

**Security Review返工流程** ⭐ 新增:

```
security-reviewer发现安全问题
→ 标记 [STATUS]: SECURITY_ISSUES_FOUND
→ 在tasks.md创建修复任务（S1, S2...）
→ 架构专家分配修复任务
→ Dev阶段修复
→ Dev标记 [STATUS]: SECURITY_FIXED
→ 架构专家通知security-reviewer重新审查
→ security-reviewer标记 [STATUS]: RE_SECURITY_REVIEWING ⭐
→ security-reviewer执行完整安全审查:
  1. 依赖安全检查（npm audit）
  2. 密钥泄露检测（grep扫描）
  3. OWASP Top 10分析
  4. 代码安全审查
  5. 标记 [STATUS]: SECURITY_REVIEW_PASSED ⭐
→ 进入Complete阶段
```

**Security Review状态流转** ⭐ 新增:
```
SECURITY_REVIEWING → SECURITY_ISSUES_FOUND → SECURITY_FIXING → SECURITY_FIXED → RE_SECURITY_REVIEWING ⭐ → SECURITY_REVIEW_PASSED ⭐ → COMPLETE
```

### 返工次数限制
- 同一问题: 最多5次返工
- 超过5次 → 升级处理

**Security Review特殊限制** ⭐ 新增:
- 同一安全问题: 最多3次返工
- 超过3次 → 升级处理（架构专家决策）

## 资源

### scripts/

用于质量关卡的可执行验证脚本:

- **`validate_user_journeys.py`**: 验证用户旅途文档完整性（Plan阶段）
- **`validate_navigation_tasks.py`**: 验证导航任务拆解（Tasks阶段）
- **`verify_closure_tests.py`**: 导航测试完整性的P0强制检查（Test阶段）
- **`calculate_closure_rate.py`**: 计算用户旅途闭环率（Verification阶段）
- **`verify-e2e-executed.sh`**: 验证E2E测试实际执行（Verification阶段）

**使用方法**: 从命令行运行，无需加载到上下文（除非调试）。

### references/

详细文档（按需加载）:

- **`9-stages-workflow.md`**: 完整的8阶段工作流定义（执行特定阶段时）
- **`roles-collaboration.md`**: 6个角色的职责和协作（协调专家时）

**使用方法**: 需要特定阶段详情时阅读。保持SKILL.md精简。

### assets/

工作流产物模板:

- **`user-journeys-template.md`**: 用户旅途文档模板（Plan阶段）
- **`tasks-template.md`**: 任务看板模板（Tasks阶段）

**使用方法**: 为每个项目复制并自定义。无需加载到上下文。

## 开发原则

**必须遵守**:
1. **数据存储**: Prisma + MongoDB（生产级存储）
2. **权限系统**: 简单权限（基于用户ID的资源所有权检查，复用现有登录系统）
3. **验证**: 前端基础验证 + 后端Zod Schema验证
4. **开发重点**: 功能完整、用户旅途闭环
5. **质量关卡**:
   - E2E测试覆盖率 = 100%
   - 用户旅途闭环率 = 100%
   - API契约完整性 = 100%

**禁止**:
- ❌ 重复开发登录系统（必须复用现有登录系统）
- ❌ 只有UI不集成API
- ❌ 只有代码不测试
- ❌ 阻塞构建的类型错误

## 串行开发策略

**为何串行而非并行？**（质量优先）:
- ✅ 后端先完成 → 生成稳定的OpenAPI
- ✅ 前端基于**已测试的openapi.json**，契约可靠
- ✅ 后端API问题在Swagger测试中被发现，不影响前端
- ✅ 前端可触发后端返工（本地测试），反馈更快
- ✅ 功能完整性优先，质量保证优先

**执行顺序**:
```
2. backend-expert实现所有API（N次迭代）
3. backend-expert自检
4. backend-expert生成public/openapi.json
5. test-expert Swagger测试（100%通过）⚠️ 前置条件
7. frontend-expert实现所有页面（N次迭代）
8. frontend-expert自检
```

**⚠️ 关键依赖**:
- 前端等待后端Swagger测试100%通过
- 前端基于public/openapi.json，而非直接与后端通信
- 后端Swagger测试是前后端之间的质量关卡

## AUTO_MODE使用

**目的**: 无需用户确认即可自动迭代

**设置**: 在 `communication/active-bridge.md` 中添加:
```markdown
[AUTO_MODE]: true
```

**行为**:
- ✅ 自动继续下一迭代
- ✅ 自动执行测试步骤
- ✅ 保持AUTO_MODE标志不变

**禁止行为**（检测到AUTO_MODE时）:
- ❌ 询问"继续下一迭代？"
- ❌ 询问"继续测试？"
- ❌ 等待用户确认
- ❌ 仅静态检查不实际测试

**检查方法**:
```bash
grep "\[AUTO_MODE\]: true" .az/plan-xxx/communication/active-bridge.md
```

## 质量标准

| 指标 | 标准 | 备注 |
|------|------|------|
| E2E测试覆盖率 | = 100% | 核心代码 |
| 用户旅途闭环率 | = 100% | 可量化指标 |
| API契约完整性 | 100% | 所有spec-api.md端点 |
| 后端Swagger测试通过率 | 100% | 所有API端点 |
| 前端E2E测试通过率 | 100% | 所有用户故事 |
| 安全漏洞检查 | 无严重漏洞 | Security Review ⭐ 新增 |
| 密钥泄露检查 | 无硬编码密钥 | Security Review ⭐ 新增 |

## 阶段转换规则

**可进入下一阶段当**:
- ✅ 当前阶段完成标准满足
- ✅ 所有验证脚本通过
- ✅ 无阻塞问题

**必须触发返工当**:
- ❌ 发现关键阻塞问题
- ❌ 质量标准未满足
- ❌ 验证脚本失败

**Example Validations**:
- Plan → Clarify: User journeys validated, closure rate = 100%
- Tasks → Dev: Navigation tasks marked P0, spec-api.md complete
- Backend → OpenAPI: Self-check passed, JSDoc complete
- OpenAPI → Test: public/openapi.json generated successfully
- Swagger Test → Frontend: 100% passed, no P0 errors
- Frontend → E2E: Self-check passed, navigation implemented
- E2E → Verification: Coverage = 100%, closure rate = 100%
- Verification → QA: All verification scripts passed
- QA → Security Review: Build successful, APIs 100% implemented, closure rate = 100%
- Security Review → Complete: No critical vulnerabilities, no hardcoded secrets ⭐ 新增

## 🚨 阶段完成主动确认机制

### 目标
Clarify阶段后，**完全自动化完成所有后续环节**，无需用户干预。

### 核心原则
1. **零干预**: Clarify后用户无需再介入
2. **全自动展示**: 明确展示自动化完成进度
3. **主动推进**: 自动从一个阶段进入下一阶段
4. **质量保证**: 结合P0阻塞机制确保质量

### 触发时机
在每个阶段标记`[STATUS]: READY`或`[STATUS]: COMPLETED`时

### 标准确认提示词

```markdown
## 🤖 全自动开发进度报告

**项目**: [项目名称]
**当前阶段**: [Dev/Test/OpenAPI/etc]
**自动化状态**: 🟢 全自动运行中
**完成时间**: [timestamp]

### 📊 全自动完成情况

#### ✅ 本阶段已完成
- [列出本阶段完成的关键任务]

#### 🚀 下一阶段自动准备
- [下一阶段名称]: 自动将在[时间]后开始
- 预计完成时间: [预计时间]

### 📈 整体自动化进度
```
[████████████████████░░░░] 80% 完成

Plan       ████████████████████ 100%
Clarify    ████████████████████ 100%
Tasks      ████████████████████ 100%
Dev        ████████████████████ 100% ✅
OpenAPI    ██████████████████░░  80%  🔄
Test       ░░░░░░░░░░░░░░░░░░░░░░   0%  ⏳
Verification░░░░░░░░░░░░░░░░░░░░░░   0%  ⏳
QA         ░░░░░░░░░░░░░░░░░░░░░░   0%  ⏳
Security   ░░░░░░░░░░░░░░░░░░░░░░   0%  ⏳ ⭐ 新增
```

### 🎯 质量保证自动化
- ✅ Smoke Test: 自动验证所有入口
- ✅ Route Validation: 自动验证路由
- ✅ Build Check: 自动验证构建
- ✅ QA Check: 自动运行所有检查
- ✅ Security Check: 自动安全审查 ⭐ 新增

### 🤔 全自动确认

**问题**: 本阶段是否已经全自动完成？

**选项**:
- ✅ "全自动完成" → 自动进入下一阶段（继续全自动）
- 🔧 "发现Bug" → 立即修复后继续
- 📊 "查看详情" → 显示详细完成报告

**自动继续**: 如您30秒内不回复，将自动继续下一阶段
**零干预承诺**: 整个过程全自动，您无需介入

---

**备注**:
- 📊 当前进度: [当前阶段]/9个阶段 ⭐ 更新
- ⏱️  预计剩余时间: [预计时间]
- 🎯 目标: 100%自动化，零人工干预
```

### 自动继续逻辑

**30秒规则**（Clarify后默认）:
```
Clarify完成 → 全自动模式启动 → 每阶段完成后30秒确认 → 无回复 → 自动下一阶段
```

**零干预模式**:
```
Clarify → 用户确认"开始全自动" → 后续7个阶段全自动完成 → 最终交付
```

### 实施要点

1. **主动性**: 阶段完成立即报告，不等用户问
2. **透明化**: 清晰展示自动化进度（进度条、百分比）
3. **全自动化**: 强调"全自动完成"而非"是否完成"
4. **零干预**: Clarify后用户无需再介入
5. **质量保证**: P0阻塞机制确保质量不降低
