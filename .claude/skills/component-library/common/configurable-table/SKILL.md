---
name: configurable-table
description: ConfigurableTable组件的完整使用指南。适用于所有需要展示数据列表、CRUD操作、搜索筛选的管理后台页面开发。提供完整的Props API、使用场景、代码示例和最佳实践。禁止手动实现Table组件，必须使用此组件以确保UI一致性和代码可维护性。
---

# ConfigurableTable Component Skill

## 📋 组件概述

**组件名称**：`ConfigurableTable`

**组件分类**：`common`

**文件位置**：`components/ui/configurable-table/ConfigurableTable.tsx`

**用途**：可配置的表格组件，用于所有数据列表、管理后台、CRUD页面的数据展示

**依赖组件**：

- shadcn/ui: Table, Card, Button, Badge, Skeleton
- lucide-react: ChevronUp, ChevronDown, MoreHorizontal, UserPlus, RefreshCw
- 自定义子组件: SearchFilters, ActionButtons

**状态**：✅ 稳定

**核心特性**：

- 📊 **数据展示**：灵活的列配置和自定义渲染
- 🔍 **搜索筛选**：内置搜索和多维度筛选
- 📄 **分页功能**：自动分页，支持自定义页码和每页数量
- 🎯 **排序功能**：点击列头进行升序/降序排序
- ⚡ **操作按钮**：行内操作（编辑、删除等）和全局操作（新增）
- 🎨 **样式配置**：支持多种尺寸、边框、斑马纹、悬停效果
- 📱 **响应式设计**：移动端友好的布局

---

## 🎯 使用场景

### 场景1：用户管理页面（基础CRUD）

**描述**：展示用户列表，支持搜索、筛选、分页和编辑/删除操作

```tsx
'use client';

import {
  ConfigurableTable,
  createDefaultTableConfig,
} from '@/components/ui/configurable-table';
import { Edit, Trash2, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import useUserManagementStore from '@/stores/userManagementStore';

export default function UserManagementPage() {
  const { users, loading, fetchUsers, updateUser, deleteUser } =
    useUserManagementStore();

  // 状态映射
  const statusVariantMap: Record<
    string,
    'default' | 'secondary' | 'destructive'
  > = {
    active: 'default',
    inactive: 'secondary',
    suspended: 'destructive',
  };

  const statusDisplayMap: Record<string, string> = {
    active: '正常',
    inactive: '未激活',
    suspended: '已暂停',
  };

  // 表格配置
  const config = createDefaultTableConfig({
    title: '用户列表',
    dataSource: users,
    columns: [
      { key: 'id', title: 'ID', width: 80 },
      {
        key: 'username',
        title: '用户名',
        sortable: true,
        searchable: true,
      },
      {
        key: 'displayName',
        title: '显示名称',
        sortable: true,
        searchable: true,
      },
      {
        key: 'email',
        title: '邮箱',
        sortable: true,
        searchable: true,
      },
      {
        key: 'department',
        title: '部门',
        sortable: true,
      },
      {
        key: 'status',
        title: '状态',
        sortable: true,
        render: (value: string) => (
          <Badge variant={statusVariantMap[value]}>
            {statusDisplayMap[value] || value}
          </Badge>
        ),
      },
      {
        key: 'createdAt',
        title: '创建时间',
        sortable: true,
        render: (value: string) => new Date(value).toLocaleDateString('zh-CN'),
      },
    ],
    search: {
      placeholder: '搜索用户名、邮箱、部门...',
      fields: ['username', 'displayName', 'email', 'department'],
      filters: [
        {
          key: 'status',
          label: '状态',
          type: 'select',
          options: [
            { label: '全部', value: 'all' },
            { label: '正常', value: 'active' },
            { label: '未激活', value: 'inactive' },
            { label: '已暂停', value: 'suspended' },
          ],
        },
        {
          key: 'department',
          label: '部门',
          type: 'select',
          options: [
            { label: '全部', value: 'all' },
            { label: '技术部', value: 'tech' },
            { label: '产品部', value: 'product' },
            { label: '设计部', value: 'design' },
          ],
        },
      ],
    },
    actions: [
      {
        key: 'add',
        label: '新增用户',
        icon: UserPlus,
        onClick: () => {
          // 打开新增对话框
          console.log('Add user clicked');
        },
      },
      {
        key: 'edit',
        label: '编辑',
        icon: Edit,
        onClick: (record) => {
          // 打开编辑对话框
          console.log('Edit user:', record.id);
        },
      },
      {
        key: 'delete',
        label: '删除',
        icon: Trash2,
        variant: 'destructive',
        onClick: async (record) => {
          // 删除用户
          await deleteUser(record.id);
          fetchUsers();
        },
        confirm: {
          title: '确认删除',
          description: `确定要删除用户 "${record.username}" 吗？此操作不可恢复。`,
        },
      },
    ],
    pagination: {
      enabled: true,
      pageSize: 10,
    },
    size: 'middle',
    striped: true,
    hover: true,
  });

  return (
    <div className="container mx-auto py-6">
      <ConfigurableTable config={config} />
    </div>
  );
}
```

