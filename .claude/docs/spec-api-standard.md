# spec-api.md标准规范

> **版本**: v1.0
> **日期**: 2025-12-31
> **用途**: 架构专家编写spec-api.md的标准规范

---

## 📋 目录

1. [概述](#概述)
2. [RESTful设计规范](#restful设计规范)
3. [成功标准定义](#成功标准定义)
4. [Zod Schema定义](#zod-schema定义)
5. [错误处理规范](#错误处理规范)
6. [模板与示例](#模板与示例)
7. [验收检查清单](#验收检查清单)

---

## 概述

### 什么是spec-api.md？

**spec-api.md**是API契约定义文件，用于：
- ✅ 定义前后端交互的API契约
- ✅ 作为API测试的基准
- ✅ 作为open-api.json生成的依据
- ✅ 作为前端开发的参考

### 为什么需要标准规范？

**工作流v2的关键改进**：
```
旧流程: spec-api.md（未明确规范）→ API实现
新流程: spec-api.md（RESTful + 成功标准）→ API实现 → API测试 → OpenAPI
```

**优势**：
1. **API设计标准化**：符合RESTful规范，易于理解和维护
2. **成功标准明确**：每个接口有明确的成功标准，测试有据可依
3. **契约精确**：使用Zod Schema定义，类型安全
4. **前后端一致**：前后端基于同一契约开发，减少误解

### 谁负责编写？

**负责人**：architecture-planning-expert（架构专家）
**阶段**：阶段3: Tasks（任务拆解）
**触发条件**：Clarify阶段完成（plan.md就绪）

---

## RESTful设计规范

### HTTP方法使用

| HTTP方法 | 用途 | 示例 | 幂等性 |
|---------|------|------|--------|
| **GET** | 获取资源 | GET /api/user/profile | ✅ 是 |
| **POST** | 创建资源 | POST /api/auth/login | ❌ 否 |
| **PATCH** | 部分更新 | PATCH /api/user/profile | ❌ 否 |
| **DELETE** | 删除资源 | DELETE /api/activities/123 | ✅ 是 |
| **PUT** | 完整更新（少用） | PUT /api/user/profile | ✅ 是 |

**原则**：
- ✅ GET用于查询，不修改数据
- ✅ POST用于创建资源或触发操作
- ✅ PATCH用于部分更新
- ✅ DELETE用于删除资源
- ❌ 避免使用GET修改数据（不安全）

### 路径命名规范

**规范**：
- ✅ 使用小写字母
- ✅ 使用连字符（-）分隔单词
- ✅ 使用复数形式表示资源
- ✅ 路径层级清晰，不超过3层

**示例**：
```
✅ /api/auth/login
✅ /api/user/profile
✅ /api/user/activities
✅ /api/activities
✅ /api/activities/:id

❌ /api/getUserInfo
❌ /api/UserProfile
❌ /api/user_my_activities
❌ /api/v1/auth/user/login/get
```

### 请求/响应格式

**统一格式**：
- ✅ Content-Type: application/json
- ✅ 请求体：JSON对象
- ✅ 响应体：JSON对象

**成功响应格式**：
```typescript
{
  success: true;
  data: {
    // 业务数据
  };
}
```

**错误响应格式**：
```typescript
{
  success: false;
  error: {
    code: "ERROR_CODE";
    message: "错误描述";
  };
}
```

### 版本控制（可选）

**方法1：路径版本**：
```
/api/v1/auth/login
/api/v2/auth/login
```

**方法2：Header版本**：
```
Accept: application/vnd.api.v1+json
```

**POC项目建议**：
- ⚠️ 不使用版本控制（简化设计）
- ⚠️ 如确需版本控制，使用路径版本

---

## 成功标准定义

### 什么是成功标准？

**成功标准**定义API调用的预期结果，包括：
- ✅ 明确的状态码
- ✅ 响应时间要求
- ✅ 数据格式要求
- ✅ 业务逻辑预期

### 状态码规范

| 状态码 | 含义 | 使用场景 | 示例 |
|--------|------|---------|------|
| **200** | OK | 请求成功 | GET /api/user/profile |
| **400** | Bad Request | 参数验证失败 | 验证码格式错误 |
| **401** | Unauthorized | 未授权 | Token过期或无效 |
| **404** | Not Found | 资源不存在 | 活动ID不存在 |
| **500** | Internal Server Error | 服务器错误 | 数据库连接失败 |

**原则**：
- ✅ 严格遵循HTTP状态码语义
- ✅ 业务错误使用400、401等
- ✅ 系统错误使用500
- ❌ 避免使用200表示错误

### 响应时间要求

**定义响应时间的理由**：
- 明确性能预期
- 作为测试基准
- 作为优化目标

**示例**：
```markdown
### POST /api/auth/login

**成功标准**：
- 状态码：200 OK
- 响应时间：< 500ms
- Token有效期：7天
- 数据格式：符合Zod Schema
```

**常见响应时间标准**：
- ✅ 简单查询（GET）：< 200ms
- ✅ 复杂查询（GET）：< 500ms
- ✅ 写操作（POST/PATCH）：< 500ms
- ✅ 认证操作（POST /api/auth/login）：< 500ms
- ⚠️ 报表生成（GET）：< 2000ms（可放宽）

### 数据格式要求

**必须符合Zod Schema定义**：
- ✅ 请求参数符合请求Schema
- ✅ 响应数据符合响应Schema
- ✅ 字段类型正确（string/number/boolean）
- ✅ 字段验证规则通过（pattern/minLength）

**示例**：
```markdown
### 请求Schema（Zod）
```typescript
const LoginRequestSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/),
  code: z.string().length(4)
});
```

### 响应Schema（Zod）
```typescript
const LoginResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    token: z.string(),
    expiresIn: z.number()
  })
});
```
```

