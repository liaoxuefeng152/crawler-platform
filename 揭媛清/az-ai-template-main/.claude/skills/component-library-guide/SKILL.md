---
name: component-library-guide
description: L1索引skill，帮助前端专家快速发现和使用项目可复用组件。当需要开发新页面/功能、查找UI组件、或确定应该使用哪个现有组件时调用。提供组件快速索引（按功能、场景、分类）、核心组件概览（必须使用组件清单）、以及调用L2 skill详细文档的指引。避免重复开发，确保代码一致性。
---

# Component Library Guide

## Overview

这是项目组件库的L1索引skill，提供所有可复用组件的快速导航和使用指引。通过快速索引和组件概览，帮助前端专家在开发新功能时自动发现和使用现有组件，避免重复开发。

**核心原则**：
- ✅ 优先使用项目现有组件
- ❌ 禁止重复开发已有功能
- ✅ 确无合适组件时才自定义实现

## Quick Start

### 按功能快速查找

**表格管理** → `ConfigurableTable`
- 用途：所有数据列表、CRUD页面
- 禁止：手动实现Table
- 📖 详情：`.claude/skills/component-library/common/configurable-table.md`

**页面标题** → `PageHeader`
- 用途：所有Dashboard页面的标题区域
- 禁止：自定义h1标题
- 📖 详情：`.claude/skills/component-library/layout/page-header.md`

**统计展示** → `InlineStats` | `StatsCard`
- 用途：数据统计、指标展示
- 📖 详情：`.claude/skills/component-library/ui/inline-stats.md`

**页面布局** → `MainLayout` | `DashboardLayout`
- 用途：页面容器和布局结构
- 📖 详情：`.claude/skills/component-library/layout/main-layout.md`

### 按使用场景查找

**场景1：管理后台页面**
```
需求：开发用户管理、产品管理等CRUD页面
推荐组件：
  1. PageHeader (页面标题)
  2. ConfigurableTable (数据列表)
  3. Button (操作按钮)
完整示例：app/dashboard/user-management/page.tsx
```

**场景2：数据统计页面**
```
需求：开发仪表板、数据展示页面
推荐组件：
  1. InlineStats (统计卡片)
  2. Card (数据容器)
  3. ConfigurableTable (详细数据)
完整示例：app/dashboard/page.tsx
```

**场景3：表单页面**
```
需求：开发用户注册、配置等表单页面
推荐组件：
  1. PageHeader (页面标题)
  2. Form + Input/Select (表单输入)
  3. Button (提交按钮)
shadcn/ui组件：components/ui/form.tsx
```

### 按分类浏览

#### UI基础组件 (components/ui/)
shadcn/ui标准组件，优先使用已有组件：
- **Button** - 按钮组件
- **Input** - 输入框组件
- **Select** - 下拉选择组件
- **Dialog** - 对话框组件
- **Card** - 卡片容器
- **Badge** - 徽章标签
- **Alert** - 警告提示

📖 详见shadcn/ui文档：https://ui.shadcn.com/

#### 业务组件 (components/common/)
项目封装的业务组件：
- **ConfigurableTable** - 可配置表格
- **InlineStats** - 内联统计
- **StatsCard** - 统计卡片
- **SearchInput** - 搜索输入框

#### 布局组件 (components/layout/)
页面布局容器：
- **MainLayout** - 主布局（侧边栏+头部）
- **DashboardLayout** - 仪表板布局
- **PageHeader** - 页面标题组件

#### 功能组件 (components/[feature]/)
特定功能模块：
- **MenuItemCard** - 餐厅菜单项卡片
- **UserCreateDialog** - 用户创建对话框
- **CartItem** - 购物车项

## 核心组件详解

### ConfigurableTable ⭐ 必须使用

**用途**：所有表格管理页面，展示数据列表

**禁止**：手动实现Table组件

**何时使用**：
- 需要展示数据列表（用户、产品、交易等）
- 需要搜索、筛选、分页功能
- 需要行内操作（编辑、删除）

**⚠️ 使用规范**：
1. **筛选器配置**：Select.Item不允许空字符串，使用 `value: 'all'`
2. **confirm配置**：description支持动态函数以显示记录详情
3. **title属性**：必须配置title以显示表格标题
4. **布局方式**：标题左对齐，按钮右对齐（自动实现）

**快速开始**：
```tsx
import { ConfigurableTable, createDefaultTableConfig } from '@/components/ui/configurable-table';

const config = createDefaultTableConfig({
  title: '用户列表',  // ✅ 必须配置
  dataSource: users,
  columns: [
    { key: 'name', title: '名称', sortable: true },
    { key: 'email', title: '邮箱' },
  ],
  search: {
    placeholder: '搜索用户...',
    filters: [
      {
        key: 'status',
        label: '状态',
        type: 'select',
        options: [
          { label: '全部状态', value: 'all' },  // ✅ 使用'all'
          { label: '正常', value: 'active' },
        ],
      },
    ],
  },
  actions: [
    {
      key: 'delete',
      label: '删除',
      onClick: async (record) => { ... },
      confirm: {
        title: '确认删除',
        description: (record) =>  // ✅ 使用动态描述
          `确定要删除用户"${record.name}"吗？`,
      },
    },
  ],
});

<ConfigurableTable config={config} />
```

**详细文档**：`.claude/skills/component-library/common/configurable-table/SKILL.md`

---

