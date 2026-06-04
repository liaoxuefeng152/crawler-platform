# 9阶段工作流定义

质量驱动的完整9阶段开发工作流。

## 阶段概览

```
Plan → Clarify → Tasks → Dev (Serial) → OpenAPI → Test → Verification → QA → Security Review
```

## 阶段 1: Plan（需求规划）

**执行者**: fullstack-requirement-expert

**触发条件**: 用户请求新功能开发

**核心任务**:

1. **基础分析**
   - 分析需求可行性
   - 识别技术栈需求
   - 评估功能完整性要求
   - 定义业务边界

2. **⭐ 设计用户旅途**（关键）
   - 识别所有主要用户旅途
   - 定义可视化入口（眼睛看得到）
   - 定义可操作路径（鼠标点得到）
   - 确保每个页面都有返回方法（闭环完整性）
   - 计算预期闭环率= (有返回的路径数 / 总路径数) × 100%
   - 目标: 预期闭环率 = 100%

**输出**:

- `plan.md` - 需求规划文档
- `user-journeys.md` - 用户旅途设计文档

**完成标准**:

- ✅ 需求清晰可理解
- ✅ 业务边界明确
- ✅ 功能完整性评估完成
- ✅ **至少识别3个主要用户旅途**
- ✅ **每个旅途包含完整操作路径（开始→操作→结束→返回）**
- ✅ **预期闭环率 = 100%**

**验证脚本**:

```bash
python3 scripts/validate_user_journeys.py \
  --plan-dir ".az/plan-xxx" \
  --min-journeys 3 \
  --min-closure-rate 100
```

## 阶段 2: Clarify（需求澄清）

**执行者**: fullstack-requirement-expert

**触发条件**: Plan阶段完成

**核心任务**:

1. 使用AskUserQuestion工具进行交互式澄清（最多5轮）
2. **⭐ 开发原则确认**（重要）:
   - 确认是否需要权限系统（简单权限：基于用户ID的资源所有权）
   - 确认数据库使用（Prisma + MongoDB）
   - 确认验证复杂度（前端基础验证 + 后端Zod Schema验证）
   - 定义功能边界
3. 记录用户决策到active-bridge.md
4. 更新plan.md

**输出**: 更新的plan.md

**完成标准**:

- ✅ 所有问题已回答
- ✅ 开发原则确认完成（用户确认）
- ✅ plan.md已更新
- ✅ 最多5轮澄清

## 阶段 3: Tasks（任务拆解）

**执行者**: architecture-planning-expert

**触发条件**: Clarify阶段完成

**核心任务**:

1. 拆解任务（单个任务 ≤6小时）
2. **⭐ 在spec-api.md中定义API契约**:
   - 符合RESTful规范
   - 正确使用HTTP方法
   - 路径命名规范
   - 统一的请求/响应格式

3. **⭐ 每个接口包含成功标准**:
   - 明确的状态码
   - 响应时间要求
   - 数据格式要求

4. **⭐ 包含完整的Zod Schema定义**:
   - 请求参数schema
   - 响应数据schema
   - 错误响应schema

5. 确定优先级和依赖关系
6. 规划串行开发策略（后端→API测试→OpenAPI→前端）

7. **⭐ 拆解用户旅途导航任务**:
   - 为每个页面添加"实现返回按钮"任务
   - 标记导航任务为P0优先级
   - 使用PageHeader组件的leftContent

8. 创建tasks.md
9. 运行validate_navigation_tasks.py验证

**输出**:

- `tasks.md` - 任务看板
- `communication/spec-api.md` - API契约文档（核心）

**完成标准**:

- ✅ 任务拆解合理（单个 ≤6小时）
- ✅ spec-api.md完整
- ✅ **spec-api.md符合RESTful规范**
- ✅ **每个接口包含成功标准**
- ✅ **spec-api.md包含完整Zod schema**
- ✅ 串行开发策略清晰
- ✅ **导航任务拆解完整**（标记为P0）

**验证脚本**:

```bash
python3 scripts/validate_navigation_tasks.py \
  --plan-dir ".az/plan-xxx" \
  --user-journeys .az/plan-xxx/user-journeys.md
```

## 阶段 4: Dev（开发执行）- 串行开发

**指挥官**: architecture-planning-expert

**执行顺序**:

```
4-1: 后端开发 (AUTO_MODE协调)
  ↓
5: OpenAPI生成（独立阶段）⭐
  ↓
6-1: 后端Swagger测试 (AUTO_MODE协调)
  ↓
4-2: 前端开发 (AUTO_MODE协调)
  ↓
6-2: 前端E2E测试 (AUTO_MODE协调)
```

