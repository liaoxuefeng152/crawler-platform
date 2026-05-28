# 错误分类系统参考

本文档提供完整的错误分类体系，用于测试专家对发现的问题进行准确分类。

## 📋 错误分类总览

### Next.js 错误分类（增强版）

| 错误类型 | 中文标签 | 描述 | 优先级 | 返工目标 |
|------------|--------------|-------------|----------|-----------|
| **MODULE_RESOLUTION_ERROR** | 模块解析错误 | Can't resolve import path | P0 | Dev 阶段 |
| **CSS_IMPORT_ERROR** | CSS导入错误 | CSS module import failed | P0 | frontend-expert |
| **TYPESCRIPT_ERROR** | TypeScript类型错误 | Type mismatch, TS errors | P0 | Dev 阶段 |
| **TURBOPACK_BUILD_ERROR** | Turbopack构建错误 | Build compilation error | P0 | Dev 阶段 |
| **HYDRATION_ERROR** | 水合错误 | Server/client mismatch | P1 | frontend-expert |
| **COMPONENT_RUNTIME_ERROR** | 组件运行时错误 | Component crash | P1 | frontend-expert |
| **API_ROUTE_ERROR** | API路由错误 | Backend API failed | P1 | backend-expert |
| **NETWORK_TIMEOUT_ERROR** | 网络超时错误 | Request timeout | P2 | Dev/Infra |
| **NETWORK_CONNECTION_ERROR** | 网络连接错误 | Connection refused | P2 | Dev/Infra |

### 传统错误分类

| 错误类型 | 中文标签 | 描述 | 返工目标 |
|------------|--------------|-------------|-----------|
| **Backend Contract Violation** | 后端契约违背 | API doesn't match spec-api.md | backend-expert |
| **Frontend UI Exception** | 前端UI异常 | Element not found, interaction fails | frontend-expert |
| **Build Failure** | 构建失败 | General build issues | Dev 阶段 |

---

## 优先级定义

### P0 - 阻塞性错误（必须立即修复）

**特征**：
- 构建完全失败
- 应用无法启动
- 核心功能完全不可用

**处理**：
- 立即停止测试
- 触发返工流程
- 阻塞进入QA阶段

**示例**：
```
Module not found: Can't resolve './styles/Login.module.css'
Type error: Property 'onClick' does not exist on type 'HTMLElement'
Turbopack build error: Unexpected token
```

### P1 - 严重错误（影响核心功能）

**特征**：
- 构建成功但运行时错误
- 核心功能异常
- 用户体验严重受损

**处理**：
- 记录详细错误
- 路由到对应专家
- 在完成当前测试循环后修复

**示例**：
```
Hydration failed: Text content does not match
Runtime Error: Cannot read property 'map' of undefined
API route error: 500 Internal Server Error
```

### P2 - 一般错误（不影响主要流程）

**特征**：
- 边缘场景问题
- 环境相关问题
- 非关键路径错误

**处理**：
- 记录到报告
- 建议修复时机
- 不阻塞测试流程

**示例**：
```
Network timeout: Request took too long
Connection refused: Development server not running
Console warning: Deprecated API usage
```

---

## 错误检测策略

### 1. Next.js 开发错误覆盖层检测

**监视指标**：
- `next-dev-overlay` 元素存在性
- `[data-next-dev-overlay]` 属性
- 带有"Copy"按钮的错误覆盖层出现
- 红色/彩色错误边界

### 2. 控制台错误监控

**捕获内容**：
- `console.error()` 消息
- 未捕获的异常
- 失败的网络请求
- React 水合错误

### 3. 运行时错误检测

**检测内容**：
- 组件崩溃（错误边界）
- 白屏死机
- 无限加载状态
- UI 渲染中断

---

## 错误信息提取协议

### 优先级顺序

#### Step 1: 尝试"复制"按钮（PRIORITY - ALWAYS TRY FIRST）

**选择器优先级**：
```typescript
const COPY_BUTTON_SELECTORS = [
  'button:has-text("复制")',
  'button:has-text("Copy")',
  'button:has-text("Copy Error")',
  '[aria-label="Copy"]',
  'next-dev-overlay button[title="Copy"]',
  '.copy-button'
];
```

**实现**：
```typescript
for (const selector of COPY_BUTTON_SELECTORS) {
  const button = page.locator(selector).first();
  if (await button.isVisible({ timeout: 2000 })) {
    await button.click();
    await page.timeout(500); // 等待剪贴板复制

    const clipboardText = await page.evaluate(() =>
      navigator.clipboard.readText()
    );

    if (clipboardText && clipboardText.length > 0) {
      return { method: 'copy-button', content: clipboardText };
    }
  }
}
```

#### Step 2: 降级方案 - DOM 提取

如果复制按钮失败或不可用：

