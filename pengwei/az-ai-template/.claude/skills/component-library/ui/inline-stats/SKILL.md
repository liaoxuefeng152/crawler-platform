---
name: inline-stats
description: InlineStats组件的完整使用指南。轻量级统计信息展示组件，用于内联显示关键指标和数据。支持紧凑模式、图标显示、多种Badge变体。适用于仪表板、列表头部、页面标题区域等需要快速展示统计数据的场景。
---

# InlineStats Component Skill

## 📋 组件概述

**组件名称**：`InlineStats`

**组件分类**：`ui`

**文件位置**：`components/ui/inline-stats.tsx`

**用途**：轻量级统计信息展示组件，用于内联显示关键指标和数据

**依赖组件**：
- shadcn/ui: Badge
- lucide-react: LucideIcon (图标类型)

**状态**：✅ 稳定

**核心特性**：
- 🎯 **内联展示**：水平排列的统计信息
- 🎨 **多种Badge变体**：default、secondary、outline、destructive
- 📏 **紧凑模式**：支持更小尺寸的紧凑布局
- 🎭 **图标支持**：每个统计项可配置图标
- 📱 **响应式设计**：移动端自动适配

---

## 🎯 使用场景

### 场景1：仪表板统计（标准使用）

**描述**：在仪表板或列表页面的标题区域展示关键统计信息

```tsx
'use client';

import { InlineStats } from '@/components/ui/inline-stats';
import { Users, CheckCircle, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    { label: '总用户数', value: 1250, icon: Users, variant: 'default' },
    { label: '活跃用户', value: 850, icon: CheckCircle, variant: 'secondary' },
    { label: '待处理', value: 23, icon: AlertCircle, variant: 'destructive' },
  ];

  return (
    <div className="space-y-4">
      {/* PageHeader或其他内容 */}

      {/* 统计信息 */}
      <InlineStats
        stats={stats}
        showIcons={true}
      />

      {/* 页面内容 */}
    </div>
  );
}
```

**关键点**：
- `stats` 是统计项数组
- 每个 stat 需要 `label` 和 `value`
- `icon` 使用 lucide-react 图标
- `variant` 控制 Badge 样式

---

### 场景2：紧凑模式（节省空间）

**描述**：使用更小的尺寸展示统计信息

```tsx
<InlineStats
  stats={[
    { label: '组件', value: 45 },
    { label: '分类', value: 8 },
    { label: '使用', value: 120 },
  ]}
  compact={true}  // 紧凑模式
  showIcons={false}  // 不显示图标
/>
```

**关键点**：
- `compact={true}` 启用紧凑模式
- `showIcons={false}` 隐藏图标节省空间
- 适合空间有限的场景

---

### 场景3：PageHeader中的统计

**描述**：在PageHeader的description或actions中嵌入统计信息

```tsx
import { PageHeader } from '@/components/layout/page-header';
import { InlineStats } from '@/components/ui/inline-stats';
import { Users } from 'lucide-react';

export default function UsersPage() {
  const userStats = [
    { label: '总用户', value: 1250 },
    { label: '活跃', value: 850, variant: 'secondary' },
  ];

  return (
    <PageHeader
      title="用户管理"
      description={
        <div className="flex items-center gap-4">
          <span>管理系统用户账户、权限和状态</span>
          <InlineStats
            stats={userStats}
            compact={true}
            showIcons={false}
          />
        </div>
      }
      icon={Users}
    />
  );
}
```

**关键点**：
- 可以嵌套在 PageHeader 的 description 中
- 使用 `compact` 模式避免占用过多空间
- 与 PageHeader 配合使用效果更佳

---

### 场景4：表格头部统计

**描述**：在ConfigurableTable上方显示统计信息

```tsx
import { InlineStats } from '@/components/ui/inline-stats';

export default function TransactionsPage() {
  const stats = [
    { label: '总记录', value: 1250 },
    { label: '本月', value: 86, variant: 'secondary' },
    { label: '待审核', value: 12, variant: 'destructive' },
  ];

  return (
    <div className="space-y-4">
      {/* 统计信息 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">交易记录</h2>
        <InlineStats
          stats={stats}
          compact={true}
          showIcons={false}
        />
      </div>

      {/* ConfigurableTable */}
      <ConfigurableTable config={config} />
    </div>
  );
}
```

**关键点**：
- 放置在页面标题和表格之间
- 使用 `compact` 模式
- 与表格内容保持一致的数据源

---

### 场景5：使用ComponentStats专用组件

**描述**：针对组件管理页面的预设统计组件

```tsx
import { ComponentStats } from '@/components/ui/inline-stats';

export default function ComponentsPage() {
  return (
    <ComponentStats
      totalComponents={45}
      totalCategories={8}
      totalUsage={120}
      popularComponents={12}
    />
  );
}
```

