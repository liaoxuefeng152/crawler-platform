# Workflow Manager Key References

关键工作流参考文档集合

## 目录

1. [串行开发策略](#serial-development)
2. [用户旅途闭环6阶段验证](#user-journey-closure)
3. [返工机制](#rework-mechanism)
4. [质量标准与验收条件](#quality-standards)

---

## 1. 串行开发策略 {#serial-development}

### 为什么选择串行而不是并行？

**质量原因**（核心）:

- ✅ 后端先完成并生成OpenAPI文档
- ✅ 前端基于**测试通过的openapi.json**开发，API契约稳定可靠
- ✅ 后端API问题在Swagger测试中及时发现，不影响前端
- ✅ 前端可触发后端返工（局部测试），反馈循环更快
- ✅ 符合功能完整开发原则（功能完整性优先）

### 执行顺序（重要）

```
2. backend-expert分N次迭代实现所有API端点（每次3-4个API）
3. backend-expert执行后端自检（代码质量 + API功能）
4. backend-expert调用generate-openapi-doc skill生成public/openapi.json
5. backend-expert标记 [STATUS]: BACKEND_READY
6. 进入阶段5：OpenAPI生成（独立阶段）
7. test-expert执行后端Swagger测试（100%通过）⚠️ 前置条件
9. frontend-expert分N次迭代实现所有前端页面（每次1-2个页面）
10. frontend-expert执行前端自检
```

**⚠️ 关键依赖**:

- 前端开发必须等待后端Swagger测试100%通过
- 前端基于public/openapi.json开发，而不是直接与后端通信
- 后端Swagger测试是前后端之间的质量关卡

---

## 2. 用户旅途闭环6阶段验证 {#user-journey-closure}

### Plan阶段：设计用户旅程

1. 识别所有主要用户旅程
2. 定义可视化入口（眼睛看得到）
3. 定义可操作路径（鼠标点得到）
4. 确保每个页面都有返回方式
5. 计算预期闭合率=100%
6. 创建user-journeys.md
7. 运行validate_user_journeys.py验证

### Tasks阶段：拆解导航任务

1. 根据user-journeys.md识别所有需要实现的导航功能
2. 为每个页面添加"实现返回按钮"任务
3. 为每个操作路径添加"实现导航功能"任务
4. 确保tasks.md包含所有导航相关任务
5. 标记导航任务的优先级为P0
6. 使用PageHeader组件的leftContent属性统一实现
7. 运行validate_navigation_tasks.py验证

### Dev阶段：实现导航功能

1. 每个页面都有返回按钮（使用PageHeader的leftContent属性）
2. 返回按钮位置统一在页面左上角
3. 返回按钮功能正常（调用router.back()或指定路由）
4. 表单取消按钮能正确返回到上一页
5. 所有导航功能符合user-journeys.md设计

### Test阶段：编写导航测试

1. 区分两类测试：功能测试 + 导航测试（P0强制）
2. 编写导航测试（P0强制）
   - 测试返回按钮功能
   - 测试闭环完整性
   - 测试异常场景导航（P1）
3. 运行 npx playwright test
4. 生成playwright-test-report.md
5. 统计闭合率=100%
6. 运行verify_closure_tests.py验证

### Verification阶段：检查闭合率

1. 阅读playwright-test-report.md
2. 运行calculate_closure_rate.py计算闭合率
3. 验证闭合率=100%
4. 如果闭合率 < 100%，触发返工：frontend-expert补充实现导航功能

### QA阶段：手动验证闭环

1. 启动开发服务器 npm run dev
2. 手动验证所有用户旅程（根据user-journeys.md）
3. 手动验证清单：
   - 旅程1: [旅程名称]
     - 步骤1: [操作描述] → 验证返回按钮存在
     - 步骤2: [操作描述] → 点击返回按钮
     - 步骤3: 验证返回到上一页或预期页面
4. 计算闭合率 = (手动验证通过的路径数 / 总路径数) × 100%
5. 目标：闭合率 = 100%
6. 如果闭合率 < 100%，触发返工

---

## 4. 返工机制 {#rework-mechanism}

### 触发返工的条件

#### Test阶段

1. ✅ 关键错误数量 > 0
2. ✅ 核心功能测试失败率 > 20%
3. ✅ 测试覆盖率 < 100%
4. ✅ TypeScript类型错误（核心代码）
5. ✅ **虚假测试（只描述不执行）**
6. ✅ **后端Swagger测试未执行**

#### Verification阶段

1. ✅ E2E测试覆盖率 < 100%
2. ✅ 用户旅程闭合率 < 100%
3. ✅ 遗漏关键用户流程
4. ✅ E2E测试执行证据不完整
5. ✅ TypeScript类型检查失败

#### QA阶段

1. ✅ npm run build 失败
2. ✅ npm run dev 启动失败
3. ✅ 关键功能不可用
4. ✅ 测试覆盖率 < 100%
5. ✅ 核心测试失败率 > 20%
6. ✅ **API端点未100%实现**
7. ✅ **用户旅程闭合率 < 100%**

### 返工次数限制

- 同一问题最多返工5次
- 超过需升级处理

### 返工恢复流程

**⚠️ 关键原则**: R1返工完成后，**必须重新执行Test阶段**

```
Test专家发现关键错误
→ 标记 [STATUS]: NEEDS_FIX
→ 在tasks.md创建修复任务（R1, R2...）
→ 架构专家分配修复任务
→ Dev阶段修复
→ Dev标记 [STATUS]: FIXED
→ 架构专家验证修复完整性
→ 🚨 架构专家明确通知Test专家："开始重新Test" ⭐ 关键环节
→ Test专家标记 [STATUS]: RE_TESTING ⭐ 新增状态
→ Test专家执行完整测试步骤：
  1. 后端：访问Swagger UI进行手动测试
  2. 前端：运行 npx playwright test
  3. 记录测试结果（passed/failed/screenshot）
  4. 标记 [STATUS]: TEST_PASSED ⭐ 新增状态
→ 只有上述步骤全部完成后，才能标记 TEST_READY_FOR_VERIFICATION
→ 进入Verification阶段
```

### 状态流转图

```
TESTING → NEEDS_FIX → FIXING → FIXED → RE_TESTING ⭐ → TEST_PASSED ⭐ → READY_FOR_VERIFICATION
```

---

## 5. 质量标准与验收条件 {#quality-standards}

### 质量标准

| 指标                  | 标准值 | 备注                      |
| --------------------- | ------ | ------------------------- |
| E2E测试覆盖率         | = 100% | 核心代码                  |
| 用户旅程闭合率        | = 100% | 可量化指标                |
| API契约完整性         | 100%   | 所有spec-api.md定义的端点 |
| 后端Swagger测试通过率 | 100%   | 所有API端点               |
| 前端E2E测试通过率     | 100%   | 所有用户故事              |

### 各阶段验收条件

#### Plan阶段

- ✅ 需求清晰且可理解
- ✅ 业务边界明确
- ✅ 开发原则确认完成
- ✅ 用户旅程设计完成
- ✅ 预期闭合率=100%

#### Clarify阶段

- ✅ 所有问题得到解答
- ✅ 开发原则确认完成（用户确认）
- ✅ plan.md更新完成

#### Tasks阶段

- ✅ 任务拆解合理（单个≤6小时）
- ✅ 每个任务包含子任务清单和迭代计划
- ✅ spec-api.md定义完整
- ✅ spec-api.md符合RESTful设计规范
- ✅ 每个接口包含成功标准
- ✅ spec-api.md包含完整Zod Schema定义
- ✅ 导航任务拆解完整（标记为P0）

#### Dev阶段

- ✅ 严格遵守spec-api.md契约
- ✅ 完整的JSDoc注释
- ✅ 后端自检通过（ESLint + TypeScript + API功能）
- ✅ OpenAPI文档生成成功
- ✅ 基于tasks.md完成所有前端任务
- ✅ npm run type-check通过（0错误）
- ✅ npm run lint通过
- ✅ 所有导航功能实现完成

#### Test阶段

- ✅ 后端Swagger测试已真实执行（100%通过）
- ✅ 前端E2E测试已真实执行
- ✅ 测试结果写入communication/active-bridge.md
- ✅ swagger-test-report.md已生成
- ✅ playwright-test-report.md已生成
- ✅ E2E测试执行日志已记录（passed/failed）
- ✅ 发现真实UI问题（不是0个问题）
- ✅ 导航测试验证通过

#### Verification阶段

- ✅ E2E测试覆盖率 = 100%
- ✅ 用户旅程闭合率 = 100%
- ✅ E2E测试覆盖所有用户故事
- ✅ E2E测试执行证据完整
- ✅ 验证脚本检查通过

#### QA阶段

- ✅ npm run build 必须成功
- ✅ npm run dev 启动成功
- ✅ API端点100%实现
- ✅ 用户旅程闭合率=100%
- ✅ qa-report.md撰写完成
- ✅ QA专家拥有最终否决权