**⚠️ 关键依赖**:

- 前端开发必须等待后端Swagger测试100%通过
- 前端基于public/openapi.json开发，而非直接与后端通信

### 4-1: 后端开发

**执行者**: backend-expert

**触发条件**: Tasks阶段完成（spec-api.md就绪）

- 任务: 实现所有API端点
- 迭代策略: 每次实现3-4个API端点
- 完成承诺: 所有API端点实现完成，TypeScript类型检查通过，npm run build成功
- 最大迭代: 10次

**AUTO_MODE 处理**（最高优先级）:

- 每次迭代后检查active-bridge.md中的AUTO_MODE标志
- 如果存在`[AUTO_MODE]: true` → 继续下一迭代（不询问用户）
- 完成后保持AUTO_MODE标志不变
- ❌ 禁止在检测到AUTO_MODE时询问用户"继续？"

**执行流程**:

1. 迭代1: 实现端点1-3
2. 迭代2: 实现端点4-6
3. 迭代N: 实现剩余端点
4. **后端自检**:
   - TypeScript类型检查
   - 构建验证
   - API端点测试
5. 添加完整的JSDoc注释（参考用户API）
6. 标记 [STATUS]: BACKEND_READY

**完成标准**:

- ✅ 严格遵守spec-api.md契约
- ✅ 完整的JSDoc注释
- ✅ 后端自检通过（ESLint + TypeScript + API功能）

### 4-2: 前端开发

**执行者**: frontend-expert

**触发条件**: **后端Swagger测试100%通过后** ⭐

- 任务: 实现所有前端页面
- 迭代策略: 每次实现1-2个页面
- 完成承诺: 所有页面实现完成，TypeScript类型检查通过
- 最大迭代: 10次

**AUTO_MODE 处理**: 同后端

**执行流程**:

1. 迭代1: 实现页面1-2
2. 迭代2: 实现页面3-4
3. 迭代N: 实现剩余页面
4. **执行混合策略**（15分钟组件发现）:
   - 步骤1: 轻量级组件查询（5分钟）
   - 步骤2: 参考成功页面（8分钟）
   - 步骤3: 快速决策记录（2分钟）
5. 创建component-decisions.md
6. **前端自检**:
   - TypeScript类型检查
   - 代码风格检查
7. **实现所有导航功能**:
   - 每个页面有返回按钮（PageHeader的leftContent）
   - 返回按钮位置统一在左上角
   - 返回按钮功能正常
8. 标记 [STATUS]: READY

**完成标准**:

- ✅ 基于tasks.md完成所有前端任务
- ✅ 基于public/openapi.json正确集成API
- ✅ 完整的TypeScript类型
- ✅ npm run type-check通过（0错误）
- ✅ npm run lint通过
- ✅ **所有导航功能已实现**

## 阶段 5: OpenAPI（生成文档）⭐

**执行者**: backend-expert + generate-openapi-doc skill

**触发条件**: 后端Dev完成且自检通过

**⚠️ 关键**: 这是一个**独立阶段**，不属于后端开发的一部分

**执行流程**:

1. backend-expert调用generate-openapi-doc skill
2. skill自动扫描所有API路由
3. 检查JSDoc注释完整性
4. 同步JSDoc与代码实现（自动修复不一致）
5. 生成public/openapi.json
6. 生成openapi-generation.log
7. 验证Swagger UI可正常加载

**输出**:

- public/openapi.json（前后端契约的权威来源）
- openapi-generation.log

**完成标准**:

- ✅ public/openapi.json生成成功
- ✅ 所有API端点有JSDoc注释
- ✅ JSDoc与代码实现100%一致
- ✅ 符合OpenAPI 3.1规范
- ✅ Swagger UI可正常加载和显示

## 阶段 6: Test（测试执行）

**指挥官**: architecture-planning-expert

**触发条件**: OpenAPI阶段完成，public/openapi.json生成

### 6-1: 后端Swagger测试

**执行者**: test-expert

- 任务: 执行Swagger UI测试
- 迭代策略: 每次测试3-4个API端点
- 完成承诺: 所有API端点测试通过，生成swagger-test-report.md
- 最大迭代: 10次

**测试依据**:

- 主要依据1: communication/spec-api.md
- 主要依据2: communication/tasks.md

**测试方法**: Swagger UI手动测试（**不编写测试代码**）

**测试环境**: http://localhost:3000/api-docs

**执行流程**:

1. 访问Swagger UI
2. 逐一验证API端点（与spec-api.md对比）
   - 端点路径正确
   - 请求参数匹配契约
   - 响应格式匹配契约
   - 错误码匹配契约
