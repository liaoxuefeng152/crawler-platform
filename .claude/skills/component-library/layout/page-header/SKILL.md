---
name: page-header
description: PageHeader组件的完整使用指南。所有Dashboard页面的标准标题组件，禁止使用自定义h1标题。提供多种视觉变体（card/default/minimal/gradient）和尺寸（sm/md/lg/xl），支持面包屑、徽章、操作按钮等功能。确保项目页面标题风格一致性。
---

# PageHeader Component Skill

## 📋 组件概述

**组件名称**：`PageHeader`

**组件分类**：`layout`

**文件位置**：`components/layout/page-header.tsx`

**用途**：项目统一的页面标题组件，所有Dashboard页面必须使用此组件，禁止使用自定义h1标题

**依赖组件**：

- lucide-react: LucideIcon (图标类型)
- 自定义: cn (className工具函数)

**状态**：✅ 稳定

**核心特性**：

- 🎨 **多种视觉变体**：card（推荐）、default、minimal、gradient
- 📏 **多种尺寸选择**：sm（紧凑）、md（标准）、lg（大号）、xl（特大）
- 🔗 **面包屑导航**：支持层级面包屑
- 🏷️ **徽章支持**：显示Beta、New等标签
- ⚡ **操作按钮**：右侧操作区域
- 📱 **响应式设计**：移动端友好

---

## 🎯 使用场景

### 场景1：标准页面标题（推荐配置）

**描述**：使用card变体和sm尺寸，这是项目中最常用的页面标题配置

```tsx
'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Users } from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';

export default function UserManagementPage() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <PageHeader
          variant="card" // 蓝色渐变背景（推荐）
          size="sm" // 紧凑布局（推荐）
          title="用户管理中心"
          description="管理系统用户账户、权限和状态，支持用户信息的增删改查操作"
          icon={Users}
        />

        {/* 页面内容 */}
        <div className="...">{/* 页面主体内容 */}</div>
      </div>
    </DashboardLayout>
  );
}
```

**关键点**：

- 必须使用 `variant="card"` 和 `size="sm"`（项目标准配置）
- `title` 简洁明确（2-6个字）
- `description` 说明页面用途（20-40个字）
- `icon` 使用 lucide-react 图标，语义相关
- 使用 `space-y-4` 包裹 PageHeader 和内容区

---

### 场景2：带操作按钮的页面标题

**描述**：右侧显示操作按钮（如新增、导入等）

```tsx
'use client';

import { PageHeader } from '@/components/layout/page-header';
import { BookOpen, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LedgersPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        variant="card"
        size="sm"
        title="账本管理"
        description="创建和管理多人共享账本，支持协作记账和数据分析"
        icon={BookOpen}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              导入数据
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              创建账本
            </Button>
          </div>
        }
      />

      {/* 页面内容 */}
    </div>
  );
}
```

**关键点**：

- `actions` prop 接收 ReactNode
- 使用 `<div className="flex gap-2">` 包裹多个按钮
- 按钮统一使用 `size="sm"`
- 图标使用 `w-4 h-4` 尺寸

---

### 场景3：带徽章的页面标题

**描述**：标题旁显示Beta、New等徽章标签

```tsx
<PageHeader
  variant="card"
  size="sm"
  title="自动化工作流"
  description="配置和管理自动化任务，提升工作效率"
  icon={Workflow}
  badge="Beta" // 显示徽章
/>
```

**关键点**：

- `badge` 是简单的字符串
- 徽章显示在标题右侧
- 自动应用primary色主题
- 圆角pill样式

---

### 场景4：带面包屑的页面标题

**描述**：显示页面层级导航

```tsx
<PageHeader
  variant="card"
  size="sm"
  title="用户详情"
  description="查看和管理用户的详细信息和权限设置"
  icon={User}
  breadcrumbs={[
    { label: '首页', href: '/' },
    { label: '系统管理', href: '/admin' },
    { label: '用户管理', href: '/admin/users' },
    { label: '用户详情' }, // 当前页面，无href
  ]}
/>
```

**关键点**：

