# 深瞳AI Coding - 设计风格指南

> **权威标准**：本文档是项目UI/UX设计的唯一权威标准
> **更新日期**：2026-06-04
> **优先级**：当前浅色蓝白、深色蓝灰科技感设计规范优先于历史样式

---

## 1. 设计风格概览

### 1.1 双模式设计理念

项目采用**浅色/深色双模式差异化设计**。浅色模式保留品牌蓝白风格，深色模式采用深蓝灰科技感风格，使用浅蓝色 `#89ceff` 作为强调色，形成统一且具有辨识度的视觉体系。

#### 浅色模式（Light Mode）

**风格定位**：蓝白色清新商务风格

**核心特征**：

- 纯色背景为主（白色 + 蓝色）
- 品牌蓝 #1890ff 贯穿全局
- 淡蓝色渐变装饰
- 简洁干净的视觉层次

#### 深色模式（Dark Mode）

**风格定位**：深蓝灰科技感风格 + 浅蓝色强调

**核心特征**：

- 深蓝灰色背景系（`#0c1324` ~ `#2e3447` 五级层次）
- 浅蓝色 `#89ceff` 作为强调色，用于文字、边框、图标高亮
- 主按钮为深蓝灰底、白色字、浅蓝色边框悬浮效果
- `text-primary` 在深色模式表示浅蓝色强调 `#89ceff`
- 浅蓝淡透装饰网格、粒子效果增强科技感
- 通过语义变量控制颜色，避免组件硬编码浅色或深色主题

### 1.2 技术架构

- **前端框架**：Next.js 16 + React 19
- **样式系统**：Tailwind CSS 4 + CSS Variables
- **组件库**：shadcn/ui + 自定义组件
- **色彩空间**：OKLCH（现代感知均匀色彩空间）
- **字体系统**：Geist Sans + Geist Mono
- **主题管理**：next-themes（`attribute="class"`, `defaultTheme="dark"`）

---

## 2. CSS 变量体系

### 2.1 品牌色系

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
--color-brand-900: oklch(0.31 0.14 238.66);
--color-brand-950: oklch(0.24 0.12 238.66); /* 最深蓝 */
```

### 2.2 浅色模式变量（`:root`）

```css
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0); /* 纯白色背景 */
  --foreground: oklch(0.145 0 0); /* 近黑色文字 */
  --card: oklch(1 0 0); /* 纯白色卡片 */
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);

  /* 品牌蓝作为主色 */
  --primary: var(--color-brand-600); /* #1890ff */
  --primary-surface: var(--color-brand-600);
  --primary-foreground: oklch(1 0 0); /* 白色 */
  --brand-accent: var(--color-brand-600); /* 品牌强调色 */

  /* 深色模式专用表面层级（浅色模式预留） */
  --surface-lowest: #070d1f;
  --surface-page: #0c1324;
  --surface-low: #151b2d;
  --surface-container: #191f31;
  --surface-high: #23293c;
  --surface-highest: #2e3447;

  /* 深色模式专用文字层级（浅色模式预留） */
  --text-secondary: #bec8d2;
  --text-muted-deep: #88929b;
  --outline-deep: #3e4850;

  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: var(--color-brand-600);

  /* 侧边栏 */
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: var(--color-brand-600);
  --sidebar-primary-foreground: oklch(1 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: var(--color-brand-600);
}
```

### 2.3 深色模式变量（`.dark`）

```css
.dark {
  --background: #0c1324; /* 深蓝灰背景 */
  --foreground: #dce1fb; /* 浅蓝白文字 */
  --card: #191f31; /* 深蓝灰卡片 */
  --card-foreground: #dce1fb;
  --popover: #23293c;
  --popover-foreground: #dce1fb;

  /* 浅蓝色强调色用于文字/边框/图标高亮 */
  --primary: #89ceff; /* 浅蓝色强调 */
  --primary-surface: #0c1324; /* 深蓝灰按钮面 */
  --primary-foreground: #ffffff;
  --brand-accent: #89ceff; /* 品牌强调色 */

  --secondary: #191f31;
  --secondary-foreground: #dce1fb;
  --muted: #151b2d;
  --muted-foreground: #88929b;
  --accent: #23293c;
  --accent-foreground: #dce1fb;
  --destructive: oklch(0.704 0.191 22.216);
  --border: rgba(62, 72, 80, 0.45);
  --input: #151b2d;
  --ring: rgba(137, 206, 255, 0.35);

  /* 图表颜色 */
  --chart-1: #89ceff;
  --chart-2: #ffb95f;
  --chart-3: #4ade80;
  --chart-4: #f472b6;
  --chart-5: #a78bfa;

  /* 侧边栏 */
  --sidebar: #070d1f;
  --sidebar-foreground: #bec8d2;
  --sidebar-primary: #89ceff;
  --sidebar-primary-foreground: #00344d;
  --sidebar-accent: rgba(137, 206, 255, 0.1);
  --sidebar-accent-foreground: #89ceff;
  --sidebar-border: rgba(62, 72, 80, 0.45);
  --sidebar-ring: rgba(137, 206, 255, 0.35);
}
```

### 2.4 变量对照表

| 变量                | 浅色模式                | 深色模式                           |
| ------------------- | ----------------------- | ---------------------------------- |
| `--background`      | `oklch(1 0 0)` 纯白     | `#0c1324` 深蓝灰                   |
| `--foreground`      | `oklch(0.145 0 0)` 近黑 | `#dce1fb` 浅蓝白                   |
| `--card`            | `oklch(1 0 0)` 纯白     | `#191f31` 深蓝灰                   |
| `--primary`         | `#1890ff` 品牌蓝        | `#89ceff` 浅蓝色强调               |
| `--primary-surface` | `#1890ff` 品牌蓝按钮面  | `#0c1324` 深蓝灰按钮面             |
| `--brand-accent`    | `#1890ff` 品牌强调      | `#89ceff` 浅蓝强调                 |
| `--muted`           | `oklch(0.97 0 0)` 浅灰  | `#151b2d` 深蓝灰                   |
| `--border`          | `oklch(0.922 0 0)` 浅灰 | `rgba(62,72,80,0.45)` 半透明灰     |
| `--sidebar`         | `oklch(0.985 0 0)` 浅白 | `#070d1f` 最深蓝灰                 |

