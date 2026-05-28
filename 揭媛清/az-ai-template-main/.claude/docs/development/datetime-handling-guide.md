# 🕐 日期时间格式处理规范

本文档定义项目中日期时间处理的统一标准，确保前后端数据传输和存储的一致性。

## 📋 统一格式标准

项目采用统一的日期时间格式处理规范。

### 格式定义

| 使用场景 | 格式标准 | 示例 | 说明 |
|---------|---------|------|------|
| **前端输入** | `datetime-local` | `2025-12-23T11:38` | HTML5输入框返回格式 |
| **前端显示** | 中文本地化 | `2025年12月23日 11:38` | 用户友好的显示格式 |
| **后端存储** | ISO 8601 | `2025-12-23T11:38:00.000Z` | JSON数据存储格式 |
| **API传输** | ISO 8601 | `2025-12-23T11:38:00.000Z` | HTTP请求响应格式 |

## 🛠️ 工具库使用

### 工具库位置

```
lib/datetimeUtils.ts
```

### 核心工具函数

#### 1. 前端到后端转换

```typescript
import { formatDatetimeLocalToISO } from '@/lib/datetimeUtils';

// HTML datetime-local -> ISO 8601
const isoDate = formatDatetimeLocalToISO('2025-12-23T11:38');
// 结果：'2025-12-23T11:38:00.000Z'
```

#### 2. 后端到前端转换

```typescript
import { formatISOToDatetimeLocal } from '@/lib/datetimeUtils';

// ISO 8601 -> HTML datetime-local
const localDate = formatISOToDatetimeLocal('2025-12-23T11:38:00.000Z');
// 结果：'2025-12-23T11:38'
```

#### 3. UI显示格式化

```typescript
import { formatISOToDisplay } from '@/lib/datetimeUtils';

// ISO 8601 -> 中文显示
formatISOToDisplay('2025-12-23T11:38:00.000Z', 'datetime');
// 结果：'2025年12月23日 11:38'

formatISOToDisplay('2025-12-23T11:38:00.000Z', 'date');
// 结果：'2025年12月23日'

formatISOToDisplay('2025-12-23T11:38:00.000Z', 'time');
// 结果：'11:38:00'
```

## 📌 API路由验证规范

### 使用Zod验证Schema

```typescript
import { DateTimeSchemas } from '@/lib/datetimeUtils';

// 创建接口 - 必填日期时间
const CreateSchema = z.object({
  date: DateTimeSchemas.required,  // 必填，自动转换为ISO 8601
});

// 更新接口 - 可选日期时间
const UpdateSchema = z.object({
  date: DateTimeSchemas.optional,  // 可选，自动转换为ISO 8601
});

// 查询接口 - 日期范围
const QuerySchema = z.object({
  startDate: DateTimeSchemas.optional,
  endDate: DateTimeSchemas.optional,
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: '开始日期不能大于结束日期',
});
```

### 验证Schema特性

- ✅ **多格式支持**：接受datetime-local、ISO 8601、时间戳等多种格式
- ✅ **自动转换**：统一转换为ISO 8601格式存储
- ✅ **错误提示**：中文友好的验证错误信息
- ✅ **类型安全**：TypeScript完整类型支持

## 🎨 前端组件开发规范

### 表单输入处理

```typescript
'use client';

import { useState } from 'react';
import { formatDatetimeLocalToISO, formatISOToDatetimeLocal, getCurrentDatetimeLocal } from '@/lib/datetimeUtils';

export default function MyForm() {
  const [date, setDate] = useState(getCurrentDatetimeLocal());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 转换为ISO格式发送
    const apiData = {
      date: formatDatetimeLocalToISO(date),
    };

    await fetch('/api/endpoint', {
      method: 'POST',
      body: JSON.stringify(apiData),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="datetime-local"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
    </form>
  );
}
```

### 数据显示处理

```typescript
'use client';

import { formatISOToDisplay } from '@/lib/datetimeUtils';

export function TransactionItem({ date }: { date: string }) {
  return (
    <div>
      <div>日期：{formatISOToDisplay(date, 'datetime')}</div>
      <div>日期：{formatISOToDisplay(date, 'date')}</div>
      <div>时间：{formatISOToDisplay(date, 'time')}</div>
    </div>
  );
}
```