- `breadcrumbs` 是对象数组
- 有 `href` 的是可点击链接
- 无 `href` 的是当前页（高亮显示）
- 使用 `/` 分隔层级

---

### 场景5：简约风格页面标题

**描述**：使用minimal变体的简洁标题

```tsx
<PageHeader
  variant="minimal" // 简约风格
  size="md"
  title="系统设置"
  description="配置系统参数和用户偏好设置"
  icon={Settings}
/>
```

**关键点**：

- `variant="minimal"` 无背景色，仅底部边框
- 适合不需要强调的次要页面
- 节省垂直空间

---

## 🔧 Props API

### PageHeaderProps 接口定义

```typescript
interface PageHeaderProps {
  // 基础配置
  title: string; // 页面主标题（必填）
  description?: string; // 页面描述（推荐）
  icon?: LucideIcon; // 标题左侧图标（推荐）
  className?: string; // 自定义样式类

  // 视觉变体
  variant?: 'default' | 'minimal' | 'card' | 'gradient'; // 视觉变体（默认card）
  size?: 'sm' | 'md' | 'lg' | 'xl'; // 尺寸变体（默认lg）

  // 功能扩展
  actions?: React.ReactNode; // 右侧操作按钮
  rightContent?: React.ReactNode; // 右侧内容（兼容旧版）
  breadcrumbs?: Array<{
    // 面包屑导航
    label: string;
    href?: string;
  }>;
  badge?: string; // 标题旁徽章文本
}
```

### Props 详细说明

| Prop名         | 类型                                             | 默认值   | 必填   | 说明                                  |
| -------------- | ------------------------------------------------ | -------- | ------ | ------------------------------------- |
| `title`        | `string`                                         | -        | ✅     | 页面主标题，2-6个字，简洁明确         |
| `description`  | `string`                                         | -        | ⭐推荐 | 页面描述，20-40个字，说明用途         |
| `icon`         | `LucideIcon`                                     | -        | ⭐推荐 | 标题左侧图标，从lucide-react导入      |
| `variant`      | `'card' \| 'default' \| 'minimal' \| 'gradient'` | `'card'` | -      | 视觉变体（推荐card）                  |
| `size`         | `'sm' \| 'md' \| 'lg' \| 'xl'`                   | `'lg'`   | -      | 尺寸变体（推荐sm）                    |
| `actions`      | `ReactNode`                                      | -        | -      | 右侧操作按钮区域                      |
| `rightContent` | `ReactNode`                                      | -        | -      | 右侧内容（兼容旧版，优先使用actions） |
| `breadcrumbs`  | `Array<{label: string, href?: string}>`          | -        | -      | 面包屑导航                            |
| `badge`        | `string`                                         | -        | -      | 标题旁徽章文本（如"Beta"、"New"）     |
| `className`    | `string`                                         | -        | -      | 自定义样式类                          |

### Variant 变体说明

| Variant     | 视觉效果                  | 使用场景               |
| ----------- | ------------------------- | ---------------------- |
| **card** ⭐ | 蓝色渐变背景 + 毛玻璃效果 | **推荐用于大多数页面** |
| default     | 白色背景 + 灰色边框       | 通用页面               |
| minimal     | 无背景，仅底部边框        | 简约风格页面           |
| gradient    | 白色背景 + 更大胆标题     | 强调型页面             |

### Size 尺寸说明

| Size      | 容器内边距 | 标题大小 | 图标大小  | 使用场景         |
| --------- | ---------- | -------- | --------- | ---------------- |
| **sm** ⭐ | p-4        | text-xl  | w-5 h-5   | **紧凑页面推荐** |
| md        | p-6        | text-2xl | w-6 h-6   | 标准页面         |
| lg        | p-6        | text-3xl | w-8 h-8   | 大型页面         |
| xl        | p-8        | text-4xl | w-10 h-10 | 特大型页面       |

---

## ⚠️ 注意事项

### 设计原则

