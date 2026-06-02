---
name: stats-card
description: StatsCard组件的完整使用指南。卡片式统计展示组件，用于独立展示关键指标和数据。支持紧凑模式和默认模式，适合仪表板、数据展示区域等场景。与InlineStats不同，StatsCard提供卡片式布局，更适合独立的数据展示。
---

# StatsCard Component Skill

## 📋 组件概述

**组件名称**：`StatsCard`

**组件分类**：`ui`

**文件位置**：`components/ui/stats-card.tsx`

**用途**：卡片式统计展示组件，用于独立展示关键指标和数据

**依赖组件**：
- shadcn/ui: Card, CardHeader, CardTitle, CardContent, Badge
- lucide-react: LucideIcon (图标类型)

**状态**：✅ 稳定

**核心特性**：
- 🎴 **卡片式布局**：独立的卡片展示
- 📏 **两种模式**：default（正方形）、compact（横向）
- 🎨 **图标支持**：可配置lucide-react图标
- 🏷️ **徽章支持**：显示标签或状态
- 📱 **响应式设计**：移动端友好

---

## 🎯 使用场景

### 场景1：仪表板数据卡片（标准使用）

**描述**：在仪表板页面展示关键指标

```tsx
'use client';

import { StatsCard } from '@/components/ui/stats-card';
import { Users, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="总用户数"
        value="1,250"
        description="较上月 +12%"
        icon={Users}
      />
      <StatsCard
        title="活跃用户"
        value="850"
        description="日活跃用户"
        icon={TrendingUp}
      />
      <StatsCard
        title="新增用户"
        value="120"
        description="本周新增"
      />
      <StatsCard
        title="转化率"
        value="3.2%"
        description="较上周 +0.5%"
      />
    </div>
  );
}
```

**关键点**：
- 使用网格布局 `grid gap-4`
- 每个卡片独立展示一个指标
- `icon` 使用 lucide-react 图标
- `description` 可选，用于补充说明

---

### 场景2：紧凑模式（横向卡片）

**描述**：使用更紧凑的横向布局

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <StatsCard
    title="组件总数"
    value={45}
    variant="compact"  // 或使用 compact={true}
  />
  <StatsCard
    title="分类数"
    value={8}
    variant="compact"
  />
  <StatsCard
    title="使用次数"
    value={120}
    variant="compact"
  />
</div>
```

**关键点**：
- `variant="compact"` 或 `compact={true}` 启用紧凑模式
- 宽高比 `aspect-[5/2]` （5:2横向）
- 最小宽度 `min-w-[120px]`
- 适合空间有限的场景

---

### 场景3：带徽章的数据卡片

**描述**：显示带有标签或状态的卡片

```tsx
<StatsCard
  title="系统状态"
  value="正常"
  description="所有服务运行正常"
  badge="在线"  // 显示徽章
/>
```

**关键点**：
- `badge` 是简单的字符串
- 显示在卡片右上角
- 使用 Badge 组件渲染

---

### 场景4：混合使用不同模式

**描述**：在同一个页面中使用不同模式的卡片

```tsx
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  {/* 主要指标 - 标准模式 */}
  <StatsCard
    title="总收入"
    value="¥125,000"
    description="本月收入"
    icon={DollarSign}
  />

  {/* 次要指标 - 紧凑模式 */}
  <StatsCard
    title="订单数"
    value={85}
    variant="compact"
  />
  <StatsCard
    title="退款数"
    value={3}
    variant="compact"
  />
  <StatsCard
    title="完成率"
    value="96.5%"
    variant="compact"
  />
</div>
```

**关键点**：
- 根据重要性选择模式
- 主要指标使用标准模式，更突出
- 次要指标使用紧凑模式，节省空间

---

## 🔧 Props API

### StatsCardProps 接口定义

```typescript
interface StatsCardProps {
  title: string;                    // 卡片标题
  value: string | number;           // 统计值
  description?: string;             // 描述文字（可选）
  icon?: LucideIcon;                // 图标组件（可选）
  badge?: string;                   // 徽章文本（可选）
  className?: string;               // 自定义样式类
  variant?: 'default' | 'compact';  // 变体（默认default）
  compact?: boolean;                // 紧凑模式（默认false，优先级低于variant）
}
```

### Props 详细说明

| Prop名 | 类型 | 默认值 | 必填 | 说明 |
|--------|------|--------|------|------|
| `title` | `string` | - | ✅ | 卡片标题，简短描述统计项 |
| `value` | `string \| number` | - | ✅ | 统计值，数字或字符串 |
| `description` | `string` | - | - | 补充说明，显示在值下方 |
| `icon` | `LucideIcon` | - | - | lucide-react图标组件 |
| `badge` | `string` | - | - | 徽章文本，显示在卡片右上角 |
| `className` | `string` | `''` | - | 自定义样式类 |
| `variant` | `'default' \| 'compact'` | `'default'` | - | 卡片变体 |
| `compact` | `boolean` | `false` | - | 紧凑模式（优先级低于variant） |

---

## ⚠️ 注意事项

### 设计原则

1. **简洁明了**：title 简短扼要，value 清晰突出
2. **数据准确**：确保显示的数据准确且实时更新
3. **合理布局**：使用网格布局，保持卡片间距一致
4. **语义化图标**：选择与统计项语义相关的lucide-react图标

### 使用限制

1. **value类型限制**：
   - 支持 `number` 或 `string`
   - 数字会自动格式化显示
   - 字符串保持原样显示

2. **尺寸限制**：
   - **默认模式**：`aspect-square` (正方形)，最小宽度 `min-w-[140px]`
   - **紧凑模式**：`aspect-[5/2]` (5:2横向)，最小宽度 `min-w-[120px]`

3. **图标限制**：
   - 必须从 lucide-react 导入
   - 图标显示在标题右侧

### 常见问题

**Q: StatsCard 和 InlineStats 有什么区别？**

A:
- **StatsCard**：卡片式布局，独立展示，适合仪表板数据展示区域
- **InlineStats**：内联水平排列，适合嵌入标题行或工具栏

**Q: 如何自定义卡片大小？**

A: 使用 `className` 自定义：
```tsx
<StatsCard
  title="用户数"
  value={1250}
  className="min-w-[200px]"  // 自定义最小宽度
