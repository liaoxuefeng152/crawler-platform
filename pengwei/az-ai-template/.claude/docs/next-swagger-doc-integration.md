# next-swagger-doc 集成指南

## 🎯 集成状态

✅ **已成功集成** `next-swagger-doc` - 自动生成 OpenAPI 文档

**验证结果**：
- ✅ 自动生成 OpenAPI JSON 成功
- ✅ Swagger UI 正常显示文档
- ✅ GET 和 POST 端点完整生成
- ✅ 格式验证通过

---

## 📦 安装的依赖

```json
{
  "next-swagger-doc": "^0.4.1"
}
```

**GitHub**: https://github.com/jellydn/next-swagger-doc
**Stars**: ⭐ 6.7k+
**支持**: Next.js 9 - Next.js 16

---

## 🔑 核心概念

### 🎯 工作原理

`next-swagger-doc` 通过扫描 API 路由文件中的 JSDoc 注释，自动生成 OpenAPI 3.1 规范的 JSON 文件。

```
┌─────────────────────────────────────────────────────────┐
│  Next.js API Routes (标准写法)                         │
│  ├─ 使用 export async function GET/POST/PUT/DELETE    │
│  ├─ Zod Schema 手动验证                               │
│  └─ 业务逻辑                                          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  JSDoc 注释                                            │
│  ├─ @swagger 标记                                     │
│  ├─ 定义 API 元数据（summary, tags, parameters...）   │
│  └─ 定义请求/响应格式                                  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  next-swagger-doc                                      │
│  ├─ 扫描 app/api 目录                                  │
│  ├─ 解析 JSDoc 注释                                    │
│  ├─ 生成 OpenAPI JSON                                  │
│  └─ 支持 Swagger UI                                    │
└─────────────────────────────────────────────────────────┘
```

### 📝 使用模式

**1. 标准 Next.js API Routes**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 定义 Zod Schema
const GetUsersQueryDTO = z.object({
  keyword: z.string().optional(),
  page: z.string().optional(),
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: 获取用户列表
 *     tags: [Users]
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      keyword: searchParams.get('keyword') || undefined,
      page: searchParams.get('page') || '1',
    };

    // 手动验证
    const validated = GetUsersQueryDTO.parse(queryParams);

    // 业务逻辑...
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}
```

**2. JSDoc 注释生成文档**:
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
 *     responses:
 *       200:
 *         description: 成功获取用户列表
 */
// ↑ next-swagger-doc 读取 JSDoc 生成 OpenAPI
```

### ⚠️ 重要原则

1. **JSDoc 定义 API 文档**
   - 描述 API 功能和行为
   - 定义请求参数、响应格式
   - 用于生成 OpenAPI 规范

2. **Zod Schema 定义类型**
   - 定义数据结构和验证规则
   - 用于运行时验证
   - 提供类型推导

3. **职责分离**
   - **JSDoc**: 文档生成（供 Swagger UI 使用）
   - **Zod**: 类型验证（供运行时使用）
   - **Next.js API Routes**: 业务逻辑

---

## 🔄 工作流程

### 开发流程

1. **编写 API 路由**（标准 Next.js API Routes）
2. **定义 Zod Schema**（类型验证）
3. **添加 JSDoc 注释**（OpenAPI 文档）
4. **运行生成命令** → 自动生成 `openapi.json`
5. **访问 Swagger UI** → 查看完整文档

### 生成命令

```bash
# ⭐ 方式1: 生成到 public 目录（推荐 - 用于浏览器访问）
npm run openapi:generate -- --output=public/openapi.json
# 输出: /home/gms/work-space/template/public/openapi.json
# 浏览器访问: http://localhost:3000/openapi.json

# 方式2: 生成到项目根目录
npm run openapi:generate
# 输出: /home/gms/work-space/template/openapi.json
# 用途: 文档归档、版本控制

# 方式3: 生成到其他目录
npm run openapi:generate -- --output=doc/openapi.json
npm run openapi:generate -- --output=docs/api.json

# 方式4: 使用绝对路径
npm run openapi:generate -- --output=/absolute/path/to/openapi.json

# 检查文档状态
npm run openapi:check
```