1. **必须使用PageHeader**：所有Dashboard页面必须使用此组件，禁止使用自定义h1标题
2. **标准配置**：优先使用 `variant="card"` 和 `size="sm"`
3. **语义化图标**：选择与页面功能语义相关的lucide-react图标
4. **简洁文案**：title 2-6个字，description 20-40个字

### 使用限制

1. **title限制**：
   - 必填字段
   - 建议长度：2-6个字
   - 避免过于冗长

2. **description限制**：
   - 建议长度：20-40个字
   - 简洁说明页面用途和价值
   - 避免重复title内容

3. **icon限制**：
   - 必须从 lucide-react 导入
   - 选择语义相关的图标
   - 避免使用过多不同图标

4. **actions限制**：
   - 使用 `<div className="flex gap-2">` 包裹多个按钮
   - 按钮统一使用 `size="sm"`
   - 图标使用 `w-4 h-4` 尺寸

### 常见问题

**Q: PageHeader 可以自定义样式吗？**

A: 支持多种 variant 和 size，基本满足所有场景。特殊情况可通过 `className` 自定义：

```tsx
<PageHeader
  className="bg-gradient-to-r from-purple-50 to-pink-50"
  ...
/>
```

**Q: 如何在 PageHeader 中使用自定义按钮样式？**

A: 在 `actions` 中使用任何 shadcn/ui Button 组件：

```tsx
actions={
  <div className="flex gap-2">
    <Button variant="outline" size="sm">次要操作</Button>
    <Button variant="destructive" size="sm">危险操作</Button>
    <Button size="sm">主要操作</Button>
  </div>
}
```

**Q: 面包屑的链接如何工作？**

A: 使用 Next.js Link 或标准 a 标签：

```tsx
breadcrumbs={[
  { label: '首页', href: '/' },  // 使用 Next.js Link
  { label: '系统管理', href: '/admin' },
  { label: '当前页' }, // 无 href，不可点击
]}
```

**Q: description 可以省略吗？**

A: 技术上可以省略，但**强烈推荐**填写。description 帮助用户快速理解页面用途。

**Q: 如何隐藏 PageHeader？**

A: PageHeader 是页面必需元素，不应隐藏。如确实需要，考虑使用不同的 variant（如 minimal）。

---

## 🔗 相关组件

### 依赖的组件

- **lucide-react** - 图标库（所有图标从该库导入）
- **cn (utils)** - className合并工具函数

### 被依赖的组件

- **DashboardLayout** - 仪表板布局组件
- **所有Dashboard页面** - 使用PageHeader作为页面标题

### 替代方案

- ❌ **自定义h1标题** - **禁止使用**，违反项目规范
- ❌ **其他标题组件** - 无需引入其他标题组件

---

## 📚 更多资源

### 组件源码

- 文件位置：`components/layout/page-header.tsx` (179行)

### 相关文档