**关键点**：

- 使用 `createDefaultTableConfig` 快速创建配置
- `render` 函数自定义列渲染（如状态Badge）
- `search.filters` 配置多维度筛选
- `actions` 配置行内操作按钮
- `confirm` 配置删除确认对话框

---

### 场景2：产品列表（异步数据加载）

**描述**：从API异步加载产品数据，支持刷新和分页

```tsx
'use client';

import { useEffect, useState } from 'react';
import {
  ConfigurableTable,
  createDefaultTableConfig,
} from '@/components/ui/configurable-table';
import { apiInstance } from '@/lib/apiCreator';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // 异步数据加载函数
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await apiInstance.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const config = createDefaultTableConfig({
    title: '产品列表',
    dataSource: products,
    columns: [
      { key: 'id', title: 'ID', width: 80 },
      {
        key: 'name',
        title: '产品名称',
        sortable: true,
        searchable: true,
      },
      {
        key: 'price',
        title: '价格',
        sortable: true,
        render: (value: number) => `¥${value.toFixed(2)}`,
      },
      {
        key: 'category',
        title: '分类',
        sortable: true,
      },
      {
        key: 'stock',
        title: '库存',
        sortable: true,
        render: (value: number) => (
          <span className={value < 10 ? 'text-red-500' : 'text-green-500'}>
            {value} 件
          </span>
        ),
      },
    ],
    pagination: {
      enabled: true,
      pageSize: 20,
    },
    loading, // 传递加载状态
  });

  return (
    <div className="container mx-auto py-6">
      <ConfigurableTable config={config} />
    </div>
  );
}
```

**关键点**：

- `dataSource` 支持静态数组
- `loading` prop 控制加载状态
- 异步数据加载使用 `useEffect` + `useState`
- `render` 函数支持条件样式

---

### 场景3：交易记录（自定义行点击）

**描述**：交易记录列表，点击行查看详情

```tsx
'use client';

import {
  ConfigurableTable,
  createDefaultTableConfig,
} from '@/components/ui/configurable-table';
import { formatISOToDisplay } from '@/lib/datetimeUtils';
import { useRouter } from 'next/navigation';

export default function TransactionsPage() {
  const router = useRouter();

  const config = createDefaultTableConfig({
    title: '交易记录',
    dataSource: async () => {
      // 从API加载数据
      const response = await fetch('/api/transactions');
      return response.json();
    },
    columns: [
      { key: 'id', title: '交易ID', width: 120 },
      {
        key: 'date',
        title: '交易时间',
        sortable: true,
        render: (value: string) => formatISOToDisplay(value, 'datetime'),
      },
      {
        key: 'type',
        title: '类型',
        render: (value: string) => (
          <span
            className={value === 'income' ? 'text-green-600' : 'text-red-600'}
          >
            {value === 'income' ? '收入' : '支出'}
          </span>
        ),
      },
      {
        key: 'amount',
        title: '金额',
        sortable: true,
        render: (value: number) => `¥${value.toFixed(2)}`,
      },
      {
        key: 'category',
        title: '分类',
      },
      {
        key: 'account',
        title: '账户',
      },
    ],
    // 行点击事件
    onRowClick: (record) => {
      router.push(`/transactions/${record.id}`);
    },
    pagination: {
      enabled: true,
      pageSize: 25,
    },
    hover: true, // 悬停效果
  });

  return (
    <div className="container mx-auto py-6">
      <ConfigurableTable config={config} />
    </div>
  );
}
```

**关键点**：

