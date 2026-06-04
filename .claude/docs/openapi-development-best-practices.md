# OpenAPI 开发最佳实践

## 🎯 概述

本文档说明如何正确开发 API 并生成 OpenAPI 文档，确保 API 出现在 Swagger UI 中。

## 🔍 核心原理

### next-swagger-doc 工作原理

```
┌─────────────────────────────────────────┐
│  app/api/ (扫描目录)                   │
│  ├── users/route.ts                   │
│  ├── products/route.ts                │
│  └── orders/route.ts                  │
└─────────────────────────────────────────┘
              ↓ 读取文件
┌─────────────────────────────────────────┐
│  查找 @swagger 注释                    │
│  提取 API 元数据                       │
│  - 请求参数                           │
│  - 请求体                             │
│  - 响应格式                           │
└─────────────────────────────────────────┘
              ↓ 生成
┌─────────────────────────────────────────┐
│  openapi.json                         │
│  - OpenAPI 3.1.0 规范                  │
│  - 完整的 API 文档                     │
└─────────────────────────────────────────┘
              ↓ 读取
┌─────────────────────────────────────────┐
│  Swagger UI                           │
│  - 可视化展示                         │
│  - 在线测试                           │
└─────────────────────────────────────────┘
```

### 关键点

1. **API 必须在 `app/api/` 目录下**
   - Next.js 规范要求
   - next-swagger-doc 默认扫描此目录
   - 不需要手动配置每个 API

2. **必须有 JSDoc 注释**
   - 使用 `@swagger` 标记
   - 定义请求参数、响应格式
   - 没有注释的 API 不会出现在文档中

3. **生成到 `public/openapi.json`**
   - Swagger UI 从这里读取文档
   - 浏览器可以直接访问

## 📁 正确的项目结构

### ✅ 推荐结构

```
app/
├── api/                               # ← 所有 API 在这里开发
│   ├── auth/                          # 认证相关 API
│   │   ├── login/route.ts
│   │   ├── register/route.ts
│   │   └── verify/route.ts
│   │
│   ├── users/                         # 用户管理 API
│   │   ├── route.ts                   # ← 主路由（CRUD）
│   │   ├── current/route.ts           # 当前用户信息
│   │   ├── [id]/route.ts              # 单个用户操作
│   │   └── search/route.ts           # 搜索用户
│   │
│   ├── products/                      # 产品 API（示例）
│   │   └── route.ts
│   │
│   └── orders/                        # 订单 API（示例）
│       └── route.ts
│
└── api-docs/                          # ← 仅用于展示 Swagger UI
    └── page.tsx                       # 不要在这里开发 API
```

### ❌ 错误结构

```
app/
├── api-docs/                          # ❌ 错误：在这里开发 API
│   ├── users/route.ts                 # ❌ Swagger UI 无法识别
│   └── products/route.ts              # ❌ 不符合 Next.js 规范
│
└── api/                               # ❌ 空的或缺少 API
    └── ...
```

## 🔄 完整开发流程

### 步骤 1: 开发 API

**位置**: `app/api/products/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 1. 定义 Zod Schema
const GetProductsQueryDTO = z.object({
  keyword: z.string().optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
});

const CreateProductDTO = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  description: z.string().optional(),
});

// 2. 使用标准 Next.js API Routes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      keyword: searchParams.get('keyword') || undefined,
      page: searchParams.get('page') || '1',
      pageSize: searchParams.get('pageSize') || '20',
    };

    // 手动验证
    const validated = GetProductsQueryDTO.parse(queryParams);

    // 业务逻辑...
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
          errors: error.errors,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // 类似的实现...
}
```

### 步骤 2: 添加 JSDoc 注释

**在函数之前添加**:

```typescript
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: 获取产品列表
 *     description: 支持关键词搜索和分页查询
 *     tags: [Products]
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
 *         description: 成功获取产品列表
 *       400:
 *         description: 请求参数验证失败
 *       500:
 *         description: 服务器内部错误
 */
export async function GET(request: NextRequest) {
  // ...
}

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: 创建新产品
 *     description: 创建一个新的产品
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: 产品名称
 *               price:
 *                 type: number
 *                 description: 产品价格
 *               description:
 *                 type: string
 *                 description: 产品描述
 *     responses:
 *       201:
 *         description: 产品创建成功
 *       400:
 *         description: 请求参数验证失败
 *       500:
 *         description: 服务器内部错误
 */
export async function POST(request: NextRequest) {
  // ...
}
```

### 步骤 3: 生成 OpenAPI 文档

**运行命令**:
```bash
npm run openapi:generate -- --output=public/openapi.json
```

**预期输出**:
```
🚀 开始生成 OpenAPI 文档...
📂 自定义输出路径: /home/gms/work-space/template/public/openapi.json
✅ OpenAPI 文档生成成功！
📄 文件路径: /home/gms/work-space/template/public/openapi.json
♻️  文件已覆盖

📊 统计信息:
   - 路由数量: 2 (GET /api/users, GET /api/products)
   - Schema 数量: 0
   - 标签数量: 2

📋 已生成的 API 端点：
   GET, POST /api/users
   GET, POST /api/products
```

### 步骤 4: 验证 Swagger UI

