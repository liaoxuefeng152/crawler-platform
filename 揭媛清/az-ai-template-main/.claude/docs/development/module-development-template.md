# 🚀 新功能模块开发模板

本文档提供基于当前技术栈的标准化新功能模块开发流程，确保代码一致性和快速开发。

## 📋 技术栈一致性检查

### 开发前检查

- [ ] **前端组件**: 确认shadcn/ui已有组件，避免重复开发
- [ ] **状态管理**: 使用Zustand模式，保持Store结构一致性
- [ ] **API设计**: 沿用现有API路由结构和错误处理
- [ ] **认证集成**: 复用JWT + userId验证模式（注意POC无权限系统）
- [ ] **数据管理**: 使用 Prisma + MongoDB（参考 `lib/db/index.ts`）
- [ ] **样式系统**: 使用Tailwind + 现有CSS Variables

### 架构兼容性评估

- [ ] **现有架构能否满足需求**: 优先复用现有模式
- [ ] **是否必须引入新技术**: 提供充分理由和评估
- [ ] **技术债务影响**: 评估引入新技术的维护成本
- [ ] **团队学习成本**: 考虑新技术对团队的影响

## 🎯 标准化开发流程

### 第一步：Prisma Schema 设计

**🚨 重要：本项目使用表名前缀系统实现多项目数据隔离**

#### 正确的开发流程：

1. **编辑模板文件**：`prisma/schema.template.prisma`
   ```prisma
   // prisma/schema.template.prisma - 添加新模型（必须编辑此文件）

   model [NewModule] {
     id          String   @id @default(auto()) @map("_id") @db.ObjectId
     name        String
     description String?
     createdBy   String   @db.ObjectId
     status      String   @default("active")
     createdAt   DateTime @default(now())
     updatedAt   DateTime @updatedAt

     @@index([createdBy])
     @@map("[new_modules]")  // 会自动生成为：{PROJECT_TABLE_PREFIX}-new_modules
   }
   ```

2. **生成带前缀的 Schema**：
   ```bash
   npm run generate:schema
   ```
   这会自动为所有表名添加 `{PROJECT_TABLE_PREFIX}-` 前缀

   > ⚠️ 运行 `node scripts/sync-project-prefix.js` 获取当前项目的前缀

3. **更新数据库和客户端**：
   ```bash
   npx prisma generate
   npx prisma db push
   ```

#### ⚠️ 重要注意事项：

- ❌ **禁止直接修改** `prisma/schema.prisma`（会被自动覆盖）
- ✅ **必须编辑** `prisma/schema.template.prisma`（模板文件）
- ✅ **表名自动添加前缀**：`new_modules` → `{PROJECT_TABLE_PREFIX}-new_modules`
- ✅ **构建时自动生成**：`npm run build` 会自动运行 `generate-schema.js`

> 💡 详细文档：[数据库表名前缀迁移报告](../DATABASE_TABLE_PREFIX_MIGRATION.md)

### 第二步：数据访问层实现

```typescript
// lib/db/index.ts - 添加新的数据管理器

export interface Create[NewModule]Data {
  name: string;
  description?: string;
  createdBy: string;
}

export class [NewModule]DataManager {
  /**
   * 获取所有项目
   */
  static async getAll(): Promise<[NewModule][]> {
    return prisma.[newModule].findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * 根据 ID 获取项目
   */
  static async getById(id: string): Promise<[NewModule] | null> {
    return prisma.[newModule].findUnique({
      where: { id },
    });
  }

  /**
   * 创建项目
   */
  static async create(data: Create[NewModule]Data): Promise<[NewModule]> {
    return prisma.[newModule].create({
      data,
    });
  }

  /**
   * 更新项目
   */
  static async update(
    id: string,
    data: Partial<Omit<[NewModule], "id" | "createdAt">>
  ): Promise<[NewModule]> {
    return prisma.[newModule].update({
      where: { id },
      data,
    });
  }

  /**
   * 删除项目
   */
  static async delete(id: string): Promise<[NewModule]> {
    return prisma.[newModule].delete({
      where: { id },
    });
  }

  /**
   * 根据创建者获取项目
   */
  static async getByCreator(createdBy: string): Promise<[NewModule][]> {
    return prisma.[newModule].findMany({
      where: { createdBy },
      orderBy: { createdAt: "desc" },
    });
  }
}

// 导出到 DataManager
export const DataManager = {
  LoginUser: LoginUserDataManager,
  User: UserDataManager,
  Notification: NotificationDataManager,
  Registration: RegistrationDataManager,
  [NewModule]: [NewModule]DataManager, // 添加新模块
};
```

### 第三步：API路由实现

```typescript
// app/api/[newModule]/route.ts - 沿用现有API模式
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { [NewModule]DataManager } from '@/lib/db';

// 请求验证Schema
const [Module]RequestSchema = z.object({
  name: z.string().min(1, '名称不能为空'),
  description: z.string().optional(),
});

// GET - 获取所有项目
export async function GET(request: NextRequest) {
  try {
    const items = await [NewModule]DataManager.getAll();
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || '获取数据失败' },
      { status: 500 }
    );
  }
}

// POST - 创建新项目
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = [Module]RequestSchema.parse(body);

    const result = await [NewModule]DataManager.create({
      ...validatedData,
      createdBy: body.userId || 'user_default', // POC简化：不需要严格认证
    });

    return NextResponse.json(
      { success: true, data: result, message: '创建成功' },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || '创建失败' },
      { status: error.name === 'ZodError' ? 400 : 500 }
    );
  }
}
```