- `dataSource` 支持异步函数 `() => Promise<T[]>`
- `onRowClick` 配置行点击事件
- `hover: true` 启用悬停效果提示可点击
- 使用 `formatISOToDisplay` 格式化日期时间

---

### 场景4：紧凑型表格（小尺寸）

**描述**：使用小尺寸展示更多数据

```tsx
const config = createDefaultTableConfig({
  dataSource: data,
  columns: [
    { key: 'id', title: 'ID', width: 60 },
    { key: 'name', title: '名称', width: 150 },
    { key: 'value', title: '值', width: 100 },
    // ... 更多列
  ],
  size: 'small', // 小尺寸
  bordered: true, // 显示边框
  pagination: {
    enabled: true,
    pageSize: 50, // 每页50条
  },
});
```

**关键点**：

- `size: 'small'` 减小内边距和字体
- `bordered: true` 显示表格边框
- 更大的 `pageSize` 展示更多数据

---

## 🔧 Props API

### TableConfig<T> 接口定义

```typescript
interface TableConfig<T extends BaseRecord> {
  // 基础配置
  title?: string; // 表格标题
  className?: string; // 自定义样式类

  // 数据配置
  dataSource: (() => Promise<T[]>) | T[]; // 数据源（数组或异步函数）
  dataKey?: string; // 存储数据的key（用于sessionStorage）

  // 列配置
  columns: ColumnConfig<T>[]; // 列配置数组

  // 搜索和筛选
  search?: SearchConfig; // 搜索配置

  // 操作按钮
  actions?: ActionConfig<T>[]; // 操作按钮配置

  // 分页配置
  pagination?: {
    enabled?: boolean; // 是否启用分页（默认true）
    pageSize?: number; // 每页数量（默认10）
    showSizeChanger?: boolean; // 显示页码切换器
    pageSizeOptions?: number[]; // 页码选项 [5, 10, 20, 50]
  };

  // 选择功能
  selection?: {
    enabled?: boolean; // 是否启用选择
    type?: 'checkbox' | 'radio'; // 选择类型
    getRowKey?: (record: T) => string | number; // 获取行key
  };

  // 样式配置
  size?: 'small' | 'middle' | 'large'; // 表格尺寸（默认middle）
  bordered?: boolean; // 是否显示边框
  striped?: boolean; // 是否显示斑马纹
  hover?: boolean; // 是否启用悬停效果

  // 加载状态
  loading?: boolean; // 加载状态

  // 空状态
  empty?: {
    description?: string; // 空状态描述
    image?: string; // 空状态图片
  };

  // 回调函数
  onDataChange?: (data: T[]) => void; // 数据变化回调
  onSelectionChange?: (
    selectedRows: T[],
    selectedRowKeys: (string | number)[]
  ) => void; // 选择变化回调
  onRowClick?: (record: T, index: number, event: React.MouseEvent) => void; // 行点击回调
}
```

### ColumnConfig<T> 列配置

```typescript
interface ColumnConfig<T extends BaseRecord> {
  key: keyof T; // 列对应的数据字段
  title: string; // 列标题
  width?: string | number; // 列宽度
  sortable?: boolean; // 是否可排序
  searchable?: boolean; // 是否可搜索
  render?: (value: any, record: T, index: number) => React.ReactNode; // 自定义渲染
  className?: string; // 单元格样式类
  headerClassName?: string; // 表头样式类
  hidden?: boolean; // 是否隐藏
}
```

### ActionConfig<T> 操作按钮配置

```typescript
interface ActionConfig<T extends BaseRecord> {
  key: string; // 按钮唯一标识
  label: string; // 按钮文本
  icon?: React.ComponentType<{ className?: string }>; // 按钮图标
  onClick: (record: T, index: number) => void | Promise<void>; // 点击事件
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'; // 按钮样式
  size?: 'default' | 'sm' | 'lg' | 'icon'; // 按钮尺寸
  disabled?: (record: T) => boolean; // 禁用条件
  hidden?: (record: T) => boolean; // 隐藏条件
  confirm?: {
    // 确认对话框
    title?: string; // 对话框标题（固定文本）
    description?: string | ((record: T) => string); // 描述（支持固定文本或动态函数）
  };
  className?: string; // 自定义样式类
}
```

#### confirm配置最佳实践

**✅ 推荐做法（动态描述）**：

