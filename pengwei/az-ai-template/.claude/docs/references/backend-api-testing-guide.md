# 后端API测试指南（Swagger UI）

> **测试方法**: Swagger UI手动测试（不编写测试代码）
> **测试环境**: http://localhost:3000/api-docs
> **测试依据**: spec-api.md契约文档

---

## 🚨 核心原则：禁止创建测试文件

**错误示例**（运动拼团APP的教训）：
```typescript
// ❌ 错误：后端禁止创建测试文件
// app/api/sports/route.test.ts
describe('API Routes - Sports Auth', () => {
  it('should send verification code', async () => {
    expect(true).toBe(true);  // 假测试
  });
});
```

**正确做法**：
```bash
# ✅ 正确：使用Swagger UI手动测试
# 1. 访问Swagger UI
open http://localhost:3000/api-docs

# 2. 对照spec-api.md验证API端点
# 3. 使用"Try it out"功能测试
# 4. 记录测试结果到swagger-test-report.md
```

---

## 📋 6步Swagger测试法

### Step 1: 访问Swagger UI
```bash
# 确保开发服务器运行
npm run dev

# 访问Swagger UI
open http://localhost:3000/api-docs
```

### Step 2: 逐个验证API端点
对照spec-api.md验证：
- ✅ 端点路径正确
- ✅ 请求参数与契约一致
- ✅ 响应格式与契约一致
- ✅ 错误码与契约一致

### Step 3: Try it out功能测试
- ✅ 正常流程测试
- ✅ 边界值测试
- ✅ 异常情况测试
- ✅ 参数验证测试

### Step 4: 验证响应格式
- ✅ 状态码正确（200、400、401、404、500）
- ✅ 响应数据结构符合spec-api.md
- ✅ 错误信息清晰

### Step 5: 认证测试（如需要）
```bash
# 1. 获取JWT token
POST /api/auth/verify-code
{
  "phone": "13800138000",
  "code": "123456"
}
# 复制返回的token

# 2. 使用token访问受保护端点
GET /api/users/me
Headers: Authorization: Bearer <token>
```

### Step 6: 记录测试结果
生成swagger-test-report.md，包含：
- API端点列表
- 测试结果（通过/失败）
- 发现的问题
- 截图证据

---

## ✅ 测试通过标准

**必须满足**：
- ✅ 所有API端点测试通过
- ✅ 返回正确的状态码（200/201/400/401/404/500）
- ✅ 响应格式符合spec-api.md
- ✅ 测试通过率=100%

**禁止跳过测试**：
- ❌ "时间限制"不是理由
- ❌ "后续手动验证"不是理由
- ❌ "POC项目可以简化"不是理由

---

## 📚 参考文档

- **测试策略**: [testing-strategy.md](../../.claude/skills/workflow-manager/references/testing-strategy.md)
- **测试专家**: [test-expert.md](../../.claude/agents/test-expert.md)
- **API标准**: [spec-api-standard.md](.claude/docs/spec-api-standard.md)
