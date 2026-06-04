---
name: select
description: shadcn/ui Select组件的使用指南和最佳实践。重点说明Select.Item不允许使用空字符串作为value的约束，以及在ConfigurableTable筛选器中的正确配置方法。
---

# Select Component Skill

## 📋 组件概述

**组件名称**：`Select`

**组件来源**：shadcn/ui

**文件位置**：`components/ui/select/`

**用途**：下拉选择组件，用于单选场景

**核心约束**：

- ⚠️ **Select.Item不允许使用空字符串作为value**
- ✅ 使用特殊值（如'all'、'none'）表示"全部"或"无"

---

## ⚠️ 重要约束

### Select.Item的value限制

**问题**：Radix UI的Select.Item不允许使用空字符串作为value，会导致警告和功能异常。

**错误示例**：

```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="请选择状态" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="">全部状态</SelectItem> {/* ❌ 会导致警告 */}
    <SelectItem value="active">正常</SelectItem>
    <SelectItem value="inactive">禁用</SelectItem>
  </SelectContent>
</Select>
```

**正确示例**：

```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="请选择状态" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">全部状态</SelectItem> {/* ✅ 使用'all' */}
    <SelectItem value="active">正常</SelectItem>
    <SelectItem value="inactive">禁用</SelectItem>
  </SelectContent>
</Select>
```

---

## 🎯 使用场景

### 场景1：ConfigurableTable筛选器（推荐）

**描述**：在ConfigurableTable的筛选器中使用Select

**✅ 标准配置**：

```tsx
const config = createDefaultTableConfig({
  search: {
    filters: [
      {
        key: 'status',
        label: '状态',
        type: 'select',
        options: [
          { label: '全部状态', value: 'all' }, // ✅ 使用'all'
          { label: '正常', value: 'active' },
          { label: '禁用', value: 'inactive' },
        ],
      },
    ],
  },
});
```

**说明**：

- SearchFilters组件会自动处理 `'all'` ↔ `''` 的转换
- 内部存储使用空字符串表示"全部"
- Select显示使用 `'all'` 避免警告

### 场景2：表单中的Select

**描述**：在表单中使用Select进行数据选择

**✅ 推荐做法**：

```tsx
import { useForm } from 'react-hook-form';

function MyForm() {
  const { register } = useForm();

  return (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="请选择" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">全部</SelectItem> {/* ✅ 特殊值 */}
        <SelectItem value="option1">选项1</SelectItem>
        <SelectItem value="option2">选项2</SelectItem>
      </SelectContent>
    </Select>
  );
}
```

**值映射处理**：

```tsx
// 提交时将'all'转换为后端期望的值
const handleSubmit = (data: FormData) => {
  const payload = {
    ...data,
    status: data.status === 'all' ? '' : data.status, // 转换
  };
  api.post('/api/data', payload);
};
```

### 场景3：动态选项

**描述**：从API加载选项数据

**✅ 推荐做法**：

```tsx
function DynamicSelect() {
  const [options, setOptions] = useState<
    Array<{ label: string; value: string }>
  >([]);

  useEffect(() => {
    fetchOptions().then((data) => {
      setOptions([
        { label: '全部', value: 'all' }, // ✅ 添加默认选项
        ...data,
      ]);
    });
  }, []);

  return (
    <Select>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

---

## 🔧 Props API

### SelectProps

```typescript
interface SelectProps {
  value?: string; // 当前选中值
  defaultValue?: string; // 默认值
  onValueChange?: (value: string) => void; // 值变化回调
  disabled?: boolean; // 是否禁用
  required?: boolean; // 是否必填
  name?: string; // 表单名称
}
```

### SelectItemProps

```typescript
interface SelectItemProps {
  value: string; // ⚠️ 不能为空字符串
  disabled?: boolean; // 是否禁用
}
```

---

## 💡 最佳实践

### 1. "全部"选项配置

**✅ 推荐值**：

- `'all'` - 最常用，表示"全部"
- `'none'` - 表示"无"
- `'*'` - 表示通配符
- `'__ALL__'` - 避免冲突的特殊值

**❌ 避免**：

- 空字符串 `''` - 会导致警告
- `null` / `undefined` - 类型不匹配

### 2. 值映射模式

```tsx
// 定义映射类型
type SelectValue = 'all' | 'option1' | 'option2';
type ApiValue = '' | 'option1' | 'option2';

// 转换函数
const toApiValue = (value: SelectValue): ApiValue => {
  return value === 'all' ? '' : value;
};

const toSelectValue = (value: ApiValue): SelectValue => {
  return value === '' ? 'all' : value;
};
```

### 3. TypeScript类型定义

```tsx
// 定义选项类型
interface SelectOption {
  label: string;
  value: string; // ⚠️ 确保非空
}

// 验证选项
const isValidOption = (option: SelectOption): boolean => {
  return option.value !== '' && option.value != null;
};
```

---

## 🔗 相关组件

- **Select** - shadcn/ui基础组件
- **SearchFilters** - ConfigurableTable的筛选组件
- **ConfigurableTable** - 可配置表格组件

---

## 📚 更多资源

- **shadcn/ui文档**：https://ui.shadcn.com/docs/components/select
- **Radix UI文档**：https://www.radix-ui.com/primitives/docs/components/select
- **ConfigurableTable文档**：`.claude/skills/component-library/common/configurable-table/SKILL.md`

---

## 📝 更新日志

### v1.0.0 - 2025-12-25

- ✅ 初始版本
- ✅ 说明Select.Item空字符串约束
- ✅ 提供ConfigurableTable筛选器配置示例
- ✅ 添加值映射最佳实践

---

**文档版本**：v1.0.0
**最后更新**：2025-12-25
**维护者**：架构专家 + 前端专家团队
