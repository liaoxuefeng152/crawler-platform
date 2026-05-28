---
name: button
description: Button组件使用指南。shadcn/ui按钮组件项目使用规范。提供多种变体、尺寸和图标支持。项目按钮使用标准:优先使用sm尺寸、统一使用gap-2间距。
---

# Button Component Skill

## 📋 组件概述

**组件名称**：`Button`

**组件分类**：`ui`

**文件位置**：`components/ui/button.tsx`

**用途**：shadcn/ui标准按钮组件

**依赖组件**：
- class-variance-authority (CVA) - 变体管理

**状态**：✅ 稳定

**核心特性**：
- 🎨 **多种变体**：default、outline、ghost、link、destructive
- 📏 **多种尺寸**：default、sm、lg、icon
- 🎭 **图标支持**：支持lucide-react图标
- ⚡ **加载状态**：支持disabled和加载状态

---

## 🎯 使用场景

### 场景1：标准按钮（项目推荐）

**描述**：使用sm尺寸的标准按钮

```tsx
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

<Button size="sm">
  <Plus className="w-4 h-4 mr-2" />
  新增用户
</Button>
```

**关键点**：
- 项目标准：`size="sm"`
- 图标使用 `w-4 h-4` 尺寸
- 图标和文字间距 `mr-2`

---

### 场景2：次要操作按钮

**描述**：使用outline变体的次要按钮

```tsx
<Button variant="outline" size="sm">
  取消
</Button>
```

---

### 场景3：危险操作按钮

**描述**：使用destructive变体的危险按钮

```tsx
<Button variant="destructive" size="sm">
  删除
</Button>
```

---

### 场景4：图标按钮

**描述**：仅显示图标的按钮

```tsx
import { Settings } from 'lucide-react';

<Button variant="outline" size="icon">
  <Settings className="w-4 h-4" />
</Button>
```

---

### 场景5：按钮组

**描述**：多个按钮组合使用

```tsx
<div className="flex gap-2">
  <Button variant="outline" size="sm">取消</Button>
  <Button size="sm">确定</Button>
</div>
```

**关键点**：
- 使用 `flex gap-2` 包裹
- 统一使用 `size="sm"`

---

## 🔧 Props API

### ButtonProps 接口定义

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}
```

### Props 详细说明

| Prop名 | 类型 | 默认值 | 必填 | 说明 |
|--------|------|--------|------|------|
| `variant` | 变体类型 | `'default'` | - | 按钮视觉样式 |
| `size` | 尺寸类型 | `'default'` | - | 按钮尺寸 |
| `asChild` | `boolean` | `false` | - | 作为子组件渲染 |
| `disabled` | `boolean` | `false` | - | 禁用状态 |

### Variant 变体说明

| Variant | 用途 | 使用场景 |
|---------|------|----------|
| **default** | 主要操作 | 主要提交按钮、确认按钮 |
| **outline** | 次要操作 | 取消、返回、次要操作 |
| **ghost** | 轻量操作 | 工具栏按钮、图标按钮 |
| **link** | 链接样式 | 文字链接、辅助操作 |
| **destructive** | 危险操作 | 删除、清空等不可逆操作 |
| **secondary** | 次要按钮 | 补充操作 |

### Size 尺寸说明

| Size | 高度 | 字体 | 使用场景 |
|------|------|------|----------|
| **sm** ⭐ | h-8 (32px) | text-xs | **项目标准,推荐使用** |
| default | h-9 (36px) | text-sm | 标准按钮 |
| lg | h-10 (40px) | text-sm | 大号按钮 |
| icon | h-9 w-9 (36px) | - | 图标按钮(正方形) |

---

## ⚠️ 注意事项

### 项目标准

1. **尺寸标准**：优先使用 `size="sm"`
2. **间距标准**：按钮组使用 `gap-2`
3. **图标尺寸**：统一使用 `w-4 h-4`
4. **图标间距**：图标与文字间距 `mr-2`

### 使用限制

1. **尺寸限制**：
   - PageHeader中的按钮必须使用 `size="sm"`
   - 表格操作按钮必须使用 `size="sm"`
   - 图标按钮使用 `size="icon"`

2. **变体选择**：
   - 主要操作：`variant="default"`
   - 次要操作：`variant="outline"`
   - 危险操作：`variant="destructive"`

---

## 🔗 相关组件

### shadcn/ui文档

- [Button文档](https://ui.shadcn.com/docs/components/button)

### 使用示例

- PageHeader按钮：`components/layout/page-header.tsx`
- 用户管理页面：`app/dashboard/user-management/page.tsx`

---

## 📝 更新日志

### v1.0.0 - 2025-12-23

- ✅ 初始版本
- ✅ 完整的变体和尺寸支持
- ✅ 项目使用标准

---

## 💡 最佳实践

### 1. 使用项目标准尺寸

**✅ 推荐**：
```tsx
<Button size="sm">确定</Button>
```

**❌ 不推荐**：
```tsx
<Button>确定</Button>  // 未指定尺寸
```

### 2. 按钮组间距

**✅ 推荐**：
```tsx
<div className="flex gap-2">
  <Button variant="outline" size="sm">取消</Button>
  <Button size="sm">确定</Button>
</div>
```

**❌ 不推荐**：
```tsx
<Button variant="outline" size="sm">取消</Button>
<Button size="sm">确定</Button>  // 无间距
```

---

**文档版本**：v1.0.0
**最后更新**：2025-12-23
**维护者**：架构专家 + 前端专家团队
