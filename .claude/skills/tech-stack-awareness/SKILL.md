---
name: tech-stack-awareness
description: 项目类型自动检测与技术栈适配
---

## 项目类型检测

**检测逻辑**:
```bash
# Next.js项目
[ -f "package.json" ] && grep "\"next\"" package.json → Next.js项目

# Python项目
[ -f "pyproject.toml" ] && grep "fastapi" pyproject.toml → Python项目

# Agent编排项目
[ -f "backend/src/core/base_executor.py" ] → Agent编排项目
```

## 技术栈适配

| 项目类型 | 数据层 | 验证层 | API层 | 完成标准 |
|---------|--------|--------|-------|----------|
| **Next.js** | Prisma+MongoDB | Zod Schema | API Routes | npm run build |
| **Python** | Motor+MongoDB | Pydantic | FastAPI | make test + make lint |
| **Agent** | TenantAwareRepository | Pydantic+基类 | Agent接口 | ≥3 Golden Case |

## Agent能力切换

| Agent | Next.js能力 | Python能力 | Agent编排能力 |
|-------|------------|-----------|-------------|
| **backend-expert** | Prisma+Zod+API Routes | Motor+Pydantic+FastAPI | BaseExecutor+Golden Case |
| **frontend-expert** | React+Next.js+shadcn/ui | Jinja2+HTMX | Agent UI |
| **architecture-expert** | DashboardLayout+spec-api.md | 模块化架构 | 三角色架构 |

## 版本信息

| 技术 | 版本 |
|------|------|
| Next.js | 16.0.10 |
| React | 19.2.1 |
| Prisma | 5.22.0 |
| TypeScript | 5.x |
| MongoDB | 7.1.0 |
| shadcn/ui | 3.6.1 |