---

## Zod Schema定义

### 为什么使用Zod？

**优势**：
- ✅ 类型安全
- ✅ 运行时验证
- ✅ 自动生成TypeScript类型
- ✅ 错误信息友好

### Schema定义规范

**基础类型**：
```typescript
// 字符串
z.string()

// 数字
z.number()

// 布尔
z.boolean()

// 字面量
z.literal(true)
z.literal("ACTIVE")

// 可选
z.string().optional()

// 可空
z.string().nullable()

// 默认值
z.string().default("default")
```

**验证规则**：
```typescript
// 字符串验证
z.string()
  .min(1, "至少1个字符")
  .max(100, "最多100个字符")
  .email("必须是邮箱格式")
  .url("必须是URL格式")
  .regex(/^1[3-9]\d{9}$/, "必须是手机号格式")

// 数字验证
z.number()
  .min(0, "不能小于0")
  .max(100, "不能大于100")
  .int("必须是整数")
  .positive("必须是正数")

// 数组验证
z.array(z.string())
  .min(1, "至少1个元素")
  .max(10, "最多10个元素")

// 对象验证
z.object({
  name: z.string(),
  age: z.number()
})
```

**复杂Schema**：
```typescript
// 嵌套对象
const UserSchema = z.object({
  id: z.number(),
  profile: z.object({
    name: z.string(),
    email: z.string().email()
  })
});

// 联合类型
const ValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean()
]);

// 枚举
const StatusSchema = z.enum([
  "ACTIVE",
  "INACTIVE",
  "PENDING"
]);

// 可选字段
const UpdateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional()
});
```

### 请求Schema模板

```typescript
const LoginRequestSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, "手机号格式错误"),
  code: z.string().length(4, "验证码必须是4位")
});
```

### 响应Schema模板

**成功响应**：
```typescript
const LoginResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    token: z.string(),
    expiresIn: z.number()
  })
});
```

**错误响应**：
```typescript
const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string()
  })
});
```

---

## 错误处理规范

### 错误码定义

**格式**：大写字母+下划线，全大写

**示例**：
```typescript
// 验证错误
"INVALID_CODE"      // 验证码错误
"INVALID_PHONE"     // 手机号格式错误
"INVALID_TOKEN"     // Token无效

// 资源错误
"USER_NOT_FOUND"    // 用户不存在
"ACTIVITY_NOT_FOUND" // 活动不存在

// 权限错误
"UNAUTHORIZED"      // 未授权
"FORBIDDEN"         // 禁止访问

// 服务器错误
"INTERNAL_ERROR"    // 内部错误
"DATABASE_ERROR"    // 数据库错误
```

### 错误响应结构

**统一格式**：
```typescript
{
  success: false;
  error: {
    code: "ERROR_CODE";
    message: "用户友好的错误描述";
    details?: any; // 可选的详细信息
  };
}
```