```typescript
// app/api/[newModule]/[id]/route.ts - 单个项目操作
import { NextRequest, NextResponse } from 'next/server';
import { [NewModule]DataManager } from '@/lib/db';

// GET - 获取单个项目
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await [NewModule]DataManager.getById(id);

    if (!item) {
      return NextResponse.json(
        { success: false, message: '项目不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || '获取失败' },
      { status: 500 }
    );
  }
}

// PUT - 更新项目
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = await [NewModule]DataManager.update(id, body);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || '更新失败' },
      { status: 500 }
    );
  }
}

// DELETE - 删除项目
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await [NewModule]DataManager.delete(id);

    return NextResponse.json({ success: true, message: '删除成功' });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || '删除失败' },
      { status: 500 }
    );
  }
}
```

### 第四步：前端状态管理（复用Zustand模式）

```typescript
// store/use[NewModule]Store.ts - 沿用现有Store模式
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { apiInstance } from '@/lib/apiCreator';

export interface [Module]Item {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface [NewModule]Store {
  data: [Module]Item[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchData: () => Promise<void>;
  addItem: (item: Omit<[Module]Item, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<void>;
  updateItem: (id: string, updates: Partial<[Module]Item>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  clearError: () => void;
}

export const use[NewModule]Store = create<[NewModule]Store>()(
  persist(
    (set, get) => ({
      data: [],
      loading: false,
      error: null,

      fetchData: async () => {
        set({ loading: true, error: null });
        try {
          const response = await apiInstance.get('/[newModule]');
          set({ data: response.data.data || [], loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      addItem: async (item) => {
        set({ loading: true, error: null });
        try {
          const response = await apiInstance.post('/[newModule]', item);
          set(state => ({
            data: [...state.data, response.data.data],
            loading: false
          }));
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      updateItem: async (id, updates) => {
        set({ loading: true, error: null });
        try {
          const response = await apiInstance.put(`/[newModule]/${id}`, updates);
          set(state => ({
            data: state.data.map(item =>
              item.id === id ? response.data.data : item
            ),
            loading: false
          }));
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      deleteItem: async (id) => {
        set({ loading: true, error: null });
        try {
          await apiInstance.delete(`/[newModule]/${id}`);
          set(state => ({
            data: state.data.filter(item => item.id !== id),
            loading: false
          }));
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: '[newModule]-store',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ data: state.data }),
    }
  )
);
```

### 第五步：前端组件开发（复用shadcn/ui）

```typescript
// app/[newModule]/page.tsx - 复用现有UI模式
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { use[NewModule]Store } from '@/store/use[NewModule]Store';
import MainLayout from '@/components/layout/main-layout';

export default function [NewModule]Page() {
  const { data, loading, error, fetchData, addItem, deleteItem } = use[NewModule]Store();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = async () => {
    if (!newItemName.trim()) return;

    await addItem({
      name: newItemName,
      description: newItemDesc,
    });
    setIsDialogOpen(false);
    setNewItemName('');
    setNewItemDesc('');
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除吗？')) {
      await deleteItem(id);
    }
  };

  return (
    <MainLayout>
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">[新模块]管理</h1>
            <Button onClick={() => setIsDialogOpen(true)}>
              添加[新模块]
            </Button>
          </div>

          {/* 数据列表 */}
          <div className="grid gap-4">
            {data.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    删除
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* 加载和错误状态 */}
          {loading && <div className="text-center">加载中...</div>}
          {error && <div className="text-red-500">{error}</div>}
        </div>
      </main>
    </MainLayout>
  );
}
```

## 📋 开发中遵循

- [ ] **代码复用**: 优先复制现有模块进行修改
- [ ] **命名规范**: 遵循现有文件和函数命名模式
- [ ] **错误处理**: 使用现有错误处理和提示方式
- [ ] **类型定义**: 沿用现有TypeScript接口定义
- [ ] **导入路径**: 使用现有的绝对路径别名（@/）

## 💡 最佳实践

1. **遵循现有模式** - 复制粘贴现有模块代码，然后修改
2. **保持一致性** - Store结构、API路径、命名风格保持一致
3. **简化设计** - POC阶段不需要复杂功能，保持简单
4. **测试验证** - 确保CRUD操作都能正常工作
5. **代码复用** - 优先使用shadcn/ui组件，避免自定义

## ⚠️ 常见错误

### ❌ 错误做法

```typescript
// 错误1：不使用Zustand persist
export const useStore = create((set) => ({...}));

// 错误2：API路径硬编码
const response = await fetch('/api/[newModule]');

// 错误3：不遵循现有Store结构
interface CustomStore {
  items: Item[];  // ❌ 应该用 data
  isLoading: boolean;  // ❌ 应该用 loading
}
```

### ✅ 正确做法

```typescript
// 正确1：使用persist保持一致性
export const useStore = create()(
  persist(
    (set, get) => ({...}),
    { name: 'store', storage: createJSONStorage(() => sessionStorage) }
  )
);

// 正确2：使用apiInstance
const response = await apiInstance.get('/[newModule]');

// 正确3：遵循现有Store结构
interface [Module]Store {
  data: [Module][];
  loading: boolean;
  error: string | null;
}
```

---

**💡 快速参考**:
- [POC开发原则](./poc-development-guide.md)
- [THEME.md设计规范](../../THEME.md)
- [组件开发检查清单](./COMPONENT_DEVELOPMENT_CHECKLIST.md)
- [数据库集成方案](../../../DATABASE_INTEGRATION_PLAN.md)
