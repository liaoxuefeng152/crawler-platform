---
name: generate-openapi-doc
description: OpenAPI文档生成工作流，扫描API路由、验证JSDoc、生成openapi.json和Swagger UI
---

# OpenAPI 文档生成 Skill

自动扫描 API 路由、验证 JSDoc 注释一致性、生成准确的 OpenAPI 文档的工作流。

## 🎯 Skill 功能

本 Skill 提供**完整的 OpenAPI 文档生成工作流**：

```
扫描 API 路由
    ↓
验证 JSDoc 注释
    ↓
自动修复不一致
    ↓
生成 openapi.json
    ↓
验证 Swagger UI
    ↓
生成文档报告
```

## 🚀 使用方法

```
/require 请生成 OpenAPI 文档
```

**功能**：

1. **自动扫描**：扫描所有 `app/api/**/route.ts` 文件
2. **验证一致性**：检查 JSDoc 注释与代码实现是否一致
3. **自动修复**：修复 JSDoc 注释中的不一致
4. **生成文档**：生成 `public/openapi.json` 文件
5. **验证可用**：验证 Swagger UI 可访问

## 📋 工作流程详解

### 阶段1: 扫描 API 路由

- **执行者**: backend-expert
- **输入**: API 路由目录
- **输出**: API 文件列表
- **时长**: ~1分钟

**工作内容**：

- 使用 Glob 扫描 `app/api/**/route.ts`
- 列出所有找到的 API 文件
- 提取每个文件的 HTTP 方法（GET, POST, PUT, DELETE）

### 阶段2: 验证 JSDoc 注释

- **执行者**: backend-expert
- **输入**: API 文件列表
- **输出**: JSDoc 验证报告
- **时长**: ~3-5分钟

**工作内容**：

- 检查每个 API 方法是否有 `@swagger` 注释
- 验证 JSDoc 参数与代码实现的一致性
- 验证响应状态码定义
- 记录缺少或不一致的 JSDoc

### 阶段3: 自动修复不一致

- **执行者**: backend-expert
- **输入**: JSDoc 验证报告
- **输出**: 修复后的 API 文件
- **时长**: ~5-10分钟

**工作内容**：

- 自动修复参数类型不匹配
- 自动补充缺失的参数定义
- 自动更新响应状态码
- **只修改 JSDoc 注释，不修改业务逻辑**

### 阶段4: 生成 OpenAPI 文档

- **执行者**: backend-expert
- **输入**: 修复后的 API 文件
- **输出**: `public/openapi.json`
- **时长**: ~1分钟

**工作内容**：

- 运行 `npm run openapi:generate -- --output=public/openapi.json`
- 检查生成是否成功
- 验证生成的 JSON 格式

### 阶段5: 验证 Swagger UI

- **执行者**: qa-expert
- **输入**: `public/openapi.json`
- **输出**: 验证报告
- **时长**: ~2分钟

**工作内容**：

- 访问 `http://localhost:3000/api-docs`
- 验证所有 API 都在文档中
- 测试 Swagger UI 的交互功能
- 生成最终报告

## ⚠️ 重要约束

### 必须遵守

- ✅ **只修改 JSDoc 注释**，不修改业务逻辑代码
- ✅ **基于实际代码**生成注释，不凭空创造
- ✅ **参考标准**：`/app/api/users/route.ts` 作为注释格式参考
- ✅ **保持格式一致**：与现有 API 的注释风格一致

### 严格禁止

- ❌ 不要修改 Zod Schema
- ❌ 不要修改函数实现
- ❌ 不要创建不存在的 API
- ❌ 不要删除代码中的功能
- ❌ 不要"猜测"或"推断"，基于实际代码

## 📋 输出报告格式

完成所有步骤后，生成包含以下内容的报告：

```
📊 OpenAPI 文档生成报告

✅ 扫描到的 API 文件: N 个
  - app/api/users/route.ts
  - app/api/auth/login/route.ts
  - app/api/products/route.ts
  ...

⚠️ 缺少 JSDoc 注释: N 个
  - GET /api/auth/login
  - POST /api/products

❌ JSDoc 与代码不一致: N 个
  - GET /api/users:
    - 参数 page 类型不匹配
    - 缺少响应 401

🔧 已自动修复: N 个
  - ✅ 修复了 GET /api/users 的参数类型
  - ✅ 补充了 POST /api/products 的 required 字段

📄 生成结果:
  - 文件位置: /home/gms/work-space/az-ai-pc/public/openapi.json
  - 路由数量: N
  - 标签数量: N

🎯 Swagger UI 访问:
  - http://localhost:3000/api-docs

✅ 验证状态:
  - 所有 API 已在文档中
  - Swagger UI 可正常访问
  - 文档格式符合 OpenAPI 3.1 规范
```

## 🎓 参考标准

**注释格式参考**: `/app/api/users/route.ts`

**关键特征**：

- 完整的 `@swagger` 注释块
- 清晰的 summary 和 description
- 正确的 tags 分组
- 详细的 parameters/requestBody 定义
- 完整的 responses 定义（200, 201, 400, 500等）
- 使用 example 提供示例值

## 🔍 问题排查

### 如果发现缺少 JSDoc

**不要自行创建**，而是：

1. 报告缺少 JSDoc 的 API
2. 建议参考 `/app/api/users/route.ts` 的格式
3. 等待用户确认后再添加

### 如果无法确定一致性

**不要猜测**，而是：

1. 在报告中明确标注"无法确定"
2. 列出具体的疑问点
3. 提供代码和注释的对比
4. 等待用户确认

### 如果生成失败

**不要继续尝试**，而是：

1. 报告生成失败的错误信息
2. 列出可能的原因
3. 建议修复方案
4. 等待用户指示

## 📚 工具使用

### Glob 工具

扫描 API 路由文件：

```javascript
glob('app/api/**/route.ts');
```

### Read 工具

读取 API 文件内容：

```javascript
read('/home/gms/work-space/az-ai-pc/app/api/users/route.ts');
```

### Write 工具

修复 JSDoc 注释：

```javascript
write('/home/gms/work-space/az-ai-pc/app/api/users/route.ts', updatedContent);
```

### Bash 工具

生成 OpenAPI 文档：

```bash
npm run openapi:generate -- --output=public/openapi.json
```

## 💪 执行原则

1. **精确性优先**：确保 JSDoc 与代码完全一致
2. **保守修复**：只修复确定的不一致，不确定的询问用户
3. **清晰报告**：详细列出所有问题和修复
4. **参考标准**：始终参考 users API 的格式

---

**记住**：你的目标是生成准确的 OpenAPI 文档，而不是创造新的功能。基于实际代码，保持注释与代码一致。
