# API 开发规范

## 📋 概述

本文档定义了深瞳AI Coding项目的 API 开发规范，确保所有 API 端点保持代码风格一致、文档完善和类型安全。

## 🎯 核心技术栈

### 标准技术方案
- **API 框架**: Next.js API Routes (官方标准)
- **类型验证**: Zod Schema + 手动验证
- **文档生成**: next-swagger-doc (JSDoc 注释)
- **类型检查**: TypeScript

### 为什么选择标准方案？
✅ **官方推荐**: Next.js 官方文档，社区支持好
✅ **学习成本低**: 30 分钟上手，无需学习第三方框架
✅ **灵活性高**: 不受第三方库限制
✅ **维护简单**: 代码统一，依赖少
✅ **文档完善**: next-swagger-doc 自动生成 OpenAPI 文档

---

## 📝 开发规范

### 1️⃣ 使用标准 Next.js API Routes

**要求**: 所有 API 路由**必须**使用标准的 Next.js API Routes 写法。

**示例**:
```typescript
// ✅ 正确 - 标准 Next.js API Routes
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  // 业务逻辑
  return NextResponse.json({ success: true, data: result });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // 业务逻辑
  return NextResponse.json({ success: true, data: result });
}
```

### 2️⃣ Zod Schema 验证

**要求**: 所有请求参数（query、body）**必须**定义 Zod Schema 并进行手动验证。

**示例**:
```typescript
import { z } from 'zod';

// Query 参数 Schema
const GetUsersQueryDTO = z.object({
  keyword: z.string().optional().describe('搜索关键词'),
  page: z.string().optional().describe('页码'),
  pageSize: z.string().optional().describe('每页数量'),
});

// 请求体 Schema
const CreateUserDTO = z.object({
  username: z.string().min(3).max(50).describe('用户名'),
  password: z.string().min(6).max(100).describe('密码'),
  displayName: z.string().min(1).max(50).describe('显示名称'),
  email: z.string().email().describe('邮箱地址'),
});

// 响应 Schema
const UserDTO = z.object({
  id: z.number().describe('用户ID'),
  username: z.string().describe('用户名'),
  displayName: z.string().describe('显示名称'),
  email: z.string().describe('邮箱'),
  createdAt: z.string().describe('创建时间'),
});

const GetUsersSuccessSchema = z.object({
  success: z.literal(true),
  data: z.object({
    items: z.array(UserDTO),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
  }),
});

// 错误响应 Schema（通用）
const ErrorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string().describe('错误信息'),
  errors: z.array(z.object({
    path: z.string().describe('错误字段路径'),
    message: z.string().describe('错误消息'),
  })).optional().describe('详细错误列表'),
});
```

### 3️⃣ JSDoc 注释规范

**要求**: 所有 API 端点**必须**添加 JSDoc 注释，供 `next-swagger-doc` 生成 OpenAPI 文档。

**示例**:
```typescript
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: 获取用户列表
 *     description: 支持关键词搜索和分页查询
 *     tags: [Users]
 *     parameters:
 *       - name: keyword
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           default: "1"
 *         description: 页码
 *       - name: pageSize
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           default: "20"
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 成功获取用户列表
 *       400:
 *         description: 请求参数验证失败
 *       500:
 *         description: 服务器内部错误
 */
export async function GET(request: NextRequest) {
  // 实现...
}
```

### 4️⃣ 错误处理规范

**要求**: 使用标准的错误响应格式，手动处理验证错误。

**验证错误处理**:
```typescript
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      keyword: searchParams.get('keyword') || undefined,
      page: searchParams.get('page') || '1',
      pageSize: searchParams.get('pageSize') || '20',
    };

    // 手动验证
    const validated = GetUsersQueryDTO.parse(queryParams);

    // 业务逻辑...
    return NextResponse.json(
      { success: true, data: result },
      { status: 200 }
    );
  } catch (error) {
    // Zod 验证错误
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: '请求参数验证失败',
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // 其他错误
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '服务器内部错误',
      },
      { status: 500 }
    );
  }
}
```

---

## 📁 文件组织规范

### 目录结构
```
app/api/
├── [category]/
│   └── [resource]/
│       ├── route.ts          # 主路由文件
│       ├── [id]/
│       │   └── route.ts      # 嵌套路由
│       └── schemas.ts        # Schema 定义（可选）
```