### 2.5 深色模式表面层级系统

深色模式采用五级表面层次，实现精细的视觉分层：

| 层级变量              | 颜色值    | 用途               |
| --------------------- | --------- | ------------------ |
| `--surface-lowest`    | `#070d1f` | 最底层（侧边栏）   |
| `--surface-page`      | `#0c1324` | 页面背景           |
| `--surface-low`       | `#151b2d` | 低层表面（输入框） |
| `--surface-container` | `#191f31` | 容器/卡片          |
| `--surface-high`      | `#23293c` | 高层表面（弹出层） |
| `--surface-highest`   | `#2e3447` | 最高层表面         |

### 2.6 深色模式文字层级系统

| 文字变量            | 颜色值    | 用途             |
| ------------------- | --------- | ---------------- |
| `--foreground`      | `#dce1fb` | 主文字（浅蓝白） |
| `--text-secondary`  | `#bec8d2` | 次级文字         |
| `--muted-foreground`| `#88929b` | 淡文字           |
| `--text-muted-deep` | `#88929b` | 深层淡文字       |

### 2.7 标题字体

```css
--font-headline: 'Space Grotesk', 'Inter', var(--font-geist-sans), sans-serif;
```

用于深色模式下标题和品牌文字，呈现现代科技感。

---

## 3. 组件级双模式样式规范

### 3.1 导航栏（Navigation）

```tsx
<nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
```

| 元素     | 浅色模式                  | 深色模式                  |
| -------- | ------------------------- | ------------------------- |
| 背景     | `bg-background/80` + 模糊 | `bg-background/80` + 模糊 |
| 边框     | `border-border` 浅灰      | `border-border` 中性灰    |
| Logo图标 | `bg-primary` + 白色图标   | `bg-primary` + 白色图标   |
| 项目名称 | 品牌蓝或标准文字          | 白色或灰白标准文字        |

### 3.2 卡片（Card）

```tsx
<div className="rounded-xl bg-card border border-border p-6">
```

| 元素 | 浅色模式               | 深色模式               |
| ---- | ---------------------- | ---------------------- |
| 背景 | `bg-card` 白色         | `bg-card` 黑灰         |
| 模糊 | 按场景使用             | 按场景使用             |
| 边框 | `border-border` 浅灰色 | `border-border` 中性灰 |
| 圆角 | `rounded-xl` (12px)    | `rounded-xl` (12px)    |

### 3.3 功能徽章（Tech Badge）

```tsx
<div className="rounded-full bg-muted/50 border border-border">
```

| 元素      | 浅色模式                          | 深色模式                          |
| --------- | --------------------------------- | --------------------------------- |
| 背景      | `bg-muted/50` 浅灰/淡蓝灰         | `bg-muted/50` 深灰                |
| 边框      | `border-border` 浅灰              | `border-border` 中性灰            |
| 文字      | `text-muted-foreground`           | `text-muted-foreground`           |
| 图标      | `text-primary` 品牌蓝             | `text-primary` 浅蓝色       |
| Hover     | `border-primary` + `text-primary` | `border-primary` + `text-primary` |
| 图标Hover | `scale-110` + `rotate-12`         | `scale-110` + `rotate-12`         |