**关键点**：
- `ComponentStats` 是 InlineStats 的专用版本
- 专门用于组件管理场景
- 自动配置统计项和样式

---

## 🔧 Props API

### InlineStatsProps 接口定义

```typescript
interface InlineStatsProps {
  stats: Array<{
    label: string;                                  // 统计标签
    value: number | string;                         // 统计值
    icon?: LucideIcon;                              // 图标（可选）
    variant?: 'default' | 'secondary' | 'outline' | 'destructive';  // Badge变体
  }>;
  className?: string;                               // 自定义样式类
  compact?: boolean;                                // 紧凑模式（默认false）
  showIcons?: boolean;                              // 显示图标（默认true）
}
```

### Props 详细说明

| Prop名 | 类型 | 默认值 | 必填 | 说明 |
|--------|------|--------|------|------|
| `stats` | `StatItem[]` | - | ✅ | 统计项数组 |
| `className` | `string` | `''` | - | 自定义样式类 |
| `compact` | `boolean` | `false` | - | 紧凑模式，更小尺寸 |
| `showIcons` | `boolean` | `true` | - | 是否显示图标 |

### StatItem 接口定义

```typescript
interface StatItem {
  label: string;                                    // 统计标签（如"总用户数"）
  value: number | string;                          // 统计值（如1250）
  icon?: LucideIcon;                                // 图标组件
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';  // Badge样式变体
}
```

### ComponentStatsProps 接口定义

```typescript
interface ComponentStatsProps {
  totalComponents: number;                          // 总组件数
  totalCategories: number;                          // 总分类数
  totalUsage: number;                               // 总使用次数
  popularComponents: number;                        // 常用组件数
  className?: string;                               // 自定义样式类
}
```

---

## ⚠️ 注意事项

### 设计原则

1. **简洁明了**：每个统计项应简短扼要，避免过长文案
2. **数量控制**：建议不超过4-5个统计项，避免信息过载
3. **语义化图标**：选择与统计项语义相关的lucide-react图标
4. **一致性**：相同类型的统计应使用相同的variant

### 使用限制

1. **stats数组限制**：
   - 必须包含至少1个统计项
   - 建议不超过5个统计项
   - 每个统计项必须包含 `label` 和 `value`

2. **value类型限制**：
   - 支持 `number` 或 `string`
   - 数字会自动格式化显示
   - 字符串保持原样显示

3. **图标限制**：
   - 必须从 lucide-react 导入
   - 图标尺寸固定为 `w-3.5 h-3.5`
   - 可通过 `showIcons` 全局控制显示

### 常见问题

**Q: InlineStats 和 StatsCard 有什么区别？**

A:
- **InlineStats**：内联水平排列，适合嵌入标题行或工具栏
- **StatsCard**：卡片式布局，适合独立的数据展示区域

**Q: 如何控制统计项的间距？**

A: 使用 `className` 自定义间距：
```tsx
<InlineStats
  stats={stats}
  className="gap-4"  // 增加间距
/>
```

**Q: 可以使用自定义颜色吗？**

A: 通过 `variant` 控制Badge样式，如需完全自定义可通过 `className`：
```tsx
stats={[
  {
    label: '自定义',
    value: 100,
    variant: 'default',  // 使用预设变体
  }
]}
```

**Q: 如何处理超长的数值？**

A: 使用字符串格式化：
```tsx
stats={[
  {
    label: '总访问量',
    value: '1.2M',  // 格式化后的字符串
  }
]}
```

**Q: compact模式的尺寸差异？**

A:
- **默认模式**：text-sm, px-2.5 py-1
- **紧凑模式**：text-xs, px-2 py-0.5

---

## 🔗 相关组件

### 依赖的组件

- **Badge (shadcn/ui)** - 徽章组件，用于显示统计项

### 相关组件

- **StatsCard** - 卡片式统计展示组件
- **PageHeader** - 页面标题组件，常与InlineStats配合使用

### 被依赖的组件

- **ComponentStats** - 基于InlineStats的专用统计组件
- **仪表板页面** - 用于展示关键指标

### 替代方案

- **StatsCard** - 需要独立卡片展示时使用
- **自定义实现** - 不推荐，违反项目规范

---

## 📚 更多资源

### 组件源码

- 文件位置：`components/ui/inline-stats.tsx` (83行)

### 相关文档

