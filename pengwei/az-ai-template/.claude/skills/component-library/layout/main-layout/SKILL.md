---
name: main-layout
description: MainLayout组件使用指南。项目主布局组件,包含侧边栏导航和顶部栏。支持响应式设计、用户认证、菜单配置等功能。所有需要侧边栏的页面必须使用此布局组件。
---

# MainLayout Component Skill

## 📋 组件概述

**组件名称**：`MainLayout`

**组件分类**：`layout`

**文件位置**：`components/layout/main-layout.tsx`

**用途**：项目主布局组件,提供侧边栏导航和顶部栏

**依赖组件**：
- shadcn/ui: Sidebar, Button, DropdownMenu
- lucide-react: 图标库

**状态**：✅ 稳定

**核心特性**：
- 📱 **响应式侧边栏**：移动端可折叠
- 👤 **用户认证集成**：与Zustand store集成
- 🎯 **菜单配置**：通过menuItems数组配置
- 🔄 **路由管理**：自动高亮当前页面

---

## 🎯 使用场景

### 场景1：标准Dashboard页面

**描述**：使用MainLayout包裹Dashboard页面

```tsx
import MainLayout from '@/components/layout/main-layout';

export default function DashboardPage() {
  return (
    <MainLayout showSidebar={true}>
      <div className="p-6">
        {/* 页面内容 */}
      </div>
    </MainLayout>
  );
}
```

**关键点**：
- `showSidebar={true}` 显示侧边栏
- children 包含页面主体内容
- 自动处理用户认证状态

---

### 场景2：不带侧边栏的页面

**描述**：登录页、注册页等不需要侧边栏的页面

```tsx
import MainLayout from '@/components/layout/main-layout';

export default function LoginPage() {
  return (
    <MainLayout showSidebar={false}>
      <div className="min-h-screen flex items-center justify-center">
        {/* 登录表单 */}
      </div>
    </MainLayout>
  );
}
```

**关键点**：
- `showSidebar={false}` 隐藏侧边栏
- 适合登录、注册等独立页面

---

## 🔧 Props API

### MainLayoutProps 接口定义

```typescript
interface MainLayoutProps {
  children: ReactNode;        // 页面内容
  showSidebar?: boolean;      // 是否显示侧边栏（默认false）
  title?: string;             // 页面标题（可选）
}
```

### Props 详细说明

| Prop名 | 类型 | 默认值 | 必填 | 说明 |
|--------|------|--------|------|------|
| `children` | `ReactNode` | - | ✅ | 页面主体内容 |
| `showSidebar` | `boolean` | `false` | - | 是否显示侧边栏导航 |
| `title` | `string` | - | - | 自定义页面标题 |

---

## ⚠️ 注意事项

### 设计原则

1. **统一布局**：所有Dashboard页面使用MainLayout
2. **响应式优先**：侧边栏在移动端自动折叠
3. **用户认证**：自动处理登录/登出状态
4. **菜单配置**：通过menuItems数组统一管理

### 菜单配置

菜单项定义在组件内部：
```typescript
const menuItems = [
  {
    title: '概览',
    icon: Zap,
    href: '/dashboard',
    description: '系统概览和统计',
  },
  // ... 更多菜单项
];
```

---

## 🔗 相关组件

### 依赖的组件

- **Sidebar (shadcn/ui)** - 侧边栏组件
- **DashboardLayout** - 简化的仪表板布局

### 被依赖的组件

- **所有Dashboard页面** - 使用MainLayout作为布局容器

---

## 📚 更多资源

### 组件源码

- 文件位置：`components/layout/main-layout.tsx`

### 相关文档

- [THEME.md - 布局规范](../../../../.claude/docs/THEME.md)

### 使用示例

- Dashboard页面：`app/dashboard/page.tsx`
- 用户管理：`app/dashboard/user-management/page.tsx`

---

## 📝 更新日志

### v1.0.0 - 2025-12-23

- ✅ 初始版本
- ✅ 支持侧边栏导航
- ✅ 支持用户认证
- ✅ 响应式设计

---

**文档版本**：v1.0.0
**最后更新**：2025-12-23
**维护者**：架构专家 + 前端专家团队