```tsx
{
  key: 'delete',
  label: '删除',
  variant: 'destructive',
  onClick: async (record: Student) => {
    await deleteStudent(record.id);
  },
  confirm: {
    title: '确认删除',
    description: (record: Student) =>  // ✅ 使用函数支持动态内容
      `确定要删除学生"${record.name}"吗？此操作不可撤销。`,
  },
}
```

**✅ 可接受做法（固定描述）**：

```tsx
confirm: {
  title: '确认删除',
  description: '此操作不可撤销，请确认是否继续？',  // ✅ 固定文本
}
```

**说明**：

- ActionButtons组件使用 `getText` 函数自动处理string和function
- description可以是string或function
- function会传入当前record参数，返回动态描述文本
- 优先使用动态描述提升用户体验（显示具体记录信息）

### SearchConfig 搜索配置

```typescript
interface SearchConfig {
  placeholder?: string; // 搜索框占位符
  fields?: string[]; // 搜索字段
  showAdvancedToggle?: boolean; // 显示高级筛选开关
  defaultAdvanced?: boolean; // 默认展开高级筛选
  filters?: FilterConfig[]; // 筛选项配置
}
```

### FilterConfig 筛选配置

```typescript
interface FilterConfig {
  key: string; // 筛选字段key
  label: string; // 筛选标签
  type: 'select' | 'multiSelect' | 'date' | 'dateRange'; // 筛选类型
  options?: Array<{ label: string; value: any }>; // 选项列表
  placeholder?: string; // 占位符
  className?: string; // 自定义样式类
}
```

#### ⚠️ Select.Item重要规范

**约束**：Select组件的Select.Item不允许使用空字符串作为value。

**✅ 正确做法**：

```tsx
filters: [
  {
    key: 'status',
    label: '状态',
    type: 'select',
    options: [
      { label: '全部状态', value: 'all' }, // ✅ 使用'all'而非空字符串
      { label: '正常', value: 'active' },
      { label: '禁用', value: 'inactive' },
    ],
  },
];
```

**❌ 错误做法**：

```tsx
options: [
  { label: '全部状态', value: '' }, // ❌ 空字符串会导致Select.Item警告
  { label: '正常', value: 'active' },
];
```

**实现说明**：

- SearchFilters组件会自动处理 `'all'` ↔ `''` 的转换
- 内部存储使用空字符串 `''`
- Select显示使用 `'all'`
- 无需手动处理转换

---

## 📐 布局规范

### 标题和按钮布局

ConfigurableTable已实现标准的页面布局：

```
┌─────────────────────────────────────────────────────────┐
│ 学生列表              [刷新] [搜索...] [筛选] [新增]   │
├─────────────────────────────────────────────────────────┤
│  表格内容区域...                                         │
└─────────────────────────────────────────────────────────┘
```

**布局特性**：

- **标题左对齐**：使用 `flex-1` 占据左侧空间
- **按钮右对齐**：使用 `flex items-center gap-2` 在右侧排列
- **响应式设计**：
  - 小屏幕：垂直布局（`flex-col`）
  - 大屏幕：水平布局（`sm:flex-row`）

**配置方法**：

```tsx
const config = createDefaultTableConfig({
  title: '学生列表',  // ✅ 显示在左侧
  search: { ... },    // ✅ 搜索框显示在右侧
  actions: [          // ✅ 新增按钮显示在右侧
    { key: 'add', label: '新增学生' },
  ],
});
```

**注意事项**：

- 无需手动实现布局，组件已自动处理
- title属性可选，不提供则不显示标题区域
- 所有按钮自动排列在右侧（刷新、搜索、筛选、新增）

---

## ⚠️ 注意事项

### 设计原则

1. **必须使用ConfigurableTable**：所有数据列表、CRUD页面必须使用此组件，禁止手动实现Table
2. **类型安全**：使用泛型 `<T extends BaseRecord>` 确保类型安全
3. **性能优化**：大数据集（>1000条）使用分页或虚拟滚动
4. **用户体验**：提供合理的搜索、筛选、排序功能

### 使用限制

1. **dataSource限制**：
   - 支持静态数组：`T[]`
   - 支持异步函数：`() => Promise<T[]>`
   - 不支持实时流数据

2. **render函数限制**：
   - 仅用于渲染，不应包含复杂逻辑
   - 避免在render中修改状态
   - 性能敏感的渲染应使用useMemo

3. **操作按钮限制**：
   - `key: 'add'` 会被识别为全局新增按钮
   - 其他key会被识别为行内操作按钮
   - 异步操作需要正确处理Promise