```typescript
const errorInfo = {
  title: await page.locator('h1, h2, [data-error-title]').first().text_content(),
  message: await page.locator('pre, code, [data-error-message]').first().text_content(),
  stack: await page.locator('[data-error-stack]').first().text_content(),
  location: await page.locator('[data-error-frame]').first().get_attribute('src')
};
```

#### Step 3: 补充证据

同时捕获：
- **截图**：用于视觉参考的全页截图
- **页面 URL**：错误发生的当前 URL
- **控制台日志**：所有 `console.error()` 消息
- **网络日志**：失败的请求（如有）
- **测试步骤**：当前执行的测试步骤

---

## 返工目标映射

### 返工目标决策树

```
检测到错误
    ↓
错误类型分类
    ↓
判断优先级
    ↓
┌─────────────┬─────────────┬─────────────┐
│   P0 错误   │   P1 错误   │   P2 错误   │
└─────────────┴─────────────┴─────────────┘
      ↓             ↓             ↓
  Dev 阶段      具体专家      Dev/Infra
      ↓             ↓             ↓
  立即返工      记录并返工      建议修复
```

### 目标专家职责

**Dev 阶段**：
- 修复模块解析错误
- 修复 TypeScript 类型错误
- 修复 Turbopack 构建错误

**frontend-expert**：
- 修复 CSS 导入错误
- 修复 React 水合错误
- 修复组件运行时错误

**backend-expert**：
- 修复 API 路由错误
- 修复服务端组件错误

**Dev/Infra**：
- 修复网络超时错误
- 修复网络连接错误
- 修复环境配置问题

---

## 错误报告格式

### active-bridge.md 错误模板

```markdown
### ❌ 测试执行失败 - Next.js错误

#### 错误分类
- **错误类型**: [MODULE_RESOLUTION_ERROR]
- **优先级**: [P0]
- **检测方法**: [copy-button / dom-extraction]

#### 完整错误信息
```
[从Next.js复制按钮获取的完整错误文本]
Module not found: Can't resolve './styles/Login.module.css'
./app/sports/login/page.tsx:8:1
...
```

#### 发生场景
- **测试用例**: user-profile-load.spec.ts:15
- **页面URL**: http://localhost:3000/sports/profile
- **测试步骤**: 导航到个人中心页面

#### 辅助证据
- **截图**: `/test-reports/errors/nextjs-error-1234567890.png`
- **控制台**: `console-errors.log`

#### 返工目标
- **返回给**: [Dev / frontend-expert / backend-expert]
- **修复任务**: [R1] 修复导入路径为 `../styles/Login.module.css`
- **验证方法**: 重新运行 `npm run build` 和 E2E测试
```

---

## 错误统计和分析

### 测试报告统计格式

```markdown
## 错误统计汇总

### 按类型分类
- MODULE_RESOLUTION_ERROR: 3个
- HYDRATION_ERROR: 2个
- API_ROUTE_ERROR: 1个
- NETWORK_TIMEOUT_ERROR: 1个

### 按优先级分类
- P0（阻塞性）: 3个
- P1（严重性）: 3个
- P2（一般性）: 1个

### 按返工目标分类
- Dev 阶段: 4个
- frontend-expert: 2个
- backend-expert: 1个
- Dev/Infra: 1个
```

---

## 错误模式库

### 常见错误模式索引

| 模式ID | 模式名称 | 错误类型 | 修复方法 |
|--------|----------|----------|----------|
| P001 | CSS模块路径错误 | CSS_IMPORT_ERROR | 修正相对路径 |
| P002 | 缺少'use client' | COMPONENT_RUNTIME_ERROR | 添加客户端指令 |
| P003 | 图片缺少尺寸 | MODULE_RESOLUTION_ERROR | 添加width/height |
| P004 | 服务端操作非异步 | API_ROUTE_ERROR | 添加async关键字 |
| P005 | 类型不匹配 | TYPESCRIPT_ERROR | 类型修正 |

**使用模式库**：
1. 识别错误模式ID
2. 查找对应修复方法
3. 应用修复并验证

---

## 最佳实践

### 错误捕获原则

1. **完整性优先**：始终优先使用复制按钮获取完整错误
2. **多源验证**：结合截图、控制台、网络日志多种证据
3. **准确分类**：使用分类体系准确识别错误类型
4. **快速响应**：P0/P1错误立即触发返工
5. **详细记录**：记录所有上下文信息以便复现

### 错误报告原则

1. **结构化**：使用标准模板确保信息完整
2. **可操作**：提供具体的修复建议
3. **可追溯**：记录时间、URL、测试步骤
4. **优先级清晰**：明确标注错误优先级
5. **目标明确**：指定返工目标和验证方法

---

**相关文档**：
- [Next.js 错误处理指南](./nextjs-error-handling-guide.md)
- [测试模板库](./test-templates.md)
- [test-expert Agent](../../.claude/agents/test-expert.md)