**示例**：
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CODE",
    "message": "验证码错误，请重新输入"
  }
}
```

### HTTP状态码与错误码映射

| HTTP状态码 | 错误码 | 场景 | message示例 |
|-----------|--------|------|-----------|
| 400 | INVALID_PHONE | 手机号格式错误 | "手机号格式错误" |
| 400 | INVALID_CODE | 验证码错误 | "验证码错误" |
| 401 | UNAUTHORIZED | Token无效 | "未授权，请重新登录" |
| 401 | TOKEN_EXPIRED | Token过期 | "Token已过期，请重新登录" |
| 404 | USER_NOT_FOUND | 用户不存在 | "用户不存在" |
| 404 | ACTIVITY_NOT_FOUND | 活动不存在 | "活动不存在" |
| 500 | INTERNAL_ERROR | 服务器错误 | "服务器内部错误" |

---

## 模板与示例

### 完整模板

```markdown
## API: POST /api/auth/login

### RESTful规范
- ✅ HTTP方法：POST（创建资源 - Session/Token）
- ✅ 路径：/api/auth/login（资源层级清晰）
- ✅ 请求体：JSON格式
- ✅ 响应体：JSON格式

### 成功标准
- ✅ 状态码：200 OK（登录成功）
- ✅ 响应时间：< 500ms
- ✅ Token有效期：7天（604800秒）
- ✅ 数据格式：符合Zod Schema

### 请求Schema（Zod）
```typescript
const LoginRequestSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, "手机号格式错误"),
  code: z.string().length(4, "验证码必须是4位")
});
```

### 请求示例
```json
{
  "phone": "13800138001",
  "code": "1234"
}
```

### 响应Schema（Zod）

#### 200 OK（成功）
```typescript
const LoginResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    token: z.string(),
    expiresIn: z.number()
  })
});
```

#### 200 Response示例
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800
  }
}
```

#### 401 Unauthorized（验证码错误）
```typescript
const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string()
  })
});
```

#### 401 Response示例
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CODE",
    "message": "验证码错误，请重新输入"
  }
}
```

### 错误处理
| HTTP状态码 | 错误码 | message | 处理建议 |
|-----------|--------|---------|---------|
| 400 | INVALID_PHONE | "手机号格式错误" | 提示用户检查手机号 |
| 400 | INVALID_CODE | "验证码错误" | 提示用户重新输入 |
| 401 | INVALID_CODE | "验证码错误" | 提示用户重新输入 |
| 500 | INTERNAL_ERROR | "服务器内部错误" | 提示用户稍后重试 |
```

### 实际示例：运动拼团APP

```markdown
# API契约定义（spec-api.md）

## 1. 认证相关API

### 1.1 POST /api/auth/login - 用户登录

**RESTful规范**：POST（创建Session）
**成功标准**：
- 状态码：200 OK
- 响应时间：< 500ms
- Token有效期：7天

**请求Schema**：
```typescript
z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/),
  code: z.string().length(4)
})
```

**200 Response**：
```typescript
z.object({
  success: z.literal(true),
  data: z.object({
    token: z.string(),
    expiresIn: z.number()
  })
})
```

**401 Response**：
```typescript
z.object({
  success: z.literal(false),
  error: z.object({
    code: z.literal("INVALID_CODE"),
    message: z.string()
  })
})
```

### 1.2 POST /api/auth/refresh - 刷新Token

**RESTful规范**：POST（创建新Token）
**成功标准**：
- 状态码：200 OK
- 响应时间：< 300ms
- 新Token有效期：7天

**请求Schema**：
```typescript
z.object({
  token: z.string()
})
```

**200 Response**：
```typescript
z.object({
  success: z.literal(true),
  data: z.object({
    token: z.string(),
    expiresIn: z.number()
  })
})
```

### 1.3 POST /api/auth/logout - 登出

**RESTful规范**：POST（触发操作）
**成功标准**：
- 状态码：200 OK
- 响应时间：< 300ms

**请求Schema**：
```typescript
z.object({
  token: z.string()
})
```

**200 Response**：
```typescript
z.object({
  success: z.literal(true),
  data: z.object({
    message: z.string()
  })
})
```

## 2. 用户相关API