## ⚠️ 常见错误避免

### ❌ 错误做法

```typescript
// 错误1：直接使用toISOString()
const [date, setDate] = useState(new Date().toISOString());

// 错误2：使用严格的.datetime()验证
date: z.string().datetime('请输入有效的日期时间')

// 错误3：不统一使用工具库
{new Date(date).toLocaleDateString('zh-CN')}
```

### ✅ 正确做法

```typescript
// 正确1：使用转换工具
const [date, setDate] = useState(getCurrentDatetimeLocal());

// 正确2：使用柔性验证Schema
import { DateTimeSchemas } from '@/lib/datetimeUtils';
date: DateTimeSchemas.required

// 正确3：统一使用格式化工具
import { formatISOToDisplay } from '@/lib/datetimeUtils';
{formatISOToDisplay(date, 'datetime')}
```

## 📊 数据管理器规范

### DataManager自动处理

```typescript
// DataManager内部使用toISOString()
export class EnhancedArrayDataManager {
  async addItem(item: Omit<TItem, 'id' | 'createdAt' | 'updatedAt'>) {
    const newItem: TItem = {
      ...item,
      id: generateId(),
      createdAt: new Date().toISOString(),  // ✅ 正确：自动生成ISO格式
      updatedAt: new Date().toISOString(),
    } as unknown as TItem;

    items.push(newItem);
    await this.writeData(items);
    return id;
  }
}
```

## 🔄 端到端流程示例

```
用户操作 → 前端组件 → 格式转换 → API验证 → 数据存储 → 返回数据 → 格式转换 → 用户界面

1. 用户选择日期：2025-12-23 11:38
2. datetime-local输入：2025-12-23T11:38
3. 前端转换为ISO：2025-12-23T11:38:00.000Z
4. API验证通过（DateTimeSchemas.required）
5. 存储到JSON：2025-12-23T11:38:00.000Z
6. 返回给前端：2025-12-23T11:38:00.000Z
7. 显示格式化：2025年12月23日 11:38
```

## 📦 依赖说明

- **Zod验证**：使用自定义DateTimeSchemas替代原生`.datetime()`
- **无需额外依赖**：仅使用JavaScript原生Date对象
- **时区处理**：统一使用UTC时区存储，前端本地时区显示

## 🧪 测试验证

### 单元测试示例

```typescript
import { formatDatetimeLocalToISO, formatISOToDisplay } from '@/lib/datetimeUtils';

describe('DateTime Utils', () => {
  test('格式转换正确', () => {
    const iso = formatDatetimeLocalToISO('2025-12-23T11:38');
    expect(iso).toBe('2025-12-23T11:38:00.000Z');
  });

  test('显示格式正确', () => {
    const display = formatISOToDisplay('2025-12-23T11:38:00.000Z', 'datetime');
    expect(display).toBe('2025年12月23日 11:38');
  });
});
```

## 🎯 POC项目简化原则

本规范遵循POC项目开发原则：
- ✅ **简单实用**：使用原生JavaScript，无外部依赖
- ✅ **快速验证**：功能优先，避免过度设计
- ✅ **统一标准**：全局一致的日期时间处理

## 📖 快速参考

### 常用代码片段

```typescript
// 获取当前datetime-local格式
const currentValue = getCurrentDatetimeLocal();

// 前端输入 -> 后端存储
const isoDate = formatDatetimeLocalToISO(inputValue);

// 后端存储 -> 前端输入
const inputValue = formatISOToDatetimeLocal(isoDate);

// 后端存储 -> 用户显示
const displayValue = formatISOToDisplay(isoDate, 'datetime');
```

### Zod Schema引用

```typescript
import { DateTimeSchemas } from '@/lib/datetimeUtils';

// 必填日期时间
date: DateTimeSchemas.required

// 可选日期时间
date: DateTimeSchemas.optional

// 日期范围验证
dates: z.object({
  start: DateTimeSchemas.optional,
  end: DateTimeSchemas.optional,
}).refine(...)
```

---

**💡 提示**: 所有日期时间处理都应该通过 `lib/datetimeUtils.ts` 工具函数，确保项目一致性。