1. **访问 Swagger UI**
   ```
   http://localhost:3000/api-docs
   ```

2. **检查 API 是否出现**
   - 应该能看到所有标签
   - 展开标签应该能看到 API 端点
   - 参数、响应格式应该正确显示

3. **在线测试**
   - 点击 "Try it out"
   - 填写参数
   - 点击 "Execute"
   - 查看响应

## ⚠️ 常见问题排查

### 问题 1: API 没有出现在 Swagger UI

**可能原因**:
- ❌ 缺少 JSDoc 注释
- ❌ JSDoc 注释格式错误
- ❌ 没有重新生成 openapi.json
- ❌ Swagger UI 缓存未刷新

**解决方法**:
1. 检查 API 文件是否有 `@swagger` 注释
2. 运行 `npm run openapi:generate -- --output=public/openapi.json`
3. 硬刷新 Swagger UI 页面（Ctrl+Shift+R）

### 问题 2: 参数定义不准确

**可能原因**:
- JSDoc 中的参数与代码不一致

**解决方法**:
1. 对比 Zod Schema 和 JSDoc 定义
2. 确保参数名、类型、是否必需一致
3. 重新生成文档

### 问题 3: 生成失败

**可能原因**:
- JSDoc 格式错误（JSON 格式不正确）
- 特殊字符未转义

**解决方法**:
1. 检查 JSDoc 注释的 YAML 格式
2. 确保缩进正确（2 空格）
3. 检查特殊字符是否正确转义

## 📝 JSDoc 注释快速参考

### 基本结构

```typescript
/**
 * @swagger
 * /api/resource:
 *   get:
 *     summary: 简短描述
 *     description: 详细描述
 *     tags: [ResourceTag]
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
 *       400:
 *         description: 请求错误
 */
```

### 常用标签

| 标签 | 说明 | 示例 |
|------|------|------|
| `summary` | 简短描述（≤50字） | `获取用户列表` |
| `description` | 详细描述 | `支持关键词搜索和分页` |
| `tags` | 分组标签 | `[Users]`, `[Products]` |
| `parameters` | 请求参数 | 定义 query 参数 |
| `requestBody` | 请求体（POST） | 定义 body 参数 |
| `responses` | 响应定义 | 定义 200, 400, 500 等 |

## 🎯 最佳实践总结

### ✅ DO（推荐做法）

1. **API 在 `app/api/` 下开发**
   ```
   app/api/users/route.ts  ✅
   ```

2. **为所有 API 添加 JSDoc 注释**
   ```typescript
   /**
    * @swagger
    * /api/users:
    *   get:
    *     summary: 获取用户列表
    *     ...
    */
   ```

3. **注释与代码保持一致**
   - JSDoc 参数 = Zod Schema
   - JSDoc 响应 = 实际返回值

4. **每次修改后重新生成文档**
   ```bash
   npm run openapi:generate -- --output=public/openapi.json
   ```

5. **在 Swagger UI 中测试**
   - 验证文档准确性
   - 测试 API 功能

### ❌ DON'T（避免做法）

1. **❌ 在 `app/api-docs/` 下开发 API**
   - 这个目录仅用于展示 Swagger UI
   - 不会自动被 next-swagger-doc 扫描

2. **❌ 跳过 JSDoc 注释**
   - API 不会出现在文档中
   - 无法在 Swagger UI 中测试

3. **❌ 注释与代码不一致**
   - 误导使用者
   - 测试失败

4. **❌ 生成到错误的目录**
   - 必须生成到 `public/openapi.json`
   - 否则浏览器无法访问

5. **❌ 修改 API 后不更新文档**
   - 文档过时
   - 误导使用者

## 🔗 相关文档

- **API 开发规范**:.claude/docs/api-development-standards.md`
- **next-swagger-doc 集成**:.claude/docs/next-swagger-doc-integration.md`
- **OpenAPI 规范**: https://swagger.io/specification/

## 💡 技巧提示

### 快速生成 JSDoc

可以使用代码片段（Snippet）快速生成 JSDoc 模板：

**VS Code Snippet 示例**:
```json
{
  "Swagger GET": {
    "prefix": "swagger-get",
    "body": [
      "/**",
      " * @swagger",
      " * /api/${1:resource}:",
      " *   get:",
      " *     summary: ${2:获取资源列表}",
      " *     description: ${3:详细描述}",
      " *     tags: [${4:ResourceTag}]",
      " *     parameters:",
      " *       - name: keyword",
      " *         in: query",
      " *         required: false",
      " *         schema:",
      " *           type: string",
      " *         description: 搜索关键词",
      " *     responses:",
      " *       200:",
      " *         description: 成功",
      " *       400:",
      " *         description: 请求错误",
      " *       500:",
      " *         description: 服务器错误",
      " */"
    ]
  }
}
```

### 批量更新文档

修改多个 API 后：
```bash
# 1. 添加/更新 JSDoc 注释

# 2. 重新生成文档
npm run openapi:generate -- --output=public/openapi.json

# 3. 验证所有 API 都出现
curl http://localhost:3000/openapi.json | jq '.paths | keys'
```

---

**版本**: v1.0.0
**最后更新**: 2026-01-05
**维护者**: 深瞳AI Coding Team