### 常见问题

**Q: 如何实现自定义分页？**

A: 使用 `externalPagination` prop：

```tsx
<ConfigurableTable
  config={config}
  externalPagination={{
    page: currentPage,
    pageSize: pageSize,
    total: totalItems,
    totalPages: Math.ceil(totalItems / pageSize),
    onPageChange: handlePageChange,
  }}
/>
```

**Q: 如何隐藏某些列？**

A: 设置 `hidden: true`：

```tsx
{
  key: 'id',
  title: 'ID',
  hidden: true, // 隐藏该列
}
```

**Q: 如何实现行选择？**

A: 配置 `selection` 和 `onSelectionChange`：

```tsx
const config = createDefaultTableConfig({
  selection: {
    enabled: true,
    type: 'checkbox',
  },
  onSelectionChange: (selectedRows, selectedRowKeys) => {
    console.log('Selected:', selectedRows);
  },
});
```

**Q: 如何处理大数据集性能问题？**

A: 使用分页+服务端搜索：

```tsx
const config = createDefaultTableConfig({
  dataSource: async () => {
    const response = await apiInstance.get('/api/users', {
      params: { page, pageSize, search, filters },
    });
    return response.data;
  },
  pagination: {
    enabled: true,
    pageSize: 20, // 减小每页数量
  },
});
```

**Q: 如何自定义空状态？**

A: 配置 `empty` 属性：

```tsx
const config = createDefaultTableConfig({
  empty: {
    description: '暂无数据，点击新增按钮创建第一条数据',
    image: '/images/empty-state.png',
  },
});
```

---

## 🔗 相关组件

### 依赖的组件

- **Table** (shadcn/ui) - 基础表格组件
- **Card** (shadcn/ui) - 卡片容器
- **Button** (shadcn/ui) - 按钮组件
- **Badge** (shadcn/ui) - 徽章标签
- **Skeleton** (shadcn/ui) - 加载骨架屏

### 子组件

- **SearchFilters** - 搜索和筛选区域
- **ActionButtons** - 行内操作按钮
- **useTableData** - 数据管理hook

### 被依赖的组件

- **UserManagementPage** - 用户管理页面
- **ProductsPage** - 产品列表页面
- **TransactionsPage** - 交易记录页面

### 替代方案

- ❌ **手动实现Table** - **禁止使用**，违反项目规范
- ❌ **第三方Table组件** - 如Ant Design Table、Material-UI Table，避免引入额外依赖

---

## 📚 更多资源

### 组件源码

- 主组件：`components/ui/configurable-table/ConfigurableTable.tsx` (401行)
- 类型定义：`components/ui/configurable-table/types.ts` (164行)
- 配置工具：`components/ui/configurable-table/config.ts` (98行)
- 搜索筛选：`components/ui/configurable-table/SearchFilters.tsx`
- 操作按钮：`components/ui/configurable-table/ActionButtons.tsx`
- 数据Hook：`components/ui/configurable-table/hooks/useTableData.ts`

### 相关文档