**⚠️ 重要提示**：
- **Swagger UI 需要访问 public 目录的文件**
- 使用 `--output=public/openapi.json` 可让 Swagger UI 正常加载
- 生成到根目录或其他位置时，浏览器无法直接访问

**输出特性**：
- ✅ **自动覆盖**: 如果文件已存在，直接覆盖
- ✅ **自动创建目录**: 如果目标目录不存在，自动创建
- ✅ **支持相对路径和绝对路径**
- ✅ **显示覆盖状态**: 生成时会显示是否覆盖了已有文件

---

## 📝 JSDoc 注释规范

### 基本结构

```typescript
/**
 * @swagger
 * /api/your-endpoint:
 *   get:
 *     summary: 简短描述
 *     description: 详细描述
 *     tags: [YourTag]
 *     parameters:
 *       - name: paramName
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: 参数说明
 *     responses:
 *       200:
 *         description: 成功
 */
export const { GET } = defineRoute({...})
```

### 完整示例

**GET 端点（带查询参数）**：

```typescript
/**
 * @swagger
 * /api/openapi-demo/users:
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
 *         description: 页码
 *       - name: pageSize
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 成功获取用户列表
 *       400:
 *         description: 请求参数验证失败
 *       500:
 *         description: 服务器内部错误
 */
export const { GET } = defineRoute({
  operationId: 'getUsers',
  method: 'GET',
  queryParams: GetUsersQueryDTO,
  action: async ({ queryParams }) => {
    // ...
  },
});
```

**POST 端点（带请求体）**：

```typescript
/**
 * @swagger
 * /api/openapi-demo/users:
 *   post:
 *     summary: 创建新用户
 *     description: 创建一个新的用户账号
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 description: 用户名
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 100
 *                 description: 密码
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 邮箱地址
 *             required:
 *               - username
 *               - password
 *               - email
 *     responses:
 *       201:
 *         description: 用户创建成功
 *       400:
 *         description: 请求参数验证失败
 */
export const { POST } = defineRoute({
  operationId: 'createUser',
  method: 'POST',
  requestBody: CreateUserDTO,
  action: async ({ body }) => {
    // ...
  },
});
```

---

## 🎨 注释字段说明

### 基本字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `summary` | string | ✅ | 简短描述（显示在列表中） |
| `description` | string | ❌ | 详细描述 |
| `tags` | array | ✅ | 分组标签 |

### 参数字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 参数名称 |
| `in` | string | 位置：`query` / `path` / `header` |
| `required` | boolean | 是否必填 |
| `schema` | object | 参数类型定义 |
| `description` | string | 参数说明 |

### 响应字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `description` | string | 响应描述 |
| `content` | object | 响应内容（可选） |

---

## ✅ 最佳实践

### 1. 保持代码和注释同步

```typescript
/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: 创建用户
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string  # 与 Zod Schema 保持一致
 */
export const { POST } = defineRoute({
  requestBody: CreateUserDTO,  # 与 JSDoc 保持一致
  action: async ({ body }) => {
    // ...
  },
});
```

### 2. 使用标签分组

```typescript
tags: [Users]      // 用户管理
tags: [Auth]       // 认证授权
tags: [Content]    // 内容管理
```

### 3. 详细的参数说明

```typescript
parameters:
  - name: page
    in: query
    required: false
    schema:
      type: string
      example: "1"        # 添加示例值
      pattern: "^[0-9]+$" # 添加格式限制
    description: |
      页码（从1开始）

      示例：
      - 1: 第一页
      - 2: 第二页
```

### 4. 完整的响应定义

