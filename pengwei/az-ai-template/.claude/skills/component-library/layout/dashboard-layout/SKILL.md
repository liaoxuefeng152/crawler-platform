---
name: dashboard-layout
description: DashboardLayout组件使用指南。仪表板页面的简化布局组件,基于MainLayout封装。自动处理页面标题和路由,适用于所有Dashboard子页面。
---

# DashboardLayout Component Skill

## 📋 组件概述

**组件名称**：`DashboardLayout`

**组件分类**：`layout`

**文件位置**：`components/layout/dashboard-layout.tsx`

**用途**：仪表板页面的简化布局组件

**依赖组件**：
- MainLayout - 主布局组件

**状态**：✅ 稳定

**核心特性**：
- 🎯 **简化封装**：基于MainLayout的便捷封装
- 📝 **自动标题**：根据路由自动生成页面标题
- 📱 **响应式**：继承MainLayout的响应式特性
- 🔄 **路由处理**：支持已实现的页面和404处理

---

## 🎯 使用场景

### 场景1：标准Dashboard页面

**描述**：所有Dashboard子页面使用DashboardLayout

```tsx
import DashboardLayout from '@/components/layout/dashboard-layout';

export default function UserManagementPage() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <PageHeader
          title="用户管理"
          description="管理系统用户账户"
          icon={Users}
        />
        {/* 页面内容 */}
      </div>
    </DashboardLayout>
  );
}
```

**关键点**：
- 自动显示侧边栏
- 自动根据路由生成标题
- 使用space-y-4包裹内容

---

### 场景2：自定义页面标题

**描述**：覆盖自动生成的标题

```tsx
<DashboardLayout title="我的自定义标题">
  {/* 页面内容 */}
</DashboardLayout>
```

---

## 🔧 Props API

### DashboardLayoutProps 接口定义

```typescript
interface DashboardLayoutProps {
  children: ReactNode;  // 页面内容
  title?: string;       // 自定义标题（可选）
}
```

### Props 详细说明

| Prop名 | 类型 | 默认值 | 必填 | 说明 |
|--------|------|--------|------|------|
| `children` | `ReactNode` | - | ✅ | 页面主体内容 |
| `title` | `string` | 自动生成 | - | 自定义页面标题 |

---

## ⚠️ 注意事项

### 已实现的页面

组件会根据路由返回不同的布局：
- `/dashboard` - 仪表板概览
- `/dashboard/components` - 组件管理
- `/dashboard/user-management` - 用户管理
- `/dashboard/math-tools` - 数学工具

### 未实现的页面

访问未实现的页面会显示404提示并提供返回按钮。

---

## 🔗 相关组件

### 依赖的组件

- **MainLayout** - 主布局组件

### 被依赖的组件

- **所有Dashboard子页面** - 使用DashboardLayout作为布局容器

### 替代方案

- **MainLayout** - 需要更多控制时直接使用MainLayout

---

## 📚 更多资源

### 组件源码

- 文件位置：`components/layout/dashboard-layout.tsx` (91行)

### 使用示例

- 仪表板：`app/dashboard/page.tsx`
- 用户管理：`app/dashboard/user-management/page.tsx`

---

## 📝 更新日志

### v1.0.0 - 2025-12-23

- ✅ 初始版本
- ✅ 支持自动标题生成
- ✅ 支持路由处理

---

**文档版本**：v1.0.0
**最后更新**：2025-12-23
**维护者**：架构专家 + 前端专家团队