- [THEME.md - 页面布局规范](../../../../.claude/docs/THEME.md#10-页面布局规范) - 第10章详细说明PageHeader使用标准
- [组件开发检查清单](../../../../.claude/docs/development/COMPONENT_DEVELOPMENT_CHECKLIST.md)

### 使用示例

- 标准页面：`app/dashboard/components/page.tsx`
- 用户管理：`app/dashboard/user-management/page.tsx`
- 数学工具：`app/dashboard/math-tools/page.tsx`

---

## 📝 更新日志

### v1.0.0 - 2025-12-23

- ✅ 初始版本
- ✅ 支持4种视觉变体（card/default/minimal/gradient）
- ✅ 支持4种尺寸（sm/md/lg/xl）
- ✅ 支持面包屑导航
- ✅ 支持徽章和操作按钮
- ✅ 完整的TypeScript类型定义

---

## 💡 最佳实践

### 1. 使用标准配置

**✅ 推荐**：

```tsx
<PageHeader
  variant="card" // 项目标准
  size="sm" // 项目标准
  title="页面标题"
  description="页面功能描述"
  icon={Icon}
/>
```

**❌ 不推荐**：

```tsx
<PageHeader
  variant="default" // 非标准
  size="lg" // 非标准
  title="页面标题"
  // 缺少 description
  // 缺少 icon
/>
```

### 2. 图标选择

**✅ 推荐**：

```tsx
import { Users } from 'lucide-react';

<PageHeader
  title="用户管理"
  icon={Users} // 语义相关
/>;
```

**❌ 不推荐**：

```tsx
import { Zap } from 'lucide-react';

<PageHeader
  title="用户管理"
  icon={Zap} // 语义不相关
/>;
```

### 3. 文案长度控制

**✅ 推荐**：

```tsx
<PageHeader
  title="用户管理中心" // 6个字，简洁
  description="管理系统用户账户、权限和状态，支持增删改查操作" // 26个字，说明清晰
/>
```

**❌ 不推荐**：

```tsx
<PageHeader
  title="这是一个非常非常长的页面标题" // 过长
  description="这里有一段非常非常非常非常非常长的描述文字，严重超出了推荐的20-40个字的范围" // 过长
/>
```

### 4. 操作按钮布局

**✅ 推荐**：

```tsx
actions={
  <div className="flex gap-2">  // 使用gap-2
    <Button variant="outline" size="sm">次要</Button>
    <Button size="sm">主要</Button>
  </div>
}
```

**❌ 不推荐**：

```tsx
actions={
  <>
    <Button variant="outline" size="md">次要</Button>  // 尺寸不一致
    <Button size="sm">主要</Button>
  </>
}
```

### 5. 布局容器

**✅ 推荐**：

```tsx
<DashboardLayout>
  <div className="space-y-4">  {/* 使用space-y-4 */}
    <PageHeader ... />
    <div>页面内容</div>
  </div>
</DashboardLayout>
```

**❌ 不推荐**：

```tsx
<DashboardLayout>
  <PageHeader ... />
  <div>页面内容</div>  {/* 缺少space-y-4，无间距 */}
</DashboardLayout>
```

---

## 🎨 样式定制

### Variant 样式对比

```typescript
// card variant（推荐）
'p-6 bg-gradient-to-br from-blue-50/90 via-blue-100/50 to-transparent backdrop-blur-sm border border-blue-200/50 rounded-xl shadow-sm';

// default variant
'p-6 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl';

// minimal variant
'pb-4 mb-6 border-b border-gray-200';

// gradient variant
'p-6 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl';
```

### Size 样式对比

```typescript
// sm（推荐）
container: 'p-4';
title: 'text-xl font-semibold';
description: 'text-sm';
icon: 'w-5 h-5';

// md
container: 'p-6';
title: 'text-2xl font-semibold';
description: 'text-base';
icon: 'w-6 h-6';

// lg
container: 'p-6';
title: 'text-3xl font-semibold';
description: 'text-base';
icon: 'w-8 h-8';

// xl
container: 'p-8';
title: 'text-4xl font-bold';
description: 'text-lg';
icon: 'w-10 h-10';
```

### 自定义样式

```tsx
// 自定义背景
<PageHeader
  className="bg-gradient-to-r from-purple-50 to-pink-50"
  ...
/>

// 自定义边框
<PageHeader
  className="border-2 border-primary"
  ...
/>
```

---

## ♿ 无障碍性

- ✅ 使用语义化HTML（h1标题）
- ✅ 支持屏幕阅读器（正确的heading层级）
- ✅ 面包屑导航可访问（nav标签）
- ✅ 按钮操作区域键盘可访问
- ✅ 图标配合文本使用，确保语义完整

---

## 🧪 测试

### 测试覆盖

- 单元测试：暂无
- 集成测试：通过所有Dashboard页面验证
- E2E测试：暂无

### 手动测试检查清单

- [ ] 标题正常显示
- [ ] 描述正常显示
- [ ] 图标正常显示
- [ ] 不同variant样式正确
- [ ] 不同size尺寸正确
- [ ] 徽章正常显示
- [ ] 面包屑导航正常
- [ ] 操作按钮正常
- [ ] 移动端布局正常
- [ ] 响应式适配正常

---

**文档版本**：v1.0.0
**最后更新**：2025-12-23
**维护者**：架构专家 + 前端专家团队
