# 深瞳AI Coding - 设计风格指南

## 1. 概述

### 设计理念

深瞳AI Coding 采用了现代化、简洁的设计语言，致力于为用户提供清晰、高效、美观的用户界面体验。设计系统基于以下核心原则：

- **一致性**：统一的视觉语言和交互模式
- **可访问性**：符合WCAG标准的无障碍设计
- **响应式**：移动端优先的弹性布局
- **现代化**：采用最新的设计趋势和技术
- **可维护性**：基于设计令牌的系统化管理

### 技术架构

- **前端框架**：Next.js 16 + React 19
- **样式系统**：Tailwind CSS 4 + CSS Variables
- **组件库**：shadcn/ui + 自定义组件
- **色彩空间**：OKLCH（现代感知均匀色彩空间）
- **字体系统**：Geist Sans + Geist Mono
- **构建工具**：Turbopack

## 2. 配色方案

### 主色调

项目采用蓝色作为主色调，使用 OKLCH 色彩空间实现感知均匀的颜色分布。

```css
/* 品牌蓝色 (#1890ff) 的完整色阶 */
--color-brand-50: oklch(0.97 0.01 238.66); /* 最浅蓝 */
--color-brand-100: oklch(0.94 0.02 238.66);
--color-brand-200: oklch(0.89 0.04 238.66);
--color-brand-300: oklch(0.83 0.07 238.66);
--color-brand-400: oklch(0.73 0.12 238.66);
--color-brand-500: oklch(0.61 0.18 238.66);
--color-brand-600: #1890ff; /* 主色 */
--color-brand-700: oklch(0.47 0.18 238.66);
--color-brand-800: oklch(0.38 0.16 238.66);
--color-brand-900: oklch(0.31 0.14 238.66); /* 最深蓝 */
```

### 语义化颜色

#### 主色调

- **Primary**：`var(--color-brand-600)` - 主要操作按钮、链接
- **Primary Foreground**：`oklch(1 0 0)` - 主色上的文字

#### 功能色

- **Success**：`oklch(0.577 0.245 142.49)` - 成功状态、确认操作
- **Warning**：`oklch(0.78 0.14 58.51)` - 警告状态、注意事项
- **Error/Destructive**：`oklch(0.577 0.245 27.325)` - 错误状态、删除操作
- **Info**：`oklch(0.61 0.18 238.66)` - 信息提示、帮助说明

#### 中性色

- **Foreground**：`oklch(0.145 0 0)` - 主要文字
- **Muted Foreground**：`oklch(0.556 0 0)` - 次要文字
- **Card**：`oklch(1 0 0)` - 卡片背景
- **Border**：`oklch(0.922 0 0)` - 边框颜色
- **Input**：`oklch(0.922 0 0)` - 输入框边框

### 主题适配

#### 明亮主题

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --border: oklch(0.922 0 0);
  --muted: oklch(0.97 0 0);
  --accent: oklch(0.97 0 0);
}
```

#### 暗黑主题

```css
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --border: oklch(1 0 0 / 10%);
  --muted: oklch(0.269 0 0);
  --accent: oklch(0.269 0 0);
}
```

## 3. 字体排版

### 字体族

- **主字体**：Geist Sans（无衬线字体，现代简洁）
- **等宽字体**：Geist Mono（代码、数字显示）

```css
--font-sans: var(--font-geist-sans);
--font-mono: var(--font-geist-mono);
```

### 字体大小层级

#### 标题层级

- **H1 - 页面标题**：`text-3xl font-semibold` (30px)
- **H2 - 区块标题**：`text-2xl font-semibold` (24px)
- **H3 - 组件标题**：`text-xl font-semibold` (20px)
- **H4 - 卡片标题**：`text-lg font-medium` (18px)
- **H5 - 小标题**：`text-base font-medium` (16px)

#### 正文层级

- **Body Large**：`text-base` (16px)
- **Body Regular**：`text-sm` (14px)
- **Body Small**：`text-xs` (12px)

#### 特殊用途

- **大数值**：`text-2xl font-bold` (24px)
- **中数值**：`text-xl font-bold` (20px)
- **小数值**：`text-lg font-bold` (18px)
- **标签文字**：`text-xs font-medium` (12px)

### 行高

- **标题行高**：`leading-tight` (1.25)
- **正文行高**：`leading-normal` (1.5)
- **紧凑行高**：`leading-snug` (1.375)

### 字重

- **Regular**：`font-normal` (400)
- **Medium**：`font-medium` (500)
- **Semibold**：`font-semibold` (600)
- **Bold**：`font-bold` (700)

### 文本处理

- **文本截断**：`.line-clamp-1`、`.line-clamp-2`、`.line-clamp-3`
- **字间距**：`tracking-tight` (默认)
- **字符间距**：根据需要调整

## 4. 布局

### 容器系统

- **全屏宽度**：`w-full`
- **最大宽度**：`max-w-7xl` (1280px)
- **居中对齐**：`mx-auto`

### 网格系统

#### 响应式断点

- **Mobile**：< 640px (默认)
- **Tablet**：640px - 1024px (`sm:`、`md:`)
- **Desktop**：1024px - 1280px (`lg:`)
- **Large Desktop**：> 1280px (`xl:`、`2xl:`)

#### 列布局

- **单列**：`grid-cols-1`
- **双列**：`grid-cols-1 sm:grid-cols-2`
- **三列**：`grid-cols-1 md:grid-cols-3`
- **四列**：`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`

#### 常用网格模式

```css
/* 统计卡片网格 */
.stats-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3;
}