```typescript
responses:
  200:
    description: 成功
    content:
      application/json:
        schema:
          type: object
          properties:
            success:
              type: boolean
              example: true
            data:
              type: object
            message:
              type: string
  400:
    description: 请求错误
    content:
      application/json:
        example:
          success: false
          message: "参数验证失败"
```

---

## 🚀 添加新端点流程

### 步骤 1: 创建 API 路由

```typescript
// app/api/products/route.ts
import defineRoute from '@omer-x/next-openapi-route-handler';
import { z } from 'zod';

const GetProductsQueryDTO = z.object({
  category: z.string().optional(),
});

export const { GET } = defineRoute({
  operationId: 'getProducts',
  queryParams: GetProductsQueryDTO,
  action: async ({ queryParams }) => {
    // ...
  },
});
```

### 步骤 2: 添加 JSDoc 注释

```typescript
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: 获取产品列表
 *     description: 支持按分类筛选
 *     tags: [Products]
 *     parameters:
 *       - name: category
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: 产品分类
 *     responses:
 *       200:
 *         description: 成功
 */
export const { GET } = defineRoute({...});
```

### 步骤 3: 生成文档

```bash
npm run openapi:generate
```

### 步骤 4: 验证

```bash
npm run openapi:check
```

访问 `http://localhost:3000/api-docs` 查看文档

---

## 📊 生成结果示例

### 示例 1: 默认生成到根目录

运行 `npm run openapi:generate` 后：

```
🚀 开始生成 OpenAPI 文档...
📂 使用默认输出路径（项目根目录）
✅ OpenAPI 文档生成成功！
📄 文件路径: /home/gms/work-space/template/openapi.json
♻️  文件已覆盖

📊 统计信息:
   - 路由数量: 1
   - Schema 数量: 0
   - 标签数量: 1

📋 已生成的 API 端点：
   GET, POST /api/openapi-demo/users
```

### 示例 2: 自定义输出路径

运行 `npm run openapi:generate -- --output=docs/api.json` 后：

```
🚀 开始生成 OpenAPI 文档...
📂 自定义输出路径: /home/gms/work-space/template/docs/api.json
📁 创建目录: /home/gms/work-space/template/docs
✅ OpenAPI 文档生成成功！
📄 文件路径: /home/gms/work-space/template/docs/api.json

📊 统计信息:
   - 路由数量: 1
   - Schema 数量: 0
   - 标签数量: 1
```

生成的 `openapi.json` 文件：

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "深瞳AI Coding API",
    "version": "1.0.0",
    "description": "深瞳AI Coding 平台的 API 接口文档 - 使用 next-swagger-doc 自动生成"
  },
  "paths": {
    "/api/openapi-demo/users": {
      "get": {
        "summary": "获取用户列表",
        "description": "支持关键词搜索和分页查询",
        "tags": ["Users"],
        "parameters": [...]
      }
    }
  }
}
```

---

## 🔧 工具对比

### 之前：手动维护

❌ 需要手动编写 JSON
❌ 容易出错
❌ 维护成本高
✅ 完全控制

### 现在：自动生成

✅ 从 JSDoc 自动生成
✅ 准确可靠（无幻觉）
✅ 维护成本低
✅ 类型安全（保留 `defineRoute`）

---

## 📚 参考资源

- **next-swagger-doc**: https://github.com/jellydn/next-swagger-doc
- **OpenAPI 规范**: https://swagger.io/specification/
- **JSDoc 文档**: https://jsdoc.app/

---

## 🎉 总结

**优势**：
- ✅ 自动生成 OpenAPI JSON
- ✅ 无 AI 幻觉风险（基于注释）
- ✅ 保留类型安全（`defineRoute`）
- ✅ 开发体验友好

**工作流程**：
1. 编写 API 路由 + JSDoc
2. 运行 `npm run openapi:generate`
3. 访问 Swagger UI 验证

**下一步**：
- 为所有现有 API 添加 JSDoc
- 在后端专家中集成此流程
- 建立 JSDoc 注释规范