- [THEME.md - Badge组件样式](../../../../.claude/docs/THEME.md#badge-组件)
- [组件开发检查清单](../../../../.claude/docs/development/COMPONENT_DEVELOPMENT_CHECKLIST.md)

### 使用示例

- 组件管理页面：`app/dashboard/components/page.tsx`

---

## 📝 更新日志

### v1.0.0 - 2025-12-23

- ✅ 初始版本
- ✅ 支持多种Badge变体
- ✅ 支持紧凑模式
- ✅ 支持图标显示
- ✅ 提供ComponentStats专用组件

---

## 💡 最佳实践

### 1. 控制统计项数量

**✅ 推荐**：
```tsx
<InlineStats
  stats={[
    { label: '用户', value: 1250 },
    { label: '活跃', value: 850 },
    { label: '待审', value: 12 },
  ]}  // 3个统计项，清晰明了
/>
```

**❌ 不推荐**：
```tsx
<InlineStats
  stats={[
    { label: '用户', value: 1250 },
    { label: '活跃', value: 850 },
    { label: '待审', value: 12 },
    { label: '已完成', value: 950 },
    { label: '进行中', value: 180 },
    { label: '已取消', value: 45 },
    { label: '逾期', value: 23 },
  ]}  // 7个统计项，信息过载
/>
```

### 2. 使用语义化图标

**✅ 推荐**：
```tsx
import { Users, CheckCircle, AlertCircle } from 'lucide-react';

stats={[
  { label: '总用户', value: 1250, icon: Users },  // 语义相关
  { label: '活跃', value: 850, icon: CheckCircle },
  { label: '警告', value: 12, icon: AlertCircle },
]}
```

**❌ 不推荐**：
```tsx
import { Zap, Coffee, Music } from 'lucide-react';

stats={[
  { label: '总用户', value: 1250, icon: Zap },  // 语义不相关
  { label: '活跃', value: 850, icon: Coffee },
  { label: '警告', value: 12, icon: Music },
]}
```

### 3. 合理使用variant

**✅ 推荐**：
```tsx
stats={[
  { label: '总用户', value: 1250, variant: 'default' },  // 主要指标
  { label: '活跃', value: 850, variant: 'secondary' },  // 次要指标
  { label: '异常', value: 12, variant: 'destructive' },  // 警告指标
]}
```

**❌ 不推荐**：
```tsx
stats={[
  { label: '总用户', value: 1250, variant: 'destructive' },  // 错误的变体
  { label: '活跃', value: 850, variant: 'outline' },
  { label: '异常', value: 12, variant: 'default' },  // 错误的变体
]}
```

### 4. 选择合适的模式

**✅ 推荐**：
```tsx
// 空间充足 - 标准模式
<InlineStats stats={stats} />

// 空间有限 - 紧凑模式
<InlineStats stats={stats} compact={true} />
```

**❌ 不推荐**：
```tsx
// 空间有限但使用标准模式
<InlineStats stats={stats} />  // 可能导致换行

// 空间充足但使用紧凑模式
<InlineStats stats={stats} compact={true} />  // 信息不够突出
```

### 5. 配合PageHeader使用

**✅ 推荐**：
```tsx
<PageHeader
  title="用户管理"
  description={
    <div className="flex items-center gap-4">
      <span>管理系统用户</span>
      <InlineStats
        stats={[
          { label: '总用户', value: 1250 },
          { label: '活跃', value: 850 },
        ]}
        compact={true}
        showIcons={false}
      />
    </div>
  }
  icon={Users}
/>
```

**❌ 不推荐**：
```tsx
// 分开显示，不连贯
<PageHeader
  title="用户管理"
  description="管理系统用户"
  icon={Users}
/>

<InlineStats stats={stats} />
```

---

## 🎨 样式定制

### 尺寸对比

```typescript
// 标准模式
className="text-sm px-2.5 py-1"
iconSize="w-3.5 h-3.5"

// 紧凑模式
className="text-xs px-2 py-0.5"
iconSize="w-3.5 h-3.5" (保持不变)
```

### Badge变体样式

```typescript
// default
bg-primary text-primary-foreground

// secondary
bg-secondary text-secondary-foreground

// outline
border border-input bg-background

// destructive
bg-destructive text-destructive-foreground
```

### 自定义间距

```tsx
// 默认间距 gap-2
<InlineStats stats={stats} />

// 增加间距
<InlineStats stats={stats} className="gap-4" />

// 减少间距
<InlineStats stats={stats} className="gap-1" />
```

---

## ♿ 无障碍性

- ✅ 使用语义化的Badge组件
- ✅ 支持屏幕阅读器
- ✅ 图标配合文本使用，确保语义完整
- ✅ 色彩对比度符合WCAG标准

---

## 🧪 测试

### 测试覆盖

- 单元测试：暂无
- 集成测试：通过仪表板页面验证
- E2E测试：暂无

### 手动测试检查清单

- [ ] 统计项正常显示
- [ ] 图标正常显示
- [ ] 不同variant样式正确
- [ ] compact模式尺寸正确
- [ ] showIcons控制正常
- [ ] 移动端布局正常
- [ ] 响应式适配正常

---

**文档版本**：v1.0.0
**最后更新**：2025-12-23
**维护者**：架构专家 + 前端专家团队
