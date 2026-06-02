# Tasks Template

任务看板模板

## 文档信息

- **功能名称**: [功能名称]
- **创建日期**: [YYYY-MM-DD]
- **版本**: v1.0
- **作者**: [架构专家]

## 开发策略

- **开发模式**: 串行开发（后端 → OpenAPI → Swagger测试 → 前端）
- **技术栈**: Next.js 16 + React 19 + TypeScript + shadcn/ui + Tailwind CSS 4 + Zustand + Axios
- **数据存储**: Prisma + MongoDB（生产级存储）

## 任务看板

### 后端任务 (Backend)

#### API实现任务

- [ ] **[P0] 实现API端点1: [端点名称]**
  - HTTP方法: [GET/POST/DELETE/PATCH]
  - 路径: [/api/xxx]
  - 依据: spec-api.md
  - 迭代: 第1次迭代
  - 子任务:
    - [ ] 创建API路由文件
    - [ ] 实现请求参数验证（Zod）
    - [ ] 实现业务逻辑
    - [ ] 添加JSDoc注释
    - [ ] 本地测试

- [ ] **[P0] 实现API端点2: [端点名称]**
  - [按照上述结构...]

#### OpenAPI生成任务

- [ ] **[P0] 生成OpenAPI文档**
  - 调用generate-openapi-doc skill
  - 验证public/openapi.json生成成功
  - 验证Swagger UI可访问
  - 生成openapi-generation.log

### 前端任务 (Frontend)

**⚠️ 前置条件**: 后端Swagger测试100%通过

#### 页面实现任务

- [ ] **[P0] 实现页面1: [页面名称]**
  - 依据: tasks.md
  - 迭代: 第1次迭代
  - 子任务:
    - [ ] 执行15分钟组件发现策略
    - [ ] 创建页面组件
    - [ ] 集成API（基于public/openapi.json）
    - [ ] 实现表单/列表/详情功能
    - [ ] **[P0] 实现返回按钮（PageHeader.leftContent）**
    - [ ] TypeScript类型定义
    - [ ] 前端自检

- [ ] **[P0] 实现页面2: [页面名称]**
  - [按照上述结构...]

#### 导航功能任务 (P0强制)

- [ ] **[P0] 实现页面1返回按钮**
  - 使用PageHeader组件的leftContent属性
  - 返回到: [上一页/首页/指定页面]
  - 功能: router.back() 或指定路由

- [ ] **[P0] 实现页面2返回按钮**
  - [按照上述结构...]

- [ ] **[P0] 实现表单取消按钮返回功能**
  - 表单验证失败时返回按钮可用
  - 调用router.back()

### 测试任务 (Test)

#### 后端Swagger测试任务

- [ ] **[P0] Swagger UI测试: API端点1**
  - 依据: spec-api.md
  - 测试环境: http://localhost:3000/api-docs
  - 迭代: 第1次迭代
  - 测试项:
    - [ ] 端点路径正确
    - [ ] 请求参数与契约一致
    - [ ] 响应格式与契约一致
    - [ ] 错误码与契约一致
    - [ ] Try it out功能测试

- [ ] **[P0] Swagger UI测试: API端点2**
  - [按照上述结构...]

#### 前端E2E测试任务

- [ ] **[P0] E2E测试: 用户故事1**
  - 依据: tasks.md
  - 测试框架: Playwright
  - 迭代: 第1次迭代
  - 测试类型:
    - [ ] 功能测试（P1）
    - [ ] **[P0] 导航测试：返回按钮功能**
    - [ ] **[P0] 导航测试：闭环完整性**
    - [ ] **[P1] 导航测试：异常场景返回**

- [ ] **[P0] E2E测试: 用户故事2**
  - [按照上述结构...]

## 验证清单

### Plan阶段验证
- [ ] 运行validate_user_journeys.py
- [ ] 用户旅程数量 ≥ 3
- [ ] 预期闭合率 = 100%

### Tasks阶段验证
- [ ] 运行validate_navigation_tasks.py
- [ ] 导航任务标记为P0
- [ ] API契约定义完整

### Dev阶段验证
- [ ] 后端: ESLint + TypeScript + API功能测试
- [ ] 前端: npm run type-check + npm run lint
- [ ] OpenAPI文档生成成功

### Test阶段验证
- [ ] 后端Swagger测试100%通过
- [ ] 前端E2E测试执行完成
- [ ] 运行verify_closure_tests.py验证导航测试

### Verification阶段验证
- [ ] E2E测试覆盖率 = 100%
- [ ] 用户旅程闭合率 = 100%
- [ ] 运行calculate_closure_rate.py

### QA阶段验证
- [ ] npm run build成功
- [ ] npm run dev启动成功
- [ ] API端点100%实现
- [ ] 用户旅程闭合率=100%

## 优先级说明

- **P0**: 必须完成，阻塞问题
- **P1**: 重要，建议完成
- **P2**: 可选，后续优化

## 依赖关系

```
后端任务 → OpenAPI生成 → Swagger测试 → 前端任务 → E2E测试
```

## 迭代计划

### 后端开发迭代
- 第1次迭代: API端点1-3
- 第2次迭代: API端点4-6
- 第N次迭代: 剩余API端点

### 前端开发迭代
- 第1次迭代: 页面1-2
- 第2次迭代: 页面3-4
- 第N次迭代: 剩余页面

## AUTO_MODE设置

在`communication/active-bridge.md`中设置：

```markdown
[AUTO_MODE]: true
```

启用后将自动迭代，无需用户确认。