### 2.1 GET /api/user/profile - 获取用户信息

**RESTful规范**：GET（获取资源）
**成功标准**：
- 状态码：200 OK
- 响应时间：< 200ms

**请求Header**：
```
Authorization: Bearer {token}
```

**200 Response**：
```typescript
z.object({
  success: z.literal(true),
  data: z.object({
    id: z.number(),
    phone: z.string(),
    nickname: z.string().optional(),
    avatar: z.string().optional()
  })
})
```

**401 Response**：
```typescript
z.object({
  success: z.literal(false),
  error: z.object({
    code: z.literal("UNAUTHORIZED"),
    message: z.string()
  })
})
```

### 2.2 GET /api/user/activities - 获取用户活动列表

**RESTful规范**：GET（获取资源列表）
**成功标准**：
- 状态码：200 OK
- 响应时间：< 300ms

**请求Header**：
```
Authorization: Bearer {token}
```

**200 Response**：
```typescript
z.object({
  success: z.literal(true),
  data: z.object({
    activities: z.array(z.object({
      id: z.number(),
      type: z.string(),
      location: z.string(),
      startTime: z.string(),
      status: z.string()
    }))
  })
})
```

## 3. 活动相关API

### 3.1 POST /api/activities - 创建活动

**RESTful规范**：POST（创建资源）
**成功标准**：
- 状态码：201 Created
- 响应时间：< 500ms

**请求Header**：
```
Authorization: Bearer {token}
```

**请求Schema**：
```typescript
z.object({
  type: z.string(),
  location: z.string(),
  startTime: z.string(),
  maxParticipants: z.number()
})
```

**201 Response**：
```typescript
z.object({
  success: z.literal(true),
  data: z.object({
    id: z.number(),
    type: z.string(),
    location: z.string(),
    startTime: z.string(),
    status: z.string()
  })
})
```
```

---

## 验收检查清单

### 完整性检查

- [ ] 所有API端点已定义
- [ ] 每个端点包含RESTful规范说明
- [ ] 每个端点包含成功标准
- [ ] 每个端点包含请求Schema（Zod）
- [ ] 每个端点包含响应Schema（Zod）
- [ ] 每个端点包含错误处理说明

### RESTful规范检查

- [ ] HTTP方法正确使用（GET/POST/DELETE/PATCH）
- [ ] 路径命名符合规范（小写、连字符、复数）
- [ ] 路径层级清晰（不超过3层）
- [ ] 请求/响应格式统一（JSON）

### 成功标准检查

- [ ] 状态码明确定义（200/400/401/404/500）
- [ ] 响应时间要求明确（< 500ms等）
- [ ] 数据格式要求明确（符合Zod Schema）
- [ ] 业务逻辑预期明确

### Zod Schema检查

- [ ] 请求Schema完整（字段名、类型、验证规则）
- [ ] 响应Schema完整（成功响应、错误响应）
- [ ] Schema可运行（Zod语法正确）
- [ ] Schema可生成TypeScript类型

### 错误处理检查

- [ ] 错误码定义完整
- [ ] 错误响应格式统一
- [ ] 错误信息用户友好
- [ ] HTTP状态码与错误码映射正确

### 与plan.md一致性检查

- [ ] 所有API端点与plan.md用户故事对应
- [ ] API功能与plan.md需求一致
- [ ] 无多余的API端点
- [ ] 无缺失的API端点

---

## 附录

### A. Zod文档

- [Zod官方网站](https://zod.dev/)
- [Zod GitHub](https://github.com/colinhacks/zod)

### B. RESTful API设计指南

- [RESTful API设计最佳实践](https://restfulapi.net/)
- [HTTP状态码完整列表](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

### C. 工作流位置

**阶段**：阶段3: Tasks（任务拆解）
**执行者**：architecture-planning-expert
**触发条件**：Clarify阶段完成
**输出文件**：`communication/spec-api.md`

### D. 相关文档

- [plan.md](.az/plan-xxx/plan.md)：需求定义
- [tasks.md](.az/plan-xxx/tasks.md)：任务拆解
- [open-api.json](communication/open-api.json)：OpenAPI标准化
- [SKILL.md](../SKILL.md)：工作流管理主文档

---

**文档版本**: v1.0
**最后更新**: 2025-12-31
**维护者**: architecture-planning-expert