- [THEME.md - 表格样式规范](../../../../.claude/docs/THEME.md#组件样式)
- [组件开发检查清单](../../../../.claude/docs/development/COMPONENT_DEVELOPMENT_CHECKLIST.md)
- [表格开发指南](../../../../.claude/docs/development/TABLE_DEVELOPMENT_GUIDE.md)

### 使用示例

- 用户管理：`app/dashboard/user-management/page.tsx` (363行)
- 产品管理：参考用户管理实现
- 交易记录：参考用户管理实现

---

## 📝 更新日志

### v1.1.0 - 2025-12-25

- ✅ **新增**：布局规范章节，说明标题左对齐、按钮右对齐的标准
- ✅ **新增**：FilterConfig筛选器配置规范，说明Select.Item空字符串约束
- ✅ **新增**：ActionConfig的confirm最佳实践，支持动态描述函数
- ✅ **优化**：所有筛选器示例更新为使用 `value: 'all'`
- ✅ **优化**：所有confirm示例更新为使用动态描述函数

### v1.0.0 - 2025-12-23

- ✅ 初始版本
- ✅ 支持完整的CRUD操作
- ✅ 支持搜索、筛选、排序、分页
- ✅ 支持自定义渲染和操作按钮
- ✅ 支持多种尺寸和样式配置
- ✅ 支持异步数据加载

---

## 💡 最佳实践

### 1. 使用createDefaultTableConfig

**✅ 推荐**：

```tsx
const config = createDefaultTableConfig({
  dataSource: data,
  columns: [{ key: 'name', title: '名称' }],
});
```

**❌ 不推荐**：

```tsx
const config = {
  dataSource: data,
  columns: [{ key: 'name', title: '名称' }],
  pagination: {
    enabled: true,
    pageSize: 10,
  },
  // ... 手动配置所有默认值
};
```

### 2. 类型安全的数据定义

**✅ 推荐**：

```tsx
interface User extends BaseRecord {
  id: string;
  username: string;
  email: string;
}

const config = createDefaultTableConfig<User>({
  dataSource: users,
  columns: [
    { key: 'username', title: '用户名' }, // 类型安全
  ],
});
```

**❌ 不推荐**：

```tsx
const config = createDefaultTableConfig({
  dataSource: users,
  columns: [
    { key: 'username', title: '用户名' }, // 无类型检查
  ],
});
```

### 3. render函数性能优化

**✅ 推荐**：

```tsx
// 使用useMemo缓存渲染函数
const statusRender = useCallback((value: string) => {
  const variant = statusVariantMap[value] || 'default';
  return <Badge variant={variant}>{value}</Badge>;
}, []);

const config = createDefaultTableConfig({
  columns: [
    {
      key: 'status',
      title: '状态',
      render: statusRender,
    },
  ],
});
```

**❌ 不推荐**：

```tsx
const config = createDefaultTableConfig({
  columns: [
    {
      key: 'status',
      title: '状态',
      render: (value: string) => {
        // 复杂计算和状态修改
        const result = complexCalculation(value);
        setState(result); // 副作用！
        return <Badge>{result}</Badge>;
      },
    },
  ],
});
```

### 4. 合理的搜索字段配置

**✅ 推荐**：

```tsx
search: {
  placeholder: '搜索用户名、邮箱...',
  fields: ['username', 'displayName', 'email'], // 明确指定搜索字段
}
```

**❌ 不推荐**：

```tsx
search: {
  placeholder: '搜索...',
  // 不指定fields，会搜索所有字段（性能差）
}
```

### 5. 操作按钮确认对话框

**✅ 推荐**：

```tsx
{
  key: 'delete',
  label: '删除',
  variant: 'destructive',
  onClick: async (record) => {
    await deleteUser(record.id);
  },
  confirm: {
    title: '确认删除',
    description: `确定要删除用户 "${record.username}" 吗？`,
  },
}
```

**❌ 不推荐**：

```tsx
{
  key: 'delete',
  label: '删除',
  onClick: (record) => {
    if (confirm('确定删除吗？')) { // 原生confirm，体验差
      deleteUser(record.id);
    }
  },
}
```

---

## 🎨 样式定制

### 表格尺寸

```typescript
size: 'small'; // 紧凑型：h-8, text-sm
size: 'middle'; // 默认：h-10, text-sm
size: 'large'; // 大号：h-12, text-base
```

### 斑马纹和悬停效果

```typescript
striped: true; // 斑马纹背景
hover: true; // 悬停高亮
```

### 边框和圆角

```typescript
bordered: true; // 显示表格边框
// 圆角由Card组件控制：rounded-xl
```

---

## ♿ 无障碍性

- ✅ 支持键盘导航（Tab、Enter、Space）
- ✅ ARIA标签完整（table、th、td角色）
- ✅ 屏幕阅读器友好（语义化HTML）
- ✅ 焦点指示器清晰（hover和focus状态）
- ✅ 操作按钮有明确的icon和label

---

## 🧪 测试

### 测试覆盖

- 单元测试：暂无
- 集成测试：通过用户管理页面验证
- E2E测试：暂无

### 手动测试检查清单

- [ ] 数据正常显示
- [ ] 搜索功能正常
- [ ] 筛选功能正常
- [ ] 排序功能正常
- [ ] 分页功能正常
- [ ] 操作按钮正常
- [ ] 确认对话框正常
- [ ] 加载状态正常
- [ ] 空状态正常
- [ ] 行点击事件正常
- [ ] 移动端布局正常

---

**文档版本**：v1.1.0
**最后更新**：2025-12-25
**维护者**：架构专家 + 前端专家团队
