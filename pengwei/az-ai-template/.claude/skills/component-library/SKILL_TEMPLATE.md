# [组件名称] Component Skill

## 📋 组件概述

**组件名称**：`[ComponentName]`

**组件分类**：`ui` | `common` | `layout` | `[feature]`

**文件位置**：`components/[category]/[ComponentName].tsx`

**用途**：[一句话描述组件的核心功能]

**依赖组件**：[列出依赖的shadcn/ui或其他组件，如无依赖可省略]

**状态**：✅ 稳定 | 🔄 实验性 | ⚠️ 即将废弃

---

## 🎯 使用场景

### 场景1：[场景名称]

**描述**：[简要描述此场景]

\`\`\`tsx
'use client';

import { ComponentName } from '@/components/[category]/ComponentName';

export default function Example1() {
  return (
    <ComponentName
      // Props配置
    />
  );
}
\`\`\`

**关键点**：
- [关键点1]
- [关键点2]

---

### 场景2：[场景名称]

**描述**：[简要描述此场景]

\`\`\`tsx
'use client';

import { ComponentName } from '@/components/[category]/ComponentName';

export default function Example2() {
  return (
    <ComponentName
      // Props配置
    />
  );
}
\`\`\`

**关键点**：
- [关键点1]
- [关键点2]

---

## 🔧 Props API

### Props接口定义

\`\`\`typescript
interface ComponentNameProps {
  // Props定义
}
\`\`\`

### Props详细说明

| Prop名 | 类型 | 默认值 | 必填 | 说明 |
|--------|------|--------|------|------|
| `prop1` | `string` | - | ✅ | [Prop说明] |
| `prop2` | `number` | `10` | ❌ | [Prop说明] |
| `prop3` | `'option1' \| 'option2'` | `'option1'` | ❌ | [Prop说明] |
| `prop4` | `React.ReactNode` | - | ❌ | [Prop说明，如子元素] |

---

## ⚠️ 注意事项

### 设计原则

- [原则1]
- [原则2]

### 使用限制

- [限制1]
- [限制2]

### 常见问题

**Q: [常见问题1]**

A: [答案]

**Q: [常见问题2]**

A: [答案]

---

## 🔗 相关组件

### 依赖的组件

- **[Component1]** - [关系说明]
- **[Component2]** - [关系说明]

### 被依赖的组件

- **[Component3]** - [关系说明]

### 替代方案

- **[AlternativeComponent]** - [何时使用替代方案]

---

## 📚 更多资源

### 组件源码

- 文件位置：`components/[category]/[ComponentName].tsx`
- 代码行数：[约XX行]

### 相关文档

- [THEME.md相关章节](../../.claude/docs/THEME.md)（如有）
- [组件开发指南](../../.claude/docs/development/COMPONENT_DEVELOPMENT_CHECKLIST.md)

### 使用示例

- [示例页面1]：`app/[example-page]/page.tsx`
- [示例页面2]：`app/[example-page]/page.tsx`

---

## 📝 更新日志

### v1.0.0 - [日期]

- ✅ 初始版本
- ✅ 支持基础功能

---

## 💡 最佳实践

1. **实践1**：[说明]
2. **实践2**：[说明]

---

## 🎨 样式定制

### CSS Variables

如需自定义样式，可覆盖以下CSS变量：

\`\`\`css
.component-name {
  --property: value;
}
\`\`\`

### Tailwind Classes

组件支持以下Tailwind类名（如果适用）：

- `class-name1` - [说明]
- `class-name2` - [说明]

---

## ♿ 无障碍性

- [ ] 支持键盘导航
- [ ] ARIA标签完整
- [ ] 屏幕阅读器友好

---

## 🧪 测试

### 测试覆盖

- 单元测试：[链接]
- 集成测试：[链接]
- E2E测试：[链接]

---

**文档版本**：v1.0.0
**最后更新**：[YYYY-MM-DD]
**维护者**：[维护者名称/团队]