3. Try it out功能测试
4. 测试边界和错误情况
5. 生成swagger-test-report.md

**完成标准**:

- ✅ 所有API端点测试通过（100%）
- ✅ 匹配spec-api.md契约定义（100%）
- ✅ 完成tasks.md中的所有后端任务（100%）
- ✅ 无P0错误

**⚠️ 关键**: 后端Swagger测试必须**100%通过**才能开始前端开发

### 6-2: 前端E2E测试

**执行者**: test-expert

**触发条件**: 后端Swagger测试100%通过

- 任务: 编写并执行前端E2E测试
- 迭代策略: 每次为1-2个用户故事编写E2E测试代码
- 完成承诺: 所有用户故事E2E测试通过，生成playwright-test-report.md
- 最大迭代: 10次

**测试依据**:

- 主要依据: communication/tasks.md
- 辅助依据: public/openapi.json

**测试方法**: Playwright自动化测试

**⭐ 区分两类测试**（重要）:

1. **功能测试**（P1）:
   - 验证业务逻辑正确性
   - 表单提交、数据保存、状态更新等

2. **导航测试**（**P0强制**）:
   - 验证用户旅途闭环完整性
   - 测试所有返回按钮/返回方法功能
   - 验证每个用户旅途能形成闭环
   - **测试错误场景下的导航功能**（P1）
     - 表单验证失败时的返回按钮
     - API调用失败时的返回按钮
     - 网络错误时的返回按钮
     - 权限不足页面的返回按钮
     - 数据加载失败时的返回按钮

**执行流程**:

1. 编写E2E测试代码（N次迭代）
2. 运行 `npx playwright test`
3. 生成playwright-test-report.md
4. 统计E2E覆盖率 = 100%
5. 统计闭环率 = 100%

**完成标准**:

- ✅ 所有用户故事E2E测试通过（100%）
- ✅ 关键用户流程可完成
- ✅ 无P0错误
- ✅ **用户旅途闭环率 = 100%**
- ✅ 闭环率计算: (测试通过的路径数 / 总路径数) × 100%

**🚨 P0强制检查: 导航路径测试验证**

**检查时机**: Test阶段完成后，playwright-test-report.md生成后

**检查脚本**:

```bash
python3 .claude/skills/workflow-manager/scripts/verify_closure_tests.py \
  --plan-dir ".az/plan-xxx" \
  --module $MODULE
```

**检查内容**:

1. ✅ 每个测试文件包含返回按钮测试
2. ✅ 每个测试文件包含闭环测试
3. ✅ 导航测试关键词统计
4. ✅ 区分功能测试和导航测试

**通过标准**:

- ✅ 所有测试文件包含导航测试
- ✅ 导航测试关键词 > 0
- ✅ 存在明确的返回按钮测试代码

**失败后果**:

- ❌ 如果验证失败 → 触发返工
- ❌ test-expert必须补充导航测试用例
- ❌ 重新运行测试 → 重新验证

## 阶段 7: Verification（E2E覆盖率检查）

**执行者**: architecture-planning-expert

**触发条件**: E2E测试通过（阶段6完成）

**核心任务**:

1. 阅读playwright-test-report.md检查E2E测试覆盖率
2. **⭐ 计算用户旅途闭环率**
3. 确认E2E测试覆盖所有用户故事
4. 确认E2E测试执行证据完整
5. **运行验证脚本**

**完整验证流程**:

**步骤1: 阅读测试报告**

- 检查测试用例数量
- 检查通过/失败数量
- 检查测试覆盖率统计
- 检查截图证据路径
- 检查测试执行时间

**步骤2: 检查E2E测试覆盖率**

```bash
bash .claude/skills/workflow-manager/scripts/verify-e2e-executed.sh .az/plan-xxx $MODULE
```

此脚本检查:

1. ✅ E2E测试文件存在
2. ✅ communication/active-bridge.md有Playwright测试记录
3. ✅ 测试执行证据存在（passed/failed/screenshot）
4. ✅ 非pending状态

**步骤3: ⭐ 计算用户旅途闭环率**

```bash
python3 .claude/skills/workflow-manager/scripts/calculate_closure_rate.py \
  --plan-dir ".az/plan-xxx" \
  --report-type playwright \
  --min-rate 100
```

输出示例:

```json
{
  "total_paths": 11,
  "closed_paths": 11,
  "closure_rate": 100,
  "unclosed_paths": []
}
```

\*\*步骤4: 验证结果评估

**情况A: 两个指标都达标** ✅

