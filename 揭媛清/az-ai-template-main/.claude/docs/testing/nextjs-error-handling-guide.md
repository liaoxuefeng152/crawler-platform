# Next.js 错误处理指南（测试专家专用）

本文档提供测试专家在执行E2E测试时处理Next.js错误的详细指南。

## 📋 目录

1. [Next.js 架构理解](#next.js-架构理解)
2. [错误分类体系](#错误分类体系)
3. [错误消息模式识别](#错误消息模式识别)
4. [错误捕获工具函数](#错误捕获工具函数)
5. [常见错误模式和修复方法](#常见错误模式和修复方法)
6. [错误检查清单](#错误检查清单)

---

## Next.js 架构理解

### Next.js 16 核心概念

**Turbopack**（Next.js 16 默认打包工具）:
- 错误格式：与 Webpack 不同
- 错误覆盖层：使用 `<dialog role="dialog">` 元素
- 模块解析：可能显示不同的错误消息
- HMR（热模块替换）：更快，不同的错误模式

**App Router**（Next.js 13+）:
- 基于 `/app` 目录的文件路由
- 服务端组件 vs 客户端组件
- 路由特定的错误边界
- 通过 `error.tsx` 文件处理错误

**构建流程**:
```
源代码 → Turbopack → 编译 → 服务端包 → 客户端包
                     ↓ (如果出错)
                  构建错误覆盖层
```

---

## 错误分类体系

### 完整错误分类表

| 类别 | 子类型 | 模式 | 优先级 | 返工目标 |
|----------|---------|---------|----------|----------|
| **构建错误** | 模块解析 | `Can't resolve`, `Module not found` | P0 | Dev 阶段 |
| | CSS 导入 | `CSS import error`, `.module.css` | P0 | frontend-expert |
| | TypeScript | `Type error`, `TS2307` | P0 | Dev 阶段 |
| | Turbopack | `Turbopack build error` | P0 | Dev 阶段 |
| **运行时错误** | 组件崩溃 | `TypeError`, `ReferenceError` | P1 | frontend-expert |
| | React 水合 | `Hydration failed`, `Text content mismatch` | P1 | frontend-expert |
| | 数据获取 | `Failed to fetch`, `API route error` | P1 | backend-expert |
| **服务端错误** | API 路由 | `500 Internal Server Error` | P1 | backend-expert |
| | 服务端组件 | `Server Component error` | P1 | backend-expert |
| **网络错误** | 超时 | `timeout`, `ETIMEDOUT` | P2 | Dev/Infra |
| | 连接 | `ECONNREFUSED`, `fetch failed` | P2 | Dev/Infra |

---

## 错误消息模式识别

### 模块解析错误
```
❌ 错误: Module not found: Can't resolve './styles/Profile.module.css'
✅ 修复: 检查相对路径，使用 '../'或 '@/'

模式关键词:
- "Can't resolve"
- "Module not found"
- "Unable to locate"
```

### 导入/导出错误
```
❌ 错误: Syntax error: Unexpected token, expected "{"
✅ 修复: 检查 import/export 语法

模式关键词:
- "Unexpected token"
- "Unexpected identifier"
- "Import declaration"
```

### TypeScript 错误
```
❌ 错误: Type 'string' is not assignable to type 'number'
✅ 修复: 类型修正或类型断言

模式关键词:
- "Type error"
- "TS"
- "is not assignable"
- "Property does not exist"
```

### React 水合错误
```
❌ 错误: Hydration failed because the initial UI doesn't match
✅ 修复: 确保服务端/客户端渲染一致性

模式关键词:
- "Hydration failed"
- "Text content does not match"
- "There was an error while hydrating"
```

### API 路由错误
```
❌ 错误: API route failed with status 500
✅ 修复: 检查 API 处理代码

模式关键词:
- "/api/"
- "API route"
- "500"
- "Internal Server Error"
```

---

## 错误捕获工具函数

参考实现位于：`tests/utils/error-capture.ts`

### 核心 API

```typescript
import { captureNextJSError, classifyError, determinePriority } from '@/tests/utils/error-capture';

// 在Playwright测试中使用
test('example', async ({ page }) => {
  await page.goto('/some-page');

  const hasError = await page.locator('dialog[role="dialog"]').count() > 0;
  if (hasError) {
    const errorReport = await captureNextJSError(page);
    // errorReport 包含: type, priority, content, screenshotPath, url
  }
});
```

---

## 常见错误模式和修复方法

### 模式 1: CSS 模块导入错误
```
错误: Can't resolve './styles/Profile.module.css'
原因: 子目录中的相对路径错误
修复: 将 './styles/' 改为 '../styles/'
检测: 检查页面文件是否在子目录中（例如 /app/sports/profile/）
```

### 模式 2: 客户端组件导入错误
```
错误: You're importing a component that needs useState
原因: 缺少 'use client' 指令
修复: 在文件顶部添加 'use client'
检测: 错误消息提到 "useState" 或 "useReducer"
```

### 模式 3: 服务端操作错误
```
错误: Server actions must be async
原因: 服务端操作中缺少 async 关键字
修复: 在函数声明中添加 'async'
检测: API 路由或服务端操作文件中的错误
```

### 模式 4: 图片组件错误
```
错误: Image with src "/logo.png" must use width/height
原因: Next.js Image 组件缺少尺寸
修复: 添加 width 和 height 属性或使用 fill
检测: 错误提到 "next/image"
```

---

## 错误检查清单

执行E2E测试时，始终执行以下检查：

1. ✅ **检查 Next.js 版本** - 在错误消息或 package.json 中查找版本
2. ✅ **识别错误阶段** - 构建时 vs 运行时
3. ✅ **定位错误来源** - 文件路径和行号
4. ✅ **点击复制按钮** - 始终首先尝试获取完整错误文本
5. ✅ **分类错误类型** - 使用错误分类体系
6. ✅ **确定优先级** - P0（阻塞性）、P1（严重性）、P2（一般性）
7. ✅ **建议修复方案** - 基于错误模式
8. ✅ **路由到专家** - 使用返工目标映射
9. ✅ **记录上下文** - URL、浏览器、Next.js 版本
10. ✅ **保存报告** - 写入 active-bridge.md

---

## 按 Next.js 版本分组的复制按钮选择器

### Next.js 16 (Turbopack)
```typescript
const next16Selectors = [
  'dialog[role="dialog"] button:has-text("Copy Error")',
  'dialog button[title="Copy Error"]',
  'button:has-text("Copy Error Info")'
];
```

### Next.js 15 (过渡版本)
```typescript
const next15Selectors = [
  'next-dev-overlay button:has-text("Copy")',
  '[data-next-dev-overlay] button:has-text("Copy")'
];
```

### Next.js 14 及更早版本 (Webpack)
```typescript
const next14Selectors = [
  'button[aria-label="copy error"]',
  '.next-error-overlay-copy-btn'
];
```

---

## 增强的错误分类逻辑

参考实现：`tests/utils/error-classification.ts`

```typescript
export function classifyNextJSError(errorContent: string): NextJSErrorType {
  const content = errorContent.toLowerCase();

  // 优先级 1: 构建阻塞性错误
  if (content.includes('can\'t resolve') || content.includes('module not found')) {
    if (content.includes('.css') || content.includes('.module.css')) {
      return 'CSS_IMPORT_ERROR';  // P0 - frontend-expert
    }
    return 'MODULE_RESOLUTION_ERROR';  // P0 - Dev 阶段
  }

  if (content.includes('type error') || content.includes('ts') && content.includes('error')) {
    return 'TYPESCRIPT_ERROR';  // P0 - Dev 阶段
  }

  if (content.includes('turbopack') && content.includes('error')) {
    return 'TURBOPACK_BUILD_ERROR';  // P0 - Dev 阶段
  }

  // 优先级 2: 运行时错误
  if (content.includes('hydration failed') || content.includes('text content')) {
    return 'HYDRATION_ERROR';  // P1 - frontend-expert
  }

  if (content.includes('component')) {
    return 'COMPONENT_RUNTIME_ERROR';  // P1 - frontend-expert
  }

  if (content.includes('/api/') || content.includes('api route')) {
    return 'API_ROUTE_ERROR';  // P1 - backend-expert
  }

  // 优先级 3: 网络/基础设施
  if (content.includes('timeout') || content.includes('etimedout')) {
    return 'NETWORK_TIMEOUT_ERROR';  // P2 - Dev/Infra
  }

  if (content.includes('econnrefused') || content.includes('fetch failed')) {
    return 'NETWORK_CONNECTION_ERROR';  // P2 - Dev/Infra
  }

  return 'UNKNOWN_NEXTJS_ERROR';  // P2 - 待定
}

export function determineReworkTarget(errorType: NextJSErrorType): string {
  const targetMap: Record<NextJSErrorType, string> = {
    'MODULE_RESOLUTION_ERROR': 'Dev 阶段',
    'CSS_IMPORT_ERROR': 'frontend-expert',
    'TYPESCRIPT_ERROR': 'Dev 阶段',
    'TURBOPACK_BUILD_ERROR': 'Dev 阶段',
    'HYDRATION_ERROR': 'frontend-expert',
    'COMPONENT_RUNTIME_ERROR': 'frontend-expert',
    'API_ROUTE_ERROR': 'backend-expert',
    'NETWORK_TIMEOUT_ERROR': 'Dev/Infra',
    'NETWORK_CONNECTION_ERROR': 'Dev/Infra',
    'UNKNOWN_NEXTJS_ERROR': 'architecture-planning-expert'
  };
  return targetMap[errorType] || 'architecture-planning-expert';
}
```

---

## Next.js 错误报告模板

```markdown
## 🚨 Next.js 错误报告

### 错误元数据
- **错误类型**: [MODULE_RESOLUTION_ERROR / RUNTIME_ERROR / COMPILATION_ERROR]
- **错误优先级**: [P0 / P1 / P2]
- **发生时间**: YYYY-MM-DD HH:mm:ss
- **测试场景**: [正在执行的功能/流程]
- **测试步骤**: 步骤X: [当前步骤描述]

### 错误信息（来自Next.js复制按钮）
```
[此处粘贴从Next.js错误覆盖层复制按钮获取的完整错误信息]
```

### 上下文信息
- **页面URL**: http://localhost:3000/sports/profile
- **浏览器**: Chrome 131.0.6778.108 / Firefox
- **测试用例**: [test-name.spec.ts:line-number]

### 辅助证据
- **全页截图**: `/test-reports/errors/nextjs-error-[timestamp].png`
- **控制台错误**: 见附件 console-errors.log
- **网络日志**: 见附件 network-log.json

### 修复建议
- [ ] 具体修复建议1
- [ ] 具体修复建议2
- [ ] 需要验证的点

### 错误来源
- **提取方法**: [copy-button / dom-extraction / console-monitoring]
- **提取时间**: timestamp
```

---

**重要提示**：

1. **ALWAYS try the copy button FIRST** - 它提供最完整和准确的错误信息
2. **Screenshots are SUPPLEMENTAL** - 它们提供视觉上下文，但不是主要的错误来源
3. **Classify errors accurately** - 使用分类体系将错误路由到正确的专家
4. **P0/P1 errors = IMMEDIATE REWORK** - 停止测试并触发返工
5. **Document everything** - URL、控制台日志、截图、测试步骤