### PageHeader ⭐ 必须使用

**用途**：所有Dashboard页面的标题区域

**禁止**：自定义h1标题

**何时使用**：
- 任何Dashboard页面的标题
- 需要统一的页面标题样式

**快速开始**：
```tsx
import { PageHeader } from '@/components/layout/page-header';
import { Users } from 'lucide-react';

<PageHeader
  variant="card"
  size="sm"
  title="用户管理中心"
  description="管理系统用户账户、权限和状态"
  icon={Users}
/>
```

**详细文档**：`.claude/skills/component-library/layout/page-header.md`

---

### InlineStats ⭐ 强烈推荐

**用途**：统计信息展示、数据指标

**何时使用**：
- 展示关键指标（用户数、订单数等）
- 仪表板数据卡片

**快速开始**：
```tsx
import { InlineStats } from '@/components/ui/inline-stats';
import { Users, CheckCircle } from 'lucide-react';

<InlineStats
  stats={[
    { label: '总用户数', value: 100, icon: Users },
    { label: '活跃用户', value: 85, icon: CheckCircle },
  ]}
  compact={true}
/>
```

**详细文档**：`.claude/skills/component-library/ui/inline-stats.md`

---

### MainLayout

**用途**：主页面布局（包含侧边栏和头部）

**何时使用**：
- 需要侧边栏导航的页面
- 需要统一页面框架

**详细文档**：`.claude/skills/component-library/layout/main-layout.md`

---

## 组件开发规范

### 禁止行为

以下行为被严格禁止：
- ❌ **禁止手动实现表格**（必须使用 ConfigurableTable）
- ❌ **禁止自定义h1标题**（必须使用 PageHeader）
- ❌ **禁止重复开发已有功能**

### 必须使用组件（第一优先级）

开发新页面时，以下组件必须优先考虑：

1. **ConfigurableTable** - 表格页面
2. **PageHeader** - 页面标题
3. **InlineStats** - 统计展示

### 强烈推荐组件

以下组件强烈推荐使用：

1. **MainLayout/DashboardLayout** - 页面布局
2. **shadcn/ui组件** - 基础UI组件

## 开发工作流

### 标准流程

```
用户提出需求
  ↓
前端专家分析需求
  ↓
**调用此skill查找组件**
  ↓
发现合适的组件
  ↓
调用L2 skill获取详细文档
  ↓
使用组件实现功能
```

### 组件发现流程

1. **识别需求类型**（表格、表单、布局等）
2. **查阅快速索引**（按功能或场景）
3. **阅读组件概览**（核心组件100-200词简介）
4. **调用L2 skill**（获取完整API文档和示例）
5. **使用组件**（参考最佳实践）

## 资源指引

### L2 Skill详细文档

当需要某个组件的完整文档时，调用对应的L2 skill：

**业务组件**：
- `.claude/skills/component-library/common/configurable-table.md`
- `.claude/skills/component-library/common/inline-stats.md`

**布局组件**：
- `.claude/skills/component-library/layout/page-header.md`
- `.claude/skills/component-library/layout/main-layout.md`

**UI组件**：
- `.claude/skills/component-library/ui/button.md`
- `.claude/skills/component-library/ui/input.md`

### 相关文档

- **表格开发指南**：`.claude/docs/development/TABLE_DEVELOPMENT_GUIDE.md`
- **页面布局规范**：`.claude/docs/THEME.md` 第10章
- **组件开发检查清单**：`.claude/docs/development/COMPONENT_DEVELOPMENT_CHECKLIST.md`

### 组件验证脚本

运行验证脚本检查组件文档完整性：

```bash
npm run check:component-skills
```

## 最佳实践

### 1. 优先使用原则

开发新功能时，按照以下优先级选择组件：

1. **P0（必须使用）**：ConfigurableTable、PageHeader
2. **P1（强烈推荐）**：InlineStats、MainLayout
3. **P2（推荐）**：shadcn/ui基础组件
4. **P3（最后选择）**：自定义实现

### 2. 组件组合模式

常见场景的组件组合：

**管理后台页面**：
```
PageHeader + ConfigurableTable + Button
```

**数据统计页面**：
```
PageHeader + InlineStats + Card
```

**表单页面**：
```
PageHeader + Form + Input/Select + Button
```

### 3. 质量检查

开发完成后，运行验证脚本：

```bash
npm run check:component-skills
```

确保所有使用的组件都有对应的skill文档。

## 常见问题

**Q: 如何判断是否应该使用ConfigurableTable？**

A: 如果页面需要展示数据列表、支持搜索/筛选/操作，必须使用。禁止手动实现Table。

**Q: PageHeader可以自定义样式吗？**

A: 支持多种variant（card/default/minimal/gradient）和size（sm/md/lg/xl），基本满足所有场景。特殊情况可扩展。

**Q: 组件不够用怎么办？**

A: 优先扩展现有组件（通过Props配置），最后考虑创建新组件。新组件必须按照规范创建skill文档。

**Q: 如何查找特定的shadcn/ui组件？**

A: 参考 https://ui.shadcn.com/docs/components 或项目内的 `components/ui/` 目录。

**Q: 发现组件缺少skill文档怎么办？**

A: 运行 `npm run check:component-skills` 检查，然后按照模板创建对应的skill文档。

---

**文档版本**：v1.0.0
**最后更新**：2025-12-23
**维护者**：架构专家 + 前端专家团队