/* 组件卡片网格 */
.component-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3;
}

/* 两列布局 */
.two-column {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-3;
}
```

### 侧边栏布局

- **固定宽度侧边栏**：`w-64`
- **自适应内容区**：`flex-1`
- **响应式侧边栏**：移动端折叠，桌面端固定

## 5. 间距

### 基础间距单位

使用 `rem` 作为基础单位，确保间距与字体大小成比例。

### 间距规范

#### 内边距 (Padding)

- **无间距**：`p-0`
- **极小间距**：`p-1` (4px)
- **小间距**：`p-2` (8px)
- **常规间距**：`p-3` (12px)
- **中等间距**：`p-4` (16px)
- **大间距**：`p-6` (24px)
- **超大间距**：`p-8` (32px)

#### 外边距 (Margin)

- **垂直间距**：`space-y-2`、`space-y-3`、`space-y-4`
- **水平间距**：`space-x-2`、`space-x-3`、`space-x-4`
- **元素间距**：`gap-2`、`gap-3`、`gap-4`

#### 组件特定间距

##### Card 组件

- **整体内边距**：`p-4` 或 `p-6`
- **标题间距**：`pb-1 px-4 pt-3`
- **内容间距**：`pt-2`

##### 按钮组

- **按钮间距**：`space-x-2`
- **图标间距**：`gap-2`

##### 表单元素

- **字段间距**：`space-y-4`
- **标签间距**：`mb-2`

### 响应式间距

- **移动端**：使用较小间距
- **桌面端**：使用较大间距
- **示例**：`p-4 md:p-6`

## 6. 组件样式

### Card 组件

```css
.base-card {
  @apply rounded-xl border shadow-sm bg-white/80 backdrop-blur-sm;
}

.card-hover {
  @apply hover:shadow-lg hover:border-primary/30;
}

.card-padding {
  @apply pb-1 px-4 pt-3;
}
```

#### 变体

- **默认卡片**：白色背景，轻微阴影
- **悬浮卡片**：毛玻璃效果 (`bg-white/80 backdrop-blur-sm`)
- **交互卡片**：悬停时增强阴影和边框

### Button 组件

基于 `class-variance-authority` (CVA) 管理变体：

#### 尺寸变体

- **Small**：`h-8 px-3 text-xs` (32px高)
- **Default**：`h-9 px-4 py-2 text-sm` (36px高)
- **Large**：`h-10 px-6 text-sm` (40px高)
- **Icon**：`h-9 w-9` (正方形)

#### 样式变体

- **Default**：`bg-primary text-primary-foreground`
- **Outline**：`border shadow-xs hover:bg-accent`
- **Ghost**：透明背景悬停效果
- **Link**：下划线链接样式
- **Destructive**：`bg-destructive text-destructive-foreground`

#### 状态样式

- **悬停**：`hover:scale-105`、`hover:bg-primary/5`
- **禁用**：`opacity-50 cursor-not-allowed`
- **加载**：`animate-spin` (图标)

### Badge 组件

```css
.status-badge {
  @apply inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium;
}