```
E2E覆盖率 = 100% 且 用户旅途闭环率 = 100%
→ 标记 [STATUS]: VERIFICATION_PASSED
→ 进入QA阶段
```

**情况B: 任一指标不达标** ❌

```
E2E覆盖率 < 100% 或 用户旅途闭环率 < 100%
→ 触发返工流程
```

**步骤5: 覆盖率不达标时的补充机制**

**如果E2E覆盖率 < 100%**:

```
架构专家通知test专家: "继续补充E2E测试"
→ test专家补充测试用例
→ test专家重新运行E2E测试
→ test专家生成新的playwright-test-report.md
→ 架构专家重新执行Verification阶段
```

**如果用户旅途闭环率 < 100%**:

```
架构专家通知frontend-expert: "补充返回按钮实现"
→ frontend-expert补充导航功能
→ 架构专家通知test-expert: "重新运行E2E测试"
→ test-expert重新运行测试
→ test-expert生成新的playwright-test-report.md
→ 架构专家重新执行Verification阶段
```

**完成标准**:

- ✅ **E2E测试覆盖率 = 100%**
- ✅ **用户旅途闭环率 = 100%**
- ✅ E2E测试覆盖所有用户故事
- ✅ E2E测试执行证据完整
- ✅ 验证脚本检查通过

**阻塞条件**:

- ❌ E2E测试文件不存在
- ❌ E2E测试从未运行
- ❌ E2E测试标记为"pending verification"
- ❌ 无测试执行证据
- ❌ E2E测试覆盖率 < 100%
- ❌ 用户旅途闭环率 < 100%
- ❌ 关键用户流程缺失

## 阶段 8: QA（质量审计）

**执行者**: qa-expert

**触发条件**: Verification阶段通过

**核心任务**:

1. **⭐ API契约完整性检查**（步骤1）
2. **⭐ 用户旅途闭环完整性验收**（步骤2）
3. 审计测试覆盖率
4. 检查功能完整性和开发原则合规性
5. 运行构建验证: `npm run build`
6. 启动开发服务器: `npm run dev`
7. 撰写qa-report.md
8. **拥有任务关闭的最终否决权**

### QA步骤1: ⭐ API契约完整性检查

**检查方法**:

```bash
# 1. 统计spec-api.md中定义的API端点数
API_COUNT=$(grep -E "^POST|^GET|^DELETE|^PATCH" .az/plan-*/spec-api.md | wc -l)

# 2. 检查每个端点的实现文件是否存在
# 3. 使用curl/postman测试每个端点是否可访问
# 4. 验证响应格式是否匹配spec-api.md定义
```

**如果发现缺失的API端点**:

```markdown
🚨 这是P0阻塞问题，必须FAIL并触发返工:

1. 记录到qa-report.md: API实现不完整
2. 列出所有缺失的端点
3. 标记QA结果为FAIL
4. 触发返工流程: 返回Dev阶段补充实现
5. 重新执行: Test → Verification → QA
```

### QA步骤2: ⭐ 用户旅途闭环完整性验收

**验证方法**: 手动验证所有用户旅途的闭环

```bash
# 启动开发服务器
npm run dev &

# 打开浏览器手动测试所有用户旅途（根据user-journeys.md）
```

**手动验证清单**:

- [ ] 旅途1: [旅途名称]
  - [ ] 步骤1: [操作描述] → 验证返回按钮存在
  - [ ] 步骤2: [操作描述] → 点击返回按钮
  - [ ] 步骤3: 验证返回到上一页或预期页面
- [ ] 旅途2: [旅途名称]
  - [ ] ...（验证每个旅途）

**闭环率计算**:

```bash
闭环率 = (手动验证通过的路径数 / 总路径数) × 100%
目标: 闭环率 = 100%
```

**验收标准**:

- ✅ 闭环率 = 100%: PASS
- ❌ 闭环率 < 100%: FAIL → 触发返工

**如果发现未闭环路径**:

```markdown
🚨 这是P0阻塞问题，必须FAIL并触发返工:

1. 记录到qa-report.md: 用户旅途闭环率 < 100%
2. 列出所有未闭环路径
3. 标记QA结果为FAIL
4. 触发返工流程: frontend-expert修复未闭环路径
5. 重新执行: Test → Verification → QA
```

### QA步骤3: 质量验收

```bash
npm run build
npm run dev
```

**最终验收决策**:

**所有验收标准满足**:

- ✅ npm run build 成功
- ✅ npm run dev 启动成功
- ✅ API端点100%实现
- ✅ 用户旅途闭环率 = 100%
- ✅ qa-report.md已撰写
  → QA阶段通过 ✅，项目完成！

**验收标准未满足**:

- ❌ 任一条件不满足
  → 触发返工

**完成标准**:

- ✅ npm run build 必须成功
- ✅ npm run dev 启动成功
- ✅ 测试覆盖率达标
- ✅ API契约完整性检查通过
- ✅ 用户旅途闭环率 = 100%
- ✅ qa-report.md已撰写
- ✅ QA专家拥有最终否决权

## 阶段 9: Security Review（安全审查）⭐ 新增

**执行者**: security-reviewer agent

**触发条件**: QA阶段通过

**核心任务**:

### 1. 依赖安全检查

**检查方法**:

```bash
npm audit --audit-level=high
```

**检查内容**:

- 检查有漏洞的依赖包
- 识别严重（Critical）和高危（High）漏洞
- 验证依赖版本兼容性

**完成标准**:

- ✅ 无严重（Critical）安全漏洞
- ✅ 高危（High）漏洞≤3个

### 2. 密钥泄露检测

**检查方法**:

```bash
# 检查硬编码密钥
grep -r "api[_-]?key\|password\|secret\|token" \
  --include="*.js" --include="*.ts" --include="*.json" \
  --exclude-dir=node_modules --exclude-dir=.next .
```

**检查内容**:

- 硬编码的API密钥
- 硬编码的密码
- 硬编码的令牌（token）
- 敏感配置信息

**完成标准**:

- ✅ 无硬编码密钥泄露
- ✅ 所有敏感信息使用环境变量

### 3. OWASP Top 10分析

**检查类别**:

#### 3.1 注入漏洞

- ✅ SQL注入检查
- ✅ NoSQL注入检查
- ✅ 命令注入检查
- ✅ LDAP注入检查

**检查方法**:

```typescript
// ❌ 错误: 直接拼接SQL
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ 正确: 使用参数化查询
const { data } = await supabase.from('users').select('*').eq('id', userId);
```

#### 3.2 认证和授权

- ✅ 密码哈希检查（bcrypt、argon2）
- ✅ JWT验证检查
- ✅ 会话安全检查
- ✅ 权限控制检查

#### 3.3 敏感数据暴露

- ✅ HTTPS强制检查
- ✅ 敏感数据加密检查
- ✅ 日志清理检查
- ✅ 错误消息安全检查

#### 3.4 XSS和SSRF

- ✅ XSS防护检查（DOMPurify）
- ✅ SSRF防护检查（URL白名单）

### 4. 代码安全审查

**审查范围**:

#### 4.1 输入验证

- ✅ 用户输入清理
- ✅ 参数化查询
- ✅ 类型验证（Zod schema）

#### 4.2 访问控制

- ✅ 授权检查
- ✅ 权限验证
- ✅ 资源所有权检查

#### 4.3 速率限制

- ✅ API速率限制
- ✅ 防暴力破解
- ✅ DDoS防护

#### 4.4 日志安全

- ✅ 日志清理
- ✅ 敏感信息过滤
- ✅ 审计日志

### 5. 生成安全报告

**输出**: `security-review-report.md`

**报告内容**:

- 依赖安全检查结果
- 密钥泄露检测结果
- OWASP Top 10分析结果
- 代码安全审查结果
- 发现的问题清单（按严重程度分类）
- 修复建议

**完成标准**:

- ✅ 无严重（Critical）安全漏洞
- ✅ 高危（High）漏洞≤3个
- ✅ 无硬编码密钥泄露
- ✅ OWASP Top 10检查通过
- ✅ 安全报告完成

**阻塞条件**:

- ❌ 发现严重（Critical）安全漏洞
- ❌ 发现硬编码密钥/密码
- ❌ 高危漏洞>3个
- ❌ 存在SQL注入、XSS、命令注入

### 返工触发

**触发返工当**:

- ❌ 发现严重安全漏洞
- ❌ 发现硬编码密钥/密码
- ❌ 高危漏洞>3个

**返工流程**:

```
security-reviewer发现安全问题
→ 标记 [STATUS]: SECURITY_ISSUES_FOUND
→ 在tasks.md创建修复任务（S1, S2...）
→ 架构专家分析并分配修复任务
→ Dev阶段修复（backend-expert或frontend-expert）
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

**状态流转** ⭐ 新增:

```
SECURITY_REVIEWING → SECURITY_ISSUES_FOUND → SECURITY_FIXING → SECURITY_FIXED → RE_SECURITY_REVIEWING ⭐ → SECURITY_REVIEW_PASSED ⭐ → COMPLETE
```

**返工次数限制**:

- 同一安全问题: 最多3次返工
- 超过3次 → 升级处理（架构专家决策）