### 3.4 渐变文字（Gradient Text）

```tsx
<span className="text-primary">
```

| 元素 | 浅色模式              | 深色模式            |
| ---- | --------------------- | ------------------- |
| 文字 | `text-primary` 品牌蓝 | `text-primary` 浅蓝色 `#89ceff` |
| 动画 | 可选，避免影响可读性  | 默认不使用渐变动画  |

### 3.5 统计数据（Stats）

```tsx
<div className="text-primary">
```

| 元素     | 浅色模式                | 深色模式                |
| -------- | ----------------------- | ----------------------- |
| 数值颜色 | `text-primary` 品牌蓝   | `text-primary` 浅蓝色 `#89ceff` |
| 标签文字 | `text-muted-foreground` | `text-muted-foreground` |

### 3.6 按钮（Button）

```tsx
// 主按钮
<Button>

// 次按钮
<Button variant="outline" className="border-2 border-primary/50 text-primary hover:bg-primary/5 hover:border-primary">
```

| 元素       | 浅色模式                     | 深色模式                                      |
| ---------- | ---------------------------- | --------------------------------------------- |
| 主按钮背景 | `bg-primary` 品牌蓝          | `bg-primary` 深蓝灰表面                     |
| 主按钮文字 | `text-white`                 | `text-white`                                |
| 主按钮边框 | `border-primary` 品牌蓝      | `border-primary` 浅蓝色或 `border-border`   |
| 次按钮边框 | `border-2 border-primary/50` | `border-2 border-primary/50`                  |
| 次按钮文字 | `text-primary`               | `text-primary`                                |

**重要**：主按钮应优先使用组件默认样式，让 `bg-primary` 通过 `--primary-surface` 适配两套主题；不要在组件内硬编码 `dark:bg-blue-*`、`dark:text-blue-*` 或 `dark:to-cyan-*`。

### 3.7 图标容器（Icon Container）

```tsx
<div className="w-12 h-12 bg-muted/50 rounded-lg border border-border">
  <Icon className="w-6 h-6 text-primary" />
</div>
```

| 元素      | 浅色模式              | 深色模式            |
| --------- | --------------------- | ------------------- |
| 背景      | `bg-muted/50`         | `bg-muted/30`       |
| 边框      | `border-border`       | `border-border`     |
| 图标颜色  | `text-primary` 品牌蓝 | `text-primary` 白色 |
| Hover背景 | `bg-primary`          | `bg-primary`        |
| Hover图标 | `text-white`          | `text-white`        |

---

## 4. 页面级双模式设计规范

### 4.1 Dashboard 页面

**布局**：居中单卡片，上三分之一区域

```tsx
// 外层容器
<div className="min-h-[calc(100vh-4rem)] relative overflow-hidden">

// 卡片容器
<div className="w-full max-w-3xl">
  <div className="relative rounded-xl bg-card border border-border shadow-lg p-8 sm:p-12">
```

| 元素     | 浅色模式                                   | 深色模式                                 |
| -------- | ------------------------------------------ | ---------------------------------------- |
| 页面背景 | `bg-background` 纯白                       | `bg-background` 近黑                     |
| 卡片背景 | `bg-card` 纯白                             | `bg-card` 黑灰                           |
| 卡片边框 | `border-border` 浅灰                       | `border-border` 中性灰                   |
| 标题     | `text-foreground` 或 `text-primary` 品牌蓝 | `text-foreground` 或 `text-primary` 白色 |
| 主按钮   | 蓝底白字                                   | 黑底白字                                 |

### 4.2 落地页（Landing Page）

**布局**：全屏滚动式，Hero + Features + HowItWorks + Benefits + CTA + Footer

| 元素     | 浅色模式                        | 深色模式                        |
| -------- | ------------------------------- | ------------------------------- |
| 页面背景 | `bg-background` 纯白            | `bg-background` 近黑            |
| Hero布局 | 开放式（无卡片包裹）            | 开放式（无卡片包裹）            |
| 功能徽章 | `bg-muted/50` + `border-border` | `bg-muted/50` + `border-border` |
| 统计数值 | `text-primary` 品牌蓝           | `text-primary` 白色             |
| 功能卡片 | `bg-card` + `border-border`     | `bg-card` + `border-border`     |
| 底部标识 | 使用语义色                      | 使用语义色                      |

**浅色模式特有**：

- 淡蓝色装饰元素（`bg-blue-50/30`）
- 品牌蓝强调文字和按钮
- 背景保持清爽克制

**深色模式特有**：

- 黑白中性对比
- 主按钮黑底白字
- 禁止新增蓝色/青色深色装饰作为默认规范

### 4.3 登录页（Login Page）