/* 状态颜色映射 */
.badge-active {
  @apply bg-green-100 text-green-800;
}
.badge-inactive {
  @apply bg-gray-100 text-gray-800;
}
.badge-suspended {
  @apply bg-red-100 text-red-800;
}
```

### StatsCard 组件

#### 紧凑模式

```css
.stats-card-compact {
  @apply min-w-[120px] aspect-[5/2];
}
```

#### 默认模式

```css
.stats-card-default {
  @apply min-w-[140px] aspect-square;
}
```

### Form 组件

#### Input 组件

```css
.form-input {
  @apply h-9 text-sm border-gray-200 focus:border-primary focus:ring-primary/20;
}

.search-input {
  @apply pl-10 w-64; /* 带图标的搜索框 */
}
```

#### Select 组件

```css
.form-select {
  @apply h-9 text-sm border-gray-200 min-w-[120px];
}
```

### Table 组件

```css
.data-table {
  @apply w-full caption-bottom text-sm;
}

.table-header {
  @apply border-b;
}

.table-row {
  @apply border-b transition-colors hover:bg-muted/50;
}

.table-cell {
  @apply p-4 align-middle;
}
```

### Dialog 组件

```css
.dialog-content {
  @apply sm:max-w-[425px];
}

.dialog-header {
  @apply flex flex-col space-y-1.5 text-center sm:text-left;
}
```

## 7. 阴影

### 阴影层级

使用 Tailwind CSS 的预设阴影，配合自定义阴影效果。

#### 基础阴影

- **无阴影**：`shadow-none`
- **轻微阴影**：`shadow-sm` (卡片默认)
- **小阴影**：`shadow` (悬浮状态)
- **中等阴影**：`shadow-md` (激活状态)
- **大阴影**：`shadow-lg` (增强悬浮)
- **超大阴影**：`shadow-xl` (模态框)

#### 自定义阴影

```css
.custom-shadow {
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.hover-shadow {
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
```

#### 使用场景

- **卡片组件**：`shadow-sm` → `hover:shadow-lg`
- **按钮组件**：`shadow-sm` (outline变体)
- **模态框**：`shadow-xl`
- **下拉菜单**：`shadow-lg`

## 8. 动画

### 过渡动画

```css
.transition-standard {
  @apply transition-all duration-300 ease-in-out;
}

.transition-fast {
  @apply transition-all duration-200 ease-in-out;
}

.transition-slow {
  @apply transition-all duration-500 ease-in-out;
}
```

### 常用动画效果

#### 悬停动画

```css
.hover-scale {
  @apply transition-transform duration-200 hover:scale-105;
}

.hover-lift {
  @apply transition-all duration-300 hover:-translate-y-1;
}
```

#### 交互动画

```css
.icon-rotate {
  @apply transition-transform duration-200 group-hover:rotate-90;
}

.icon-slide {
  @apply transition-transform duration-200 group-hover:translate-x-1;
}

.icon-scale {
  @apply transition-transform duration-200 group-hover:scale-110;
}
```

#### 页面动画

```css
.fade-in {
  @apply animate-fade-in;
}

.slide-up {
  @apply animate-slide-up-from-bottom-1;
}

.scale-in {
  @apply animate-in zoom-in-95;
}
```

#### 加载动画

```css
.loading-spin {
  @apply animate-spin;
}

.loading-pulse {
  @apply animate-pulse;
}
```

### 动画原则

- **时长控制**：微交互 200ms，普通交互 300ms，复杂动画 500ms
- **缓动函数**：使用 `ease-in-out` 确保自然的运动
- **性能优化**：使用 `transform` 和 `opacity` 进行GPU加速
- **可访问性**：支持 `prefers-reduced-motion` 媒体查询

## 9. 圆角半径

### 动态圆角系统

基于 CSS 变量的圆角系统，支持统一调整。

```css
:root {
  --radius: 0.625rem; /* 10px - 基础圆角 */
}

.radius-sm {
  border-radius: calc(var(--radius) - 4px);
} /* 6px */
.radius-md {
  border-radius: calc(var(--radius) - 2px);
} /* 8px */
.radius-lg {
  border-radius: var(--radius);
} /* 10px */
.radius-xl {
  border-radius: calc(var(--radius) + 4px);
} /* 14px */
.radius-2xl {
  border-radius: calc(var(--radius) + 8px);
} /* 18px */
.radius-3xl {
  border-radius: calc(var(--radius) + 12px);
} /* 22px */
.radius-4xl {
  border-radius: calc(var(--radius) + 16px);
} /* 26px */
```

### Tailwind CSS 映射

```css
.rounded-sm {
  @apply radius-sm;
}
.rounded {
  @apply radius-md;
}
.rounded-md {
  @apply radius-md;
}
.rounded-lg {
  @apply radius-lg;
}
.rounded-xl {
  @apply radius-xl;
}
.rounded-2xl {
  @apply radius-2xl;
}
.rounded-3xl {
  @apply radius-3xl;
}
.rounded-4xl {
  @apply radius-4xl;
}
```

### 使用规范

#### 组件圆角

- **Button**：`rounded-md` (8px)
- **Card**：`rounded-xl` (14px)
- **Input**：`rounded-md` (8px)
- **Badge**：`rounded-full` (完全圆形)
- **Dialog**：`rounded-lg` (10px)

#### 特殊圆角

- **头像**：`rounded-full`
- **标签**：`rounded-md`
- **提示框**：`rounded-lg`
- **卡片组**：`rounded-xl`

### 响应式圆角

```css
.responsive-radius {
  @apply rounded-lg md:rounded-xl;
}
```

## 10. 页面布局规范

### 10.1 PageHeader组件标准 ⭐

PageHeader是项目统一的页面标题组件，所有Dashboard页面必须使用此组件，不得使用自定义h1标题。

#### 推荐配置

```tsx
<PageHeader
  variant="card"        // 蓝色渐变背景（推荐）
  size="sm"            // 紧凑布局（推荐）
  title="页面标题"      // 2-6个字，简洁明确
  description="页面功能描述" // 20-40个字，说明用途
  icon={Icon}          // lucide-react图标，必须
/>
```

#### API文档

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|-----|------|-----|-------|------|
| `title` | string | ✅ | - | 页面主标题，2-6个字 |
| `description` | string | ⭐推荐 | - | 页面描述，20-40个字 |
| `icon` | LucideIcon | ⭐推荐 | - | 标题左侧图标，从lucide-react导入 |
| `variant` | 'card' \| 'default' \| 'minimal' \| 'gradient' | - | 'card' | 视觉变体（推荐card） |
| `size` | 'sm' \| 'md' \| 'lg' \| 'xl' | - | 'lg' | 尺寸变体（推荐sm） |
| `actions` | ReactNode | - | - | 右侧操作按钮区域 |
| `badge` | string | - | - | 标题旁徽章文本 |
| `breadcrumbs` | Array | - | - | 面包屑导航 |
| `className` | string | - | - | 自定义样式类 |

#### Variant变体说明

| Variant | 视觉效果 | 使用场景 |
|---------|---------|----------|
| **card** ⭐ | 蓝色渐变背景 + 毛玻璃效果 | **推荐用于大多数页面** |
| default | 白色背景 + 灰色边框 | 通用页面 |
| minimal | 无背景，仅底部边框 | 简约风格页面 |
| gradient | 白色背景 + 更大胆标题 | 强调型页面 |

#### Size尺寸说明

| Size | 容器内边距 | 标题大小 | 图标大小 | 使用场景 |
|------|----------|---------|---------|----------|
| **sm** ⭐ | p-4 | text-xl | w-5 h-5 | **紧凑页面推荐** |
| md | p-6 | text-2xl | w-6 h-6 | 标准页面 |
| lg | p-6 | text-3xl | w-8 h-8 | 大型页面 |
| xl | p-8 | text-4xl | w-10 h-10 | 特大型页面 |

#### 视觉效果（card variant）

- **背景**：`bg-gradient-to-br from-blue-50/90 via-blue-100/50 to-transparent`
- **毛玻璃**：`backdrop-blur-sm`
- **边框**：`border border-blue-200/50`
- **圆角**：`rounded-xl`
- **阴影**：`shadow-sm`
- **内边距**：`p-4`（size="sm"时）

---

### 10.2 标准布局结构

#### 完整页面模板

```tsx
'use client';

import { PageHeader } from '@/components/layout/page-header';
import { LucideIcon } from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';

export default function YourPage() {
  return (
    <DashboardLayout>
      {/* ✅ 使用space-y-4包裹所有内容 */}
      <div className="space-y-4">
        {/* ✅ PageHeader必须是第一个元素 */}
        <PageHeader
          variant="card"
          size="sm"
          title="页面标题"
          description="页面功能描述，简短说明此页面的用途和价值"
          icon={Icon}
        />

        {/* 页面主体内容 */}
        <div className="...">
          {/* 你的内容 */}
        </div>
      </div>
    </DashboardLayout>
  );
}
```

#### 带操作按钮的模板

```tsx
<PageHeader
  variant="card"
  size="sm"
  title="用户管理"
  description="管理系统用户账户、权限和状态"
  icon={Users}
  actions={
    <div className="flex gap-2">
      <Button variant="outline" size="sm">
        <Upload className="w-4 h-4 mr-2" />
        导入用户
      </Button>
      <Button size="sm">
        <Plus className="w-4 h-4 mr-2" />
        新增用户
      </Button>
    </div>
  }
/>
```

#### 布局规范要点

- ✅ **必须使用** `PageHeader` 组件，**禁止**自定义h1标题
- ✅ **必须使用** `space-y-4` 包裹PageHeader和内容区
- ✅ **必须设置** `variant="card"` 和 `size="sm"`（默认配置）
- ✅ **必须包含** `title`、`description`、`icon` 三个属性
- ✅ **操作按钮** 使用 `actions` prop，自动右对齐
- ✅ **按钮间距** 使用 `gap-2`
- ✅ **按钮尺寸** 统一使用 `size="sm"`

---

### 10.3 常见场景代码模板

#### 场景1：管理类页面（带新增按钮）

```tsx
<PageHeader
  variant="card"
  size="sm"
  title="账本管理"
  description="创建和管理多人共享账本，支持协作记账和数据分析"
  icon={BookOpen}
  actions={
    <Button size="sm" className="gap-2">
      <Plus className="w-4 h-4" />
      创建账本
    </Button>
  }
/>
```

#### 场景2：列表类页面（带搜索和导入）

```tsx
<PageHeader
  variant="card"
  size="sm"
  title="交易记录"
  description="记录和查看所有收支明细，支持筛选、搜索和导出"
  icon={Receipt}
  actions={
    <div className="flex gap-2">
      <Button variant="outline" size="sm">
        <Upload className="w-4 h-4 mr-2" />
        导入数据
      </Button>
      <Button variant="outline" size="sm">
        <Download className="w-4 h-4 mr-2" />
        导出报表
      </Button>
      <Button size="sm">
        <Plus className="w-4 h-4 mr-2" />
        新增记录
      </Button>
    </div>
  }
/>
```

#### 场景3：设置类页面（无操作按钮）

```tsx
<PageHeader
  variant="card"
  size="sm"
  title="系统设置"
  description="配置系统参数和用户偏好设置"
  icon={Settings}
/>
```

#### 场景4：带徽章的页面

```tsx
<PageHeader
  variant="card"
  size="sm"
  title="自动化工作流"
  description="配置和管理自动化任务，提升工作效率"
  icon={Workflow}
  badge="Beta"  // 显示标题旁边的徽章
/>
```

---

### 10.4 新页面开发检查清单

#### 开发前必读

- [ ] **查看参考页面**
  - `app/dashboard/components/page.tsx` - 标准示例
  - `app/dashboard/user-management/page.tsx` - 带操作按钮
  - `app/dashboard/math-tools/page.tsx` - 简洁风格

- [ ] **导入必需组件**
  ```tsx
  import { PageHeader } from '@/components/layout/page-header';
  import { IconName } from 'lucide-react';
  ```

- [ ] **选择合适的图标**
  - 从 lucide-react 选择语义相关的图标
  - 确保图标与页面功能匹配

#### 开发时检查

- [ ] **使用PageHeader组件**（不是自定义h1）
- [ ] **配置variant="card"**（蓝色渐变背景）
- [ ] **配置size="sm"**（紧凑布局）
- [ ] **包含title + description + icon**（三个必备属性）
- [ ] **使用space-y-4包裹**（布局间距）
- [ ] **操作按钮使用actions prop**（右对齐）
- [ ] **按钮统一size="sm"**（尺寸一致）

#### 验收检查

- [ ] **视觉一致性**
  - 蓝色渐变背景正常显示
  - 毛玻璃效果生效
  - 圆角和阴影符合规范

- [ ] **样式符合THEME.md**
  - 标题字体：text-xl font-semibold（size="sm"）
  - 描述字体：text-sm
  - 颜色：text-gray-900

- [ ] **响应式适配**
  - 移动端字体和间距正常
  - 图标不溢出
  - 描述文本换行正常

- [ ] **操作按钮对齐**
  - 按钮在右侧对齐
  - 按钮间距使用gap-2
  - 按钮尺寸统一

---

### 10.5 常见问题与错误

#### ❌ 错误示例1：使用自定义h1标题

```tsx
// ❌ 错误做法
<div className="flex justify-between items-center">
  <div>
    <h1 className="text-3xl font-bold text-gray-900">账本管理</h1>
    <p className="text-muted-foreground mt-1">创建和管理多人共享账本</p>
  </div>
</div>

// ✅ 正确做法
<PageHeader
  variant="card"
  size="sm"
  title="账本管理"
  description="创建和管理多人共享账本"
  icon={BookOpen}
/>
```

#### ❌ 错误示例2：缺少必备属性

```tsx
// ❌ 错误做法：缺少description和icon
<PageHeader
  title="用户管理"
/>

// ✅ 正确做法：包含所有推荐属性
<PageHeader
  variant="card"
  size="sm"
  title="用户管理"
  description="管理系统用户账户、权限和状态"
  icon={Users}
/>
```

#### ❌ 错误示例3：未使用space-y-4包裹

```tsx
// ❌ 错误做法
<DashboardLayout>
  <PageHeader ... />
  <div>内容</div>
</DashboardLayout>

// ✅ 正确做法
<DashboardLayout>
  <div className="space-y-4">
    <PageHeader ... />
    <div>内容</div>
  </div>
</DashboardLayout>
```

#### ❌ 错误示例4：操作按钮未使用actions prop

```tsx
// ❌ 错误做法：按钮放在外部
<div className="flex justify-between">
  <PageHeader ... />
  <Button>创建</Button>
</div>

// ✅ 正确做法：使用actions prop
<PageHeader
  ...
  actions={<Button size="sm">创建</Button>}
/>
```

---

### 10.6 现有标准页面参考

| 页面路径 | 标题 | 描述 | 图标 | 操作按钮 | 评级 |
|---------|------|------|------|---------|------|
| `app/dashboard/components/page.tsx` | 组件管理中心 | 探索和管理您的 shadcn/ui 组件库 | Sparkles | 无 | ⭐⭐⭐⭐⭐ |
| `app/dashboard/user-management/page.tsx` | 用户管理中心 | 管理系统用户账户、权限和状态 | Users | 新增用户 | ⭐⭐⭐⭐⭐ |
| `app/dashboard/math-tools/page.tsx` | 数学工具中心 | 强大的数学计算工具集合 | Calculator | 无 | ⭐⭐⭐⭐⭐ |

**推荐流程**：
1. 打开上述任一参考页面
2. 复制PageHeader的使用代码
3. 修改title、description、icon
4. 根据需要添加actions

---

### 10.7 快速参考

#### 最小化模板

```tsx
<PageHeader
  variant="card"
  size="sm"
  title="页面标题"
  description="页面功能描述"
  icon={Icon}
/>
```

#### 完整模板（带操作按钮）

```tsx
<PageHeader
  variant="card"
  size="sm"
  title="页面标题"
  description="页面功能描述"
  icon={Icon}
  actions={
    <div className="flex gap-2">
      <Button variant="outline" size="sm">次要操作</Button>
      <Button size="sm">主要操作</Button>
    </div>
  }
/>
```

#### 布局容器模板

```tsx
<DashboardLayout>
  <div className="space-y-4">
    <PageHeader ... />
    {/* 页面内容 */}
  </div>
</DashboardLayout>
```

---

## 最佳实践

### 1. 一致性原则

- 始终使用设计令牌，避免硬编码值
- 保持相同的间距、颜色和动画时长
- 遵循组件的预定变体和状态

### 2. 可访问性

- 确保足够的颜色对比度 (4.5:1)
- 支持键盘导航和屏幕阅读器
- 提供适当的焦点指示器

### 3. 响应式设计

- 移动端优先的设计方法
- 使用相对单位 (rem, em, %)
- 测试各种屏幕尺寸的显示效果

### 4. 性能优化

- 使用 CSS 变量而非重复的样式规则
- 优化动画性能 (transform > position)
- 懒加载非关键样式

### 5. 维护性

- 保持 CSS 的模块化和组件化
- 使用语义化的类名
- 定期审查和更新设计令牌

## 使用示例

### 创建一个新页面

```jsx
export default function NewPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="新功能" description="功能描述" icon={FeatureIcon} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 使用统一的 Card 组件 */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>卡片标题</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">卡片内容</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

### 创建新组件

```tsx
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-10 px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```

---

_最后更新：2025年1月_
