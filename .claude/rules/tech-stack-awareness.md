# 技术栈感知规则

**强制级别**: CRITICAL

---

## 🔍 项目类型检测逻辑

**检测时机**: Agent启动时自动执行

**检测方法**（按优先级顺序）:

```bash
# 1. Next.js项目检测
[ -f "package.json" ] && grep "\"next\"" package.json → **Next.js项目**

# 2. Python项目检测
[ -f "pyproject.toml" ] && grep "fastapi" pyproject.toml → **Python项目**

# 3. Agent编排项目检测
[ -f "backend/src/core/base_executor.py" ] → **Agent编排项目**
```

---

## 📊 技术栈核心映射表

| 维度 | Next.js项目 | Python项目 |
|------|------------|-----------|
| **数据层** | Prisma ORM（schema.template.prisma） | Motor + MongoDB（异步原生） |
| **验证层** | Zod Schema（前后端共享） | Pydantic BaseModel |
| **API层** | Next.js API Routes（route.ts） | FastAPI Routes（@router装饰器） |
| **测试命令** | `npm run build` | `make test` + `make lint` |
| **类型检查** | TypeScript（tsc） | mypy |
| **文档生成** | OpenAPI（next-swagger-doc） | FastAPI自动文档（/docs） |

---

## 🔄 Agent能力切换规则

### backend-expert 能力映射

| 项目类型 | 数据存储 | 数据验证 | API实现 | 完成标准 |
|---------|---------|---------|---------|---------|
| **Next.js** | Prisma Schema模板 | Zod Schema定义 | route.ts文件 | npm run build成功 |
| **Python** | Motor异步Repository | Pydantic BaseModel | @router装饰器 | make test + make lint通过 |
| **Agent编排** | TenantAwareRepository | Pydantic + 基类继承 | Agent接口 | ≥3 Golden Case + make test通过 |

### architecture-planning-expert 能力映射

| 项目类型 | 架构模式 | 开发顺序 | 契约定义 | 验收标准 |
|---------|---------|---------|---------|---------|
| **Next.js** | 页面级架构 + DashboardLayout | 后端→OpenAPI→前端 | spec-api.md（RESTful） | 三层完整 + build成功 |
| **Python** | 模块化架构 + API分层 | Service→API→测试 | Pydantic模型共享 | make test通过 |
| **Agent编排** | 三角色架构（Executor/Evaluator/Secretary） | Agent→Golden Case→集成 | 基类接口继承 | ≥3 Golden Case通过 |

---

## 📋 Next.js项目技术栈版本

**版本更新机制**：距离上次更新超过30天，Agent必须读取 `package.json` 更新版本。

| 技术 | 版本 |
|------|------|
| Next.js | **16.0.10** |
| React | **19.2.1** |
| Prisma | **5.22.0** |
| TypeScript | **5.x** |
| MongoDB | **7.1.0** |
| shadcn/ui | **3.6.1** |

**last_updated**: 2026-04-24

---

## 📋 Python项目技术栈版本

| 技术 | 版本 |
|------|------|
| Python | **3.11+** |
| FastAPI | **>=0.109.0** |
| Motor | **>=3.3.0** |
| Pydantic | **>=2.0** |
| MongoDB | **7.0+** |

---

## 🚨 强制要求

**所有技术方案必须基于检测到的技术栈版本**：
- ❌ 禁止假设版本（如假设 Next.js 15）
- ❌ 禁止使用不兼容 API
- ✅ 有疑问时 WebSearch 验证兼容性

---

## 🔧 MCP工具映射

| 项目类型 | 推荐MCP工具 |
|---------|------------|
| **Next.js** | next-devtools（分析项目配置） |
| **Python** | 无特定MCP，使用Read/Bash工具分析 |

---

> 💡 详细指南：参见 `skills/tech-stack-awareness/SKILL.md`