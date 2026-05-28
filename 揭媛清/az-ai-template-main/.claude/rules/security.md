> 💡 **设计理念**：交互式问答确保用户始终保持对项目的控制权，AI 作为智能助手而非自主代理，所有关键决策都需要人类的战略指导。

---

## 🔐 第三方API集成安全规范（🔥 强制执行）

### 核心原则

**❌ 严格禁止**：前端直接调用第三方API（密钥泄露风险）
**✅ 强制要求**：后端代理模式（环境变量存储密钥）

### 1. fullstack-requirement-expert 职责

**触发条件**：用户需求包含第三方API/外部服务/API Key/Token等关键词

**强制动作**：

- 在plan.md标记：`🚨 第三方API集成识别`
- 使用AskUserQuestion澄清认证方式（API Key/OAuth/JWT）
- 记录安全方案到plan.md：后端代理模式（强制）
- 在active-bridge.md触发移交：架构专家

### 2. architecture-planning-expert 职责

**触发条件**：Plan阶段标记了第三方API集成

**强制动作**：

- 在spec-api.md定义代理API契约（`POST /api/xxx/proxy`）
- 在tasks.md创建P0任务：backend-expert实现代理API
- 在tasks.md明确标注：前端开发禁止直接调用第三方API
- 依赖关系：后端代理API → Swagger测试 → 前端开发（串行）

### 3. backend-expert 职责

**强制标准**：

- 环境变量配置：`.env.local`存储密钥，`.env.example`提供模板
- API代理实现：读取环境变量，转发请求，转换响应
- 错误处理：429限流、503不可用、500配置错误、400验证失败
- 文档要求：README.md说明环境变量配置

**安全检查**：

```bash
# 禁止：硬编码密钥
! grep -r "api.*key.*=.*['\"][^'\"]*['\"]" app/api/

# 确保：使用环境变量
grep "process\\.env\\." app/api/
```

### 4. security-reviewer 职责

**强制检查**：

- 密钥存储检查：无硬编码密钥
- 环境变量检查：`.env.local`在`.gitignore`中
- 前端代码检查：无直接调用第三方API
- 代理API检查：后端API Route存在且正确使用环境变量

### 5. 违反后果

- ❌ security-reviewer标记P0安全问题
- ❌ 触发返工流程：Dev → Test → Verification → QA → Security Review
- ❌ 阻止项目交付
