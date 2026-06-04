# 性能优化

## 🚀 React/Next.js 性能优化规范（强制）

所有 React/Next.js 代码**必须遵循** [React Best Practices](../skills/react-best-practices/SKILL.md) 规范。

> 🎯 **目标**：首屏加载时间减少 1-3 秒，API 响应时间减少 1-3 秒，数据库查询减少 50-80%

## 核心规则（CRITICAL 级别 - 必须执行）

### 1. 消除请求瀑布流（前后端通用）

- ✅ 推迟 await 到真正需要的时刻
- ✅ 立即启动独立的异步操作
- ✅ 使用 `Promise.all()` 并行执行无依赖操作
- ✅ 使用 `better-all` 处理部分依赖

### 2. 优化打包体积（前端专用）

- ✅ 避免 Barrel File 导入（如 `import { X } from 'lucide-react'`）
- ✅ 直接从源文件导入（如 `import X from 'lucide-react/dist/esm/icons/x'`）
- ✅ 使用 `next/dynamic` 动态导入重型组件
- ✅ 延迟非关键第三方库

### 3. 战略性 Suspense 边界（Next.js App Router）

- ✅ 使用 Suspense 边界流式加载内容
- ✅ 避免在 async 组件顶部 await 所有数据
- ✅ 让静态内容立即渲染

## 高级规则（HIGH 级别 - 强烈推荐）

### 4. 服务端性能优化（后端专用）

- ✅ 使用 `React.cache()` 进行请求内去重
- ✅ 使用 LRU 缓存进行跨请求优化
- ✅ 最小化 RSC 边界序列化（只传需要的字段）
- ✅ 使用组件组合并行化服务端数据获取

### 5. 客户端数据获取优化（前端专用）

- ✅ 使用 SWR 自动去重请求
- ✅ 使用 `useSWRMutation` 处理变更操作
- ✅ 去重全局事件监听器

## 完整规则文档

- 📄 [React Best Practices SKILL.md](../skills/react-best-practices/SKILL.md)：Skill 主文档
- 📄 [React Performance Guidelines](../skills/react-best-practices/references/react-performance-guidelines.md)：完整 40+ 规则（8 个优先级级别）

## 适用范围

| Agent | 适用规则 | 强制级别 |
|-------|---------|---------|
| **frontend-expert** | 打包体积、重渲染、渲染性能、客户端数据获取 | CRITICAL + HIGH |
| **backend-expert** | API Routes 瀑布流、服务端缓存、RSC 边界、并行数据获取 | CRITICAL + HIGH |
| **qa-expert** | 所有规则的质量验证 | 全部级别 |

## 验证方法

- ✅ frontend-expert 开发完成后自检
- ✅ backend-expert API 开发完成后自检
- ✅ qa-expert 质量检查时验证
- ✅ 构建前自动检查（可选）

## 🚨 触发时机（强制执行）

**每次编码时必须调用 react-best-practices skill**：

- ✅ **前端开发**：编写任何 React 组件或 Next.js 页面**之前**，先调用 skill 查询相关规则
- ✅ **后端开发**：编写任何 API Route 或服务端数据获取逻辑**之前**，先调用 skill 查询相关规则
- ✅ **代码审查**：review 代码时，使用 skill 进行全面性能检查
- ✅ **重构优化**：优化现有代码时，使用 skill 查找优化机会

### 执行方式

```bash
# 每次编码前自动调用
Skill(react-best-practices)
```

### 禁止行为

- ❌ 编写 React/Next.js 代码前不调用该 skill
- ❌ 仅在 qa-expert 检查时才考虑性能优化
- ❌ 跳过 CRITICAL 和 HIGH 级别的规则

### 后果

- ⚠️ 未调用 skill 直接编码：代码可能不符合性能最佳实践
- ⚠️ 违反 CRITICAL 规则：qa-expert 性能检查失败