### 文件命名
- 路由文件：`route.ts`（Next.js 规范）
- Schema 文件：`schemas.ts` 或 `*.schemas.ts`
- 类型定义：`types.ts` 或 `*.types.ts`

---

## 🏗️ API 路由模板

### 标准 CRUD API

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ============ Schema 定义 ============

// Query 参数 Schema
const ListQueryDTO = z.object({
  keyword: z.string().optional(),
  page: z.string().optional().default('1'),
  pageSize: z.string().optional().default('20'),
});

// 请求体 Schema
const CreateBodyDTO = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
});

// 响应 Schema
const ItemDTO = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  createdAt: z.string(),
});

const ListSuccessSchema = z.object({
  success: z.literal(true),
  data: z.object({
    items: z.array(ItemDTO),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
  }),
});

const ItemSuccessSchema = z.object({
  success: z.literal(true),
  data: ItemDTO,
});

// 错误响应 Schema（通用）
const ErrorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  errors: z.array(z.object({
    path: z.string(),
    message: z.string(),
  })).optional(),
});

// ============ GET 端点 ============

/**
 * @swagger
 * /api/[category]/[resource]:
 *   get:
 *     summary: 获取资源列表
 *     description: 支持关键词搜索和分页查询
 *     tags: [Resource]
 *     parameters:
 *       - name: keyword
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *       - name: pageSize
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取列表
 *       400:
 *         description: 请求参数验证失败
 *       500:
 *         description: 服务器内部错误
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      keyword: searchParams.get('keyword') || undefined,
      page: searchParams.get('page') || '1',
      pageSize: searchParams.get('pageSize') || '20',
    };

    // 手动验证
    const validated = ListQueryDTO.parse(queryParams);
    const page = parseInt(validated.page, 10);
    const pageSize = parseInt(validated.pageSize, 10);

    // 业务逻辑...
    const result = await fetchResources({
      keyword: validated.keyword,
      page,
      pageSize,
    });

    return NextResponse.json(
      { success: true, data: result },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: '请求参数验证失败',
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '服务器内部错误',
      },
      { status: 500 }
    );
  }
}

// ============ POST 端点 ============

/**
 * @swagger
 * /api/[category]/[resource]:
 *   post:
 *     summary: 创建新资源
 *     description: 创建一个新的资源项
 *     tags: [Resource]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *             required:
 *               - name
 *               - email
 *     responses:
 *       201:
 *         description: 资源创建成功
 *       400:
 *         description: 请求参数验证失败
 *       500:
 *         description: 服务器内部错误
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 手动验证
    const validated = CreateBodyDTO.parse(body);

    // 业务逻辑...
    const newItem = await createResource(validated);

    return NextResponse.json(
      { success: true, data: newItem },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: '请求参数验证失败',
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '服务器内部错误',
      },
      { status: 500 }
    );
  }
}
```

---

## 🔒 类型安全保证

### TypeScript 编译时检查
```typescript
// ✅ TypeScript 类型检查
const validated = GetUsersQueryDTO.parse(queryParams);
const page: number = parseInt(validated.page, 10); // page 是 string 类型

// ❌ 编译错误：如果尝试访问不存在的属性
const invalid = validated.nonExistent; // TypeScript 报错
```

### Zod 运行时验证
```typescript
// ✅ 运行时自动验证
const validated = GetUsersQueryDTO.parse(queryParams);
// 如果验证失败，抛出 z.ZodError

// ✅ 安全的类型推导
const page = validated.page; // TypeScript 知道这是 string 类型
```

---

## 📝 开发工作流

### 1. 创建新 API 步骤

```bash
# 1. 创建路由目录
mkdir -p app/api/products

# 2. 创建路由文件
touch app/api/products/route.ts

# 3. 编写 API 代码（使用本规范中的模板）

# 4. 生成 OpenAPI 文档
npm run openapi:generate -- --output=public/openapi.json

# 5. 验证 Swagger UI
# 访问 http://localhost:3000/api-docs

# 6. 测试 API
curl http://localhost:3000/api/products
```

### 2. 修改现有 API

```bash
# 1. 修改 API 代码

# 2. 更新 JSDoc 注释（如果有）

# 3. 重新生成文档
npm run openapi:generate -- --output=public/openapi.json

# 4. 测试验证
```

---

## 🧪 测试规范

### 单元测试
```typescript
import { GET } from '@/app/api/users/route';
import { NextRequest } from 'next/server';

describe('GET /api/users', () => {
  it('should validate query params', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/users?page=invalid'
    );
    const response = await GET(request);
    expect(response.status).toBe(400);
  });
});
```

### 集成测试
```typescript
describe('GET /api/users integration', () => {
  it('should return users list', async () => {
    const response = await fetch('http://localhost:3000/api/users?page=1');
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
```

---

## ✅ Code Review 检查清单

在提交 PR 前，请确认：

- [ ] 使用标准 Next.js API Routes 写法
- [ ] 定义了 Zod Schema
- [ ] 添加了 JSDoc 注释（用于文档生成）
- [ ] 手动验证请求参数（使用 Zod）
- [ ] 错误处理完善（Zod 验证错误 + 其他错误）
- [ ] 类型检查通过（`npx tsc --noEmit`）
- [ ] 重新生成了 OpenAPI 文档
- [ ] 测试通过
- [ ] Swagger UI 显示正确

---

## 🚫 禁止事项

❌ **禁止**使用第三方 API 框架（如 defineRoute）：
```typescript
// ❌ 错误示例 - 使用 defineRoute
export const { GET } = defineRoute({
  queryParams: GetUsersQueryDTO,
  action: async ({ queryParams }) => {
    // 不允许！使用标准 Next.js 写法
  },
});
```

❌ **禁止**跳过 Zod Schema 验证：
```typescript
// ❌ 错误示例 - 没有验证
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page'); // 没有验证！
  // 直接使用未经验证的参数
}
```

❌ **禁止**忽略错误处理：
```typescript
// ❌ 错误示例 - 没有 try-catch
export async function POST(request: NextRequest) {
  const body = await request.json();
  const validated = CreateUserDTO.parse(body); // 可能抛出错误！
  // 没有 try-catch，会导致 500 错误
}
```

---

## 🎯 最佳实践

### 1. Schema 命名
- 请求参数：`{Operation}{Type}DTO` (如 `GetUsersQueryDTO`, `CreateUserDTO`)
- 响应：`{Resource}DTO` (如 `UserDTO`, `ProductDTO`)
- 成功响应：`{Operation}SuccessSchema` (如 `GetUsersSuccessSchema`)
- 错误响应：`ErrorResponseSchema`（统一）

### 2. 操作命名
- 列表：`get{Resource}s` 或 `list{Resource}s`
- 详情：`get{Resource}`
- 创建：`create{Resource}`
- 更新：`update{Resource}`
- 删除：`delete{Resource}`

### 3. 文档注释
- 简洁的 summary（≤ 50 字符）
- 详细的 description（说明功能、限制、注意事项）
- 完整的 tags（用于 Swagger UI 分组）

### 4. 错误处理
- Zod 验证错误：返回 400，包含详细错误信息
- 业务逻辑错误：返回合适的 4xx 状态码
- 系统错误：返回 500

### 5. 性能优化
- 使用 `z.safeParse()` 如果需要自定义错误处理
- 缓存 Schema 定义（避免重复创建）
- 使用 `z.lazy()` 处理循环引用

---

## 📚 相关文档

- [next-swagger-doc 集成指南](./next-swagger-doc-integration.md)
- [Zod 文档](https://zod.dev/)
- [Next.js API Routes 文档](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [OpenAPI 规范](https://swagger.io/specification/)

---

## 💡 可选优化

### 封装验证工具函数

```typescript
// lib/api-validation.ts
import { z } from 'zod';

export async function validateQuery<T>(
  schema: z.ZodSchema<T>,
  searchParams: URLSearchParams
): Promise<{ success: true; data: T } | { success: false; error: z.ZodError }> {
  try {
    const data = Object.fromEntries(searchParams);
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
}

export async function validateBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown
): Promise<{ success: true; data: T } | { success: false; error: z.ZodError }> {
  try {
    const result = schema.parse(body);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
}

// 使用示例
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const validated = await validateQuery(GetUsersQueryDTO, searchParams);

  if (!validated.success) {
    return NextResponse.json(
      {
        success: false,
        message: '请求参数验证失败',
        errors: validated.error.errors,
      },
      { status: 400 }
    );
  }

  // 使用 validated.data...
}
```

---

**版本**: v2.0.0 (标准 Next.js 方案)
**最后更新**: 2026-01-05
**维护者**: 深瞳AI Coding Team