**布局**：左右分栏，左侧品牌展示 + 右侧登录表单

#### 左侧品牌区

| 元素       | 浅色模式                                        | 深色模式                                                 |
| ---------- | ----------------------------------------------- | -------------------------------------------------------- |
| **背景**   | `bg-gradient-to-br from-brand-600 to-brand-800` | `bg-gradient-to-br from-[#0c1324] via-[#151b2d] to-[#070d1f]` |
| **视觉**   | **蓝色渐变**（brand-600→800）                   | **深蓝灰渐变**（#0c1324→#151b2d）                        |
| 蓝色装饰线 | 显示 `from-blue-500/30`                         | 显示 `from-[#89ceff]` 浅蓝装饰                           |
| Inner glow | 显示 `from-primary/5`                           | 显示 `from-[#89ceff]/12` 浅蓝内光                        |
| 右侧边框   | `border-r-2 border-primary/30`                  | `border-r-2 border-[#89ceff]/30`                        |
| Logo容器   | `bg-white/20 border-white/30`                   | `bg-[#89ceff] border-[#89ceff]/60` 浅蓝容器              |
| Logo图标   | `text-white`                                    | `text-[#003751] 深蓝图标                                 |
| 项目名称   | `text-white`                                    | `text-[#89ceff] 浅蓝色` 或 `font-headline`               |
| 欢迎标题   | `text-white`                                    | `text-foreground` 浅蓝白                                 |
| 描述文字   | `text-white/80`                                 | `text-muted-foreground`                                  |
| 功能徽章   | `bg-white/20 border-white/30 text-white/90`     | `bg-[#89ceff]/10 border-[#89ceff]/25 text-[#bec8d2]`     |
| 徽章图标   | `text-white/70`                                 | `text-[#89ceff] 浅蓝色`                                  |
| 统计数值   | `text-white`                                    | `text-[#89ceff] 浅蓝色`                                  |
| 统计标签   | `text-white/70`                                 | `text-muted-foreground`                                  |

#### 右侧表单区

| 元素     | 浅色模式                    | 深色模式                           |
| -------- | --------------------------- | ---------------------------------- |
| **背景** | `bg-white` 纯白             | `bg-[#0a1628]` 深蓝灰              |
| **视觉** | **纯白色**                  | **深蓝灰色**                       |
| 标题     | `text-foreground`           | `text-foreground`                  |
| 输入框   | `bg-muted/30 border-border` | `bg-[#151b2d] border-[#3e4850]/60` |
| Tab切换  | `bg-muted/50 border-border` | `bg-[#151b2d] border-[#3e4850]/60` |
| 主按钮   | `bg-primary` 蓝底白字       | `bg-primary` 深蓝灰底白字          |

#### 整体容器

| 元素     | 浅色模式                       | 深色模式                                    |
| -------- | ------------------------------ | ------------------------------------------- |
| 容器边框 | `border-2 border-border/80`    | `border-2 border-[#89ceff]/25`             |
| 容器阴影 | `shadow-2xl`                   | `shadow-2xl` + 浅蓝发光阴影                 |
| 背景装饰 | 浅蓝低透明装饰                 | 浅蓝网格 + 浮动粒子增强科技感               |

---

## 5. 装饰与动画规范

### 5.1 装饰显隐控制

| 装饰       | 浅色模式   | 深色模式     | 实现方式                               |
| ---------- | ---------- | ------------ | -------------------------------------- |
| 浅蓝装饰   | 可少量使用 | 显示         | 浅蓝色 `#89ceff` 低透明度              |
| 深蓝灰分隔 | 普通边框   | 半透明灰边框 | `border-border` / `border-[#3e4850]`   |
| 光晕/发光  | 默认不使用 | 浅蓝发光     | `rgba(137, 206, 255, 0.12)` 阴影       |
| 粒子/网格  | 默认不使用 | 浅蓝科技网格 | `tech-grid-bg` + `tech-particle` 效果  |

### 5.2 CSS 动画定义

| 动画名       | 效果           | 时长     | 用途                 |
| ------------ | -------------- | -------- | -------------------- |
| `pulse-slow` | 透明度 0.6↔1.0 | 3s       | 分隔线缓慢脉冲       |
| `fade-in`    | 透明度 0→1     | 0.2-0.4s | 弹层、菜单、内容进入 |

### 5.3 动画类名

```css
.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}
```

---

## 6. 双模式切换技术实现

### 6.1 主题管理配置

```tsx
// layout.tsx
import { ThemeProvider } from 'next-themes';

<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
  {children}
</ThemeProvider>;
```

- `attribute="class"`：通过 `.dark` CSS 类切换
- `defaultTheme="dark"`：默认深色模式
- `enableSystem`：支持系统主题检测

### 6.2 Tailwind dark: 前缀策略

**核心思路**：优先使用语义变量，只有布局、显隐或确实不同的装饰策略才使用 `dark:` 前缀。

```tsx
// 推荐：让 CSS 变量决定两套主题颜色
className = 'bg-card border-border text-foreground';

// 推荐：主按钮使用组件默认样式
className = 'bg-primary text-primary-foreground';

// 允许：浅色专用装饰在深色隐藏
className = 'bg-blue-50/30 dark:hidden';
```

### 6.3 主题切换组件

```tsx
// components/theme-toggle.tsx
'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
```

---

## 7. 颜色速查表

### 7.1 常用颜色组合

| 用途     | 浅色模式                     | 深色模式                                |
| -------- | ---------------------------- | --------------------------------------- |
| 页面背景 | `bg-background` → 纯白       | `bg-background` → `#0c1324` 深蓝灰      |
| 卡片背景 | `bg-card`                    | `bg-card` → `#191f31`                   |
| 主文字   | `text-foreground` → 近黑     | `text-foreground` → `#dce1fb` 浅蓝白    |
| 辅助文字 | `text-muted-foreground` → 灰 | `text-muted-foreground` → `#88929b`     |
| 强调文字 | `text-primary` → #1890ff     | `text-primary` → `#89ceff` 浅蓝色       |
| 主按钮   | `bg-primary` → #1890ff       | `bg-primary` → `#0c1324` 深蓝灰表面     |
| 边框     | `border-border` → 浅灰       | `border-border` → `rgba(62,72,80,0.45)` |
| 输入框   | `bg-muted/30 border-border`  | `bg-[#151b2d] border-[#3e4850]/60`      |
| 辅助背景 | `bg-muted/50`                | `bg-muted/30` 或 `bg-[#151b2d]`         |

### 7.2 登录页专用颜色

| 用途     | 浅色模式                               | 深色模式                                              |
| -------- | -------------------------------------- | ----------------------------------------------------- |
| 左侧背景 | `from-brand-600 to-brand-800` 蓝色渐变 | `from-[#0c1324] via-[#151b2d]` 深蓝灰渐变            |
| 右侧背景 | `bg-white` 纯白                        | `bg-[#0a1628]` 深蓝灰                                 |
| 容器边框 | `border-2 border-border/80`            | `border-2 border-[#89ceff]/25`                       |
| 左侧文字 | `text-white` / `text-white/80`         | `text-foreground` / `text-muted-foreground`          |
| 左侧徽章 | `bg-white/20 border-white/30`          | `bg-[#89ceff]/10 border-[#89ceff]/25`                |

---

## 8. 字体排版

### 8.1 字体族

- **主字体**：Geist Sans（无衬线字体，现代简洁）
- **等宽字体**：Geist Mono（代码、数字显示）
- **标题字体**：Space Grotesk（深色模式品牌标题，科技感）

```css
--font-sans: var(--font-geist-sans);
--font-mono: var(--font-geist-mono);
--font-headline: 'Space Grotesk', 'Inter', var(--font-geist-sans), sans-serif;
```

### 8.2 字体大小层级

| 层级         | Tailwind类                         | 大小    | 用途       |
| ------------ | ---------------------------------- | ------- | ---------- |
| H1           | `text-4xl sm:text-5xl lg:text-6xl` | 36-60px | 页面主标题 |
| H2           | `text-3xl sm:text-4xl`             | 30-36px | 区块标题   |
| H3           | `text-xl`                          | 20px    | 组件标题   |
| Body Large   | `text-lg sm:text-xl`               | 18-20px | 重要正文   |
| Body Regular | `text-base`                        | 16px    | 普通正文   |
| Body Small   | `text-sm`                          | 14px    | 辅助文字   |
| Label        | `text-xs`                          | 12px    | 标签文字   |

### 8.3 字重

- **Regular**：`font-normal` (400)
- **Medium**：`font-medium` (500)
- **Semibold**：`font-semibold` (600)
- **Bold**：`font-bold` (700)

---

## 9. 间距与布局

### 9.1 基础间距

| 间距 | Tailwind类      | 像素值 | 用途         |
| ---- | --------------- | ------ | ------------ |
| 极小 | `gap-1` / `p-1` | 4px    | 紧凑元素     |
| 小   | `gap-2` / `p-2` | 8px    | 图标与文字   |
| 常规 | `gap-3` / `p-3` | 12px   | 按钮间距     |
| 中等 | `gap-4` / `p-4` | 16px   | **默认间距** |
| 大   | `gap-6` / `p-6` | 24px   | 卡片内边距   |
| 超大 | `gap-8` / `p-8` | 32px   | 区块间距     |

### 9.2 容器系统

- **全屏宽度**：`w-full`
- **最大宽度**：`max-w-7xl` (1280px)
- **居中对齐**：`mx-auto`

### 9.3 响应式断点

| 断点    | 前缀  | 范围     |
| ------- | ----- | -------- |
| Mobile  | 默认  | < 640px  |
| Tablet  | `sm:` | ≥ 640px  |
| Desktop | `md:` | ≥ 768px  |
| Large   | `lg:` | ≥ 1024px |
| XLarge  | `xl:` | ≥ 1280px |

---

## 10. 圆角与阴影

### 10.1 圆角系统

```css
:root {
  --radius: 0.625rem; /* 10px - 基础圆角 */
}
```

| 组件   | 圆角类         | 像素值   |
| ------ | -------------- | -------- |
| Button | `rounded-md`   | 8px      |
| Input  | `rounded-md`   | 8px      |
| Card   | `rounded-xl`   | 14px     |
| Badge  | `rounded-full` | 完全圆形 |
| Dialog | `rounded-lg`   | 10px     |

### 10.2 阴影层级

| 层级 | Tailwind类   | 用途     |
| ---- | ------------ | -------- |
| 轻微 | `shadow-sm`  | 卡片默认 |
| 小   | `shadow`     | 悬浮状态 |
| 中   | `shadow-md`  | 激活状态 |
| 大   | `shadow-lg`  | 按钮悬浮 |
| 超大 | `shadow-xl`  | 模态框   |
| 特大 | `shadow-2xl` | 登录卡片 |

---

## 11. PageHeader 组件规范

### 11.1 标准配置

```tsx
<PageHeader
  variant="card" // 蓝色渐变背景（推荐）
  size="sm" // 紧凑布局（推荐）
  title="页面标题" // 2-6个字
  description="页面功能描述" // 20-40个字
  icon={Icon} // lucide-react图标
/>
```

### 11.2 API文档

| 属性          | 类型                             | 必填 | 默认值 | 说明         |
| ------------- | -------------------------------- | ---- | ------ | ------------ |
| `title`       | string                           | ✅   | -      | 页面主标题   |
| `description` | string                           | ⭐   | -      | 页面描述     |
| `icon`        | LucideIcon                       | ⭐   | -      | 标题左侧图标 |
| `variant`     | 'card' \| 'default' \| 'minimal' | -    | 'card' | 视觉变体     |
| `size`        | 'sm' \| 'md' \| 'lg'             | -    | 'lg'   | 尺寸变体     |
| `actions`     | ReactNode                        | -    | -      | 右侧操作按钮 |

### 11.3 使用规范

- ✅ **必须使用** `PageHeader` 组件，**禁止**自定义h1标题
- ✅ **必须使用** `space-y-4` 包裹PageHeader和内容区
- ✅ **推荐配置** `variant="card"` 和 `size="sm"`
- ✅ **操作按钮** 使用 `actions` prop，自动右对齐
- ✅ **按钮间距** 使用 `gap-2`
- ✅ **按钮尺寸** 统一使用 `size="sm"`

### 11.4 Variant变体样式详情

#### card variant（推荐）

| 元素     | 浅色模式                                                           | 深色模式           |
| -------- | ------------------------------------------------------------------ | ------------------ |
| 容器背景 | `bg-gradient-to-br from-blue-50/90 via-blue-100/50 to-transparent` | `bg-card`          |
| 边框     | `border-blue-200/50`                                               | `border-border`    |
| 阴影     | `shadow-sm`                                                        | `shadow-sm`        |
| 模糊     | `backdrop-blur-sm`                                                 | `backdrop-blur-sm` |

#### default variant

| 元素     | 浅色模式        | 深色模式        |
| -------- | --------------- | --------------- |
| 容器背景 | `bg-card` 白色  | `bg-card` 黑灰  |
| 边框     | `border-border` | `border-border` |

#### minimal variant

| 元素 | 浅色模式             | 深色模式        |
| ---- | -------------------- | --------------- |
| 容器 | `pb-4 mb-6 border-b` | `border-border` |

### 11.5 Size尺寸样式详情

| Size      | 容器内边距 | 标题样式             | 图标大小    |
| --------- | ---------- | -------------------- | ----------- |
| **sm** ⭐ | `p-4`      | `text-xl font-bold`  | `w-6 h-6`   |
| md        | `p-6`      | `text-2xl font-bold` | `w-6 h-6`   |
| lg        | `p-6`      | `text-3xl font-bold` | `w-8 h-8`   |
| xl        | `p-8`      | `text-4xl font-bold` | `w-10 h-10` |

---

## 12. 业务页面组件规范

### 12.1 状态卡片（StatusCard）

用于展示筛选状态统计，支持点击筛选和选中状态。

```tsx
<Card
  className={`cursor-pointer transition-all hover:shadow-md hover:border-primary/50 ${
    activeFilter === status.name
      ? 'border-primary bg-primary/5 shadow-md'
      : 'bg-muted/30'
  }`}
>
  <CardContent className="p-3 flex flex-col items-center justify-center text-center">
    {/* 状态名 + 统计数据 */}
  </CardContent>
</Card>
```

| 元素      | 浅色模式                  | 深色模式                  |
| --------- | ------------------------- | ------------------------- |
| 默认背景  | `bg-muted/30`             | `bg-muted/30`             |
| 选中背景  | `bg-primary/5`            | `bg-primary/5`            |
| 选中边框  | `border-primary`          | `border-primary`          |
| Hover边框 | `hover:border-primary/50` | `hover:border-primary/50` |
| Hover阴影 | `hover:shadow-md`         | `hover:shadow-md`         |

**布局规范**：

- 响应式网格：`grid-cols-2 md:grid-cols-4 lg:grid-cols-9`
- 卡片间距：`gap-3`
- 内容居中：`flex flex-col items-center justify-center text-center`
- 内边距：`p-3`

### 12.2 搜索筛选区（SearchFilter）

用于页面顶部的搜索和筛选操作区。

```tsx
<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border">
  {/* 搜索框 */}
  {/* 筛选操作 */}
</div>
```

| 元素     | 浅色模式        | 深色模式        |
| -------- | --------------- | --------------- |
| 容器背景 | `bg-muted/30`   | `bg-muted/30`   |
| 容器边框 | `border-border` | `border-border` |
| 圆角     | `rounded-xl`    | `rounded-xl`    |
| 内边距   | `p-4`           | `p-4`           |

**布局规范**：

- 响应式布局：`flex-col md:flex-row`
- 对齐方式：`justify-between items-start md:items-center`
- 垂直间距：`gap-4`

### 12.3 状态颜色映射（Status Color Map）

业务状态Badge的颜色规范：

```tsx
const statusColorMap: Record<string, string> = {
  待分案: 'bg-slate-100 text-slate-700 dark:bg-muted dark:text-foreground',
  已分案: 'bg-blue-100 text-blue-700 dark:bg-muted dark:text-foreground',
  已申请立案: 'bg-cyan-100 text-cyan-700 dark:bg-muted dark:text-foreground',
  立案通过: 'bg-teal-100 text-teal-700 dark:bg-muted dark:text-foreground',
  庭审中: 'bg-purple-100 text-purple-700 dark:bg-muted dark:text-foreground',
  调解中: 'bg-amber-100 text-amber-700 dark:bg-muted dark:text-foreground',
  已判决: 'bg-indigo-100 text-indigo-700 dark:bg-muted dark:text-foreground',
  执行中: 'bg-orange-100 text-orange-700 dark:bg-muted dark:text-foreground',
  已结案: 'bg-green-100 text-green-700 dark:bg-muted dark:text-foreground',
};
```

**颜色命名规则**：

- 状态名 → 颜色语义映射
- 浅色：`bg-{color}-100 text-{color}-700`
- 深色：默认 `dark:bg-muted dark:text-foreground`，仅在业务明确需要预警/成功/危险语义时使用红/绿/黄等状态色

### 12.4 超期预警开关（Overdue Toggle）

用于筛选超期数据的开关组件：

```tsx
<div className="flex items-center space-x-2 bg-muted/30 px-3 py-1.5 rounded-full border border-primary/10">
  <Switch
    id="overdue-mode"
    checked={showOverdueOnly}
    onCheckedChange={setShowOverdueOnly}
  />
  <Label
    htmlFor="overdue-mode"
    className="text-xs font-medium cursor-pointer flex items-center gap-1.5"
  >
    <Clock
      size={12}
      className={showOverdueOnly ? 'text-red-500' : 'text-muted-foreground'}
    />
    仅看超期预警
  </Label>
</div>
```

| 元素       | 样式                                                     |
| ---------- | -------------------------------------------------------- |
| 容器       | `bg-muted/30 px-3 py-1.5 rounded-full border-primary/10` |
| 图标激活   | `text-red-500`                                           |
| 图标未激活 | `text-muted-foreground`                                  |

---

## 13. 业务表格配置指南

### 13.1 ConfigurableTable 组件

项目使用 `ConfigurableTable` 作为标准业务表格组件，支持配置化列定义、搜索筛选、排序、分页等功能。

#### 基础配置示例

```tsx
import {
  ConfigurableTable,
  createDefaultTableConfig,
} from '@/components/ui/configurable-table';

const tableConfig = createDefaultTableConfig({
  title: '数据列表',
  dataSource: data,
  columns: [
    {
      key: 'name',
      title: '名称',
      sortable: true,
      width: 150,
    },
    {
      key: 'status',
      title: '状态',
      render: (value) => <Badge>{value}</Badge>,
    },
  ],
  actions: [
    {
      key: 'detail',
      label: '详情',
      icon: ChevronRight,
      onClick: (record) => router.push(`/detail/${record.id}`),
    },
  ],
  pagination: {
    enabled: true,
    pageSize: 10,
  },
  size: 'middle',
  hover: true,
  striped: true,
});
```

### 13.2 表格样式规范

| 元素      | 浅色模式                    | 深色模式            |
| --------- | --------------------------- | ------------------- |
| 标题      | `text-foreground font-bold` | 同浅色              |
| 表头hover | `hover:bg-muted/50`         | `hover:bg-muted/30` |
| 行hover   | `hover:bg-muted/50`         | `hover:bg-muted/30` |
| 斑马纹    | `bg-muted/30`               | `bg-muted/20`       |
| 边框      | `border-border`             | `border-border`     |

### 13.3 尺寸配置

| Size     | 字体大小    | 适用场景     |
| -------- | ----------- | ------------ |
| `small`  | `text-xs`   | 紧凑型表格   |
| `middle` | `text-sm`   | **默认推荐** |
| `large`  | `text-base` | 宽松型表格   |

### 13.4 分页组件样式

```tsx
// 分页信息
<div className="text-sm text-muted-foreground">
  显示第 {start} 到 {end} 条，共 {total} 条记录
</div>

// 分页按钮
<Button variant="outline" size="sm">首页</Button>
<Button variant="outline" size="sm">上一页</Button>
<Button variant={currentPage === page ? 'default' : 'outline'} size="sm">{page}</Button>
<Button variant="outline" size="sm">下一页</Button>
<Button variant="outline" size="sm">末页</Button>
```

### 13.5 操作按钮配置

```tsx
actions: [
  {
    key: 'export',
    label: '导出',
    icon: Download,
    onClick: () => handleExport(),
    variant: 'outline',
    size: 'sm',
  },
  {
    key: 'detail',
    label: '详情',
    icon: ChevronRight,
    onClick: (record) => handleDetail(record),
    variant: 'ghost',
    showLabel: true, // 显示文字标签
  },
  {
    key: 'edit',
    label: '编辑',
    icon: Edit,
    onClick: (record) => handleEdit(record),
    variant: 'ghost',
    showLabel: false, // 仅显示图标
  },
];
```

### 13.6 外部分页支持

当需要服务端分页时，使用 `externalPagination` 属性：

```tsx
<ConfigurableTable
  config={tableConfig}
  externalPagination={{
    page,
    pageSize,
    total: totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    onPageChange: handlePageChange,
    onPageSizeChange: setPageSize,
    pageSizeOptions: [10, 20, 50, 100],
  }}
/>
```

---

## 14. 设计原则总结

### 14.1 浅色模式三原则

1. **蓝白为主**：品牌蓝 #1890ff + 纯白背景
2. **简洁清爽**：淡蓝色装饰点缀，保持商务清新感
3. **清晰层次**：灰色辅助文字 + 蓝色重点强调

### 14.2 深色模式三原则

1. **深蓝灰科技感**：五级表面层次（`#070d1f` ~ `#2e3447`）
2. **浅蓝强调色**：`#89ceff` 用于文字高亮、边框、图标激活态
3. **科技装饰增强**：浅蓝网格、浮动粒子、发光阴影营造科技感

### 14.3 双模式统一原则

1. **语义变量一致**：组件使用 `bg-primary`、`text-primary`、`border-border` 等语义类
2. **布局一致**：页面结构不随主题变化
3. **交互一致**：按钮、链接、Hover效果行为相同
4. **圆角一致**：统一使用 `rounded-xl`（12px）
5. **间距一致**：统一使用 `gap-4`/`gap-6`/`gap-8`

---

## 15. 关键文件索引

| 文件                                | 说明                                       |
| ----------------------------------- | ------------------------------------------ |
| `app/globals.css`                   | CSS 变量定义、主题变量映射、表面层级系统   |
| `app/page.tsx`                      | 落地页（浅色蓝白 + 深色蓝灰科技感）        |
| `app/login/page.tsx`                | 登录页（浅色蓝白 + 深色蓝灰浅蓝强调）      |
| `app/dashboard/page.tsx`            | Dashboard（浅色蓝白 + 深色蓝灰科技感）     |
| `components/theme-toggle.tsx`       | 主题切换组件                               |
| `components/layout/main-layout.tsx` | 主布局（含导航栏主题切换）                 |
| `components/layout/page-header.tsx` | PageHeader 组件（双模式样式）              |

---

_最后更新：2026年6月4日_