/>
```

**Q: 紧凑模式和默认模式如何选择？**

A:
- **默认模式**：适合重要指标，需要突出显示
- **紧凑模式**：适合次要指标，需要节省空间

**Q: 如何处理超长的数值？**

A: 使用字符串格式化：
```tsx
<StatsCard
  title="总访问量"
  value="1.2M"  // 格式化后的字符串
/>
```

---

## 🔗 相关组件

### 依赖的组件

- **Card (shadcn/ui)** - 卡片容器
- **Badge (shadcn/ui)** - 徽章组件

### 相关组件

- **InlineStats** - 内联统计展示组件

### 被依赖的组件

- **仪表板页面** - 用于展示关键指标
- **数据展示区域** - 用于独立的数据卡片

### 替代方案

- **InlineStats** - 需要内联展示时使用
- **自定义实现** - 不推荐，违反项目规范

---

## 📚 更多资源

### 组件源码

- 文件位置：`components/ui/stats-card.tsx` (55行)

### 相关文档

- [THEME.md - Card组件样式](../../../../.claude/docs/THEME.md#card-组件)
- [组件开发检查清单](../../../../.claude/docs/development/COMPONENT_DEVELOPMENT_CHECKLIST.md)

### 使用示例

- 用户管理页面：`app/dashboard/user-management/page.tsx`

---

## 📝 更新日志

### v1.0.0 - 2025-12-23

- ✅ 初始版本
- ✅ 支持default和compact两种模式
- ✅ 支持图标和徽章
- ✅ 完整的TypeScript类型定义

---

## 💡 最佳实践

### 1. 使用网格布局

**✅ 推荐**：
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatsCard title="用户数" value={1250} />
  <StatsCard title="活跃" value={850} />
  <StatsCard title="新增" value={120} />
  <StatsCard title="转化率" value="3.2%" />
</div>
```

**❌ 不推荐**：
```tsx
<div className="flex flex-wrap gap-4">
  <StatsCard title="用户数" value={1250} />
  <StatsCard title="活跃" value={850} />
  {/* 卡片大小不一致 */}
</div>
```

### 2. 合理使用描述

**✅ 推荐**：
```tsx
<StatsCard
  title="总收入"
  value="¥125,000"
  description="较上月 +12%"  // 有意义的补充信息
/>
```

**❌ 不推荐**：
```tsx
<StatsCard
  title="总收入"
  value="¥125,000"
  description="收入金额"  // 重复title，无意义
/>
```

### 3. 混合使用模式

**✅ 推荐**：
```tsx
<div className="grid grid-cols-4 gap-4">
  {/* 主要指标 - 标准模式 */}
  <StatsCard title="总收入" value="¥125,000" icon={DollarSign} />

  {/* 次要指标 - 紧凑模式 */}
  <StatsCard title="订单数" value={85} variant="compact" />
  <StatsCard title="退款数" value={3} variant="compact" />
  <StatsCard title="完成率" value="96.5%" variant="compact" />
</div>
```

---

## 🎨 样式定制

### 模式对比

```typescript
// default模式
aspect-ratio: aspect-square (1:1正方形)
min-width: min-w-[140px]
title: text-sm font-medium
value: text-2xl font-bold

// compact模式
aspect-ratio: aspect-[5/2] (5:2横向)
min-width: min-w-[120px]
title: text-xs font-medium
value: text-xl font-bold
padding: pb-1 px-4 pt-3
```

---

## ♿ 无障碍性

- ✅ 使用语义化的Card组件
- ✅ 支持屏幕阅读器
- ✅ 图标配合文本使用，确保语义完整

---

## 🧪 测试

### 测试覆盖

- 单元测试：暂无
- 集成测试：通过仪表板页面验证
- E2E测试：暂无

### 手动测试检查清单

- [ ] 卡片正常显示
- [ ] 图标正常显示
- [ ] 徽章正常显示
- [ ] 不同模式样式正确
- [ ] 移动端布局正常
- [ ] 响应式适配正常

---

**文档版本**：v1.0.0
**最后更新**：2025-12-23
**维护者**：架构专家 + 前端专家团队
