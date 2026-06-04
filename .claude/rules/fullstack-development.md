# 全链路开发规则

**强制级别**: CRITICAL
**适用范围**: 生产级项目所有功能开发

---

## 核心原则

生产级项目必须完成 **前端 → API → 数据库** 三层完整实现，不能只写UI不实现数据存储。

---

## 与POC区分

| 维度 | POC（非本项目） | 生产级（本项目） |
|------|----------------|-----------------|
| 数据存储 | JSON模拟 | Prisma + MongoDB |
| API实现 | 可简化 | 完整API + Zod验证 |
| 验证逻辑 | 仅前端 | 前端 + 后端双重验证 |
| 功能完整 | 核心验证 | 完整CRUD闭环 |

---

## 三层开发顺序（强制）

**顺序**: 数据库层 → API层 → 前端层（不可颠倒）

| 层级 | 负责Agent | 核心任务 | 验证标准 |
|------|-----------|----------|----------|
| 数据库层 | backend-expert | Schema定义 + DataManager实现 | CRUD操作可执行 |
| API层 | backend-expert | API Route + Zod Schema + JSDoc | Swagger文档 + curl测试 |
| 前端层 | frontend-expert | 页面组件 + API集成 + 状态管理 | 用户CRUD操作可用 |

---

## 检查清单

**数据库层**: [ ] Schema定义 [ ] DataManager实现 [ ] CRUD可执行
**API层**: [ ] Route创建 [ ] Zod定义 [ ] JSDoc注释 [ ] Swagger生成
**前端层**: [ ] 页面创建 [ ] API集成 [ ] CRUD界面 [ ] 状态管理
**端到端**: [ ] 创建流程 [ ] 查看流程 [ ] 编辑流程 [ ] 删除流程 [ ] 构建成功

---

## 禁止行为

- ❌ 只写UI不集成API
- ❌ 只写API不实现数据库
- ❌ 只定义Schema不创建API
- ❌ 存在阻塞构建的类型错误
- ❌ 跳过端到端验证

---

## Agent协作顺序

```
architecture-planning-expert（任务拆解）
    ↓
backend-expert（数据库层 + API层）
    ↓
frontend-expert（前端层）
    ↓
qa-expert（端到端验证）
```

---

**相关文档**: [API开发规范](../docs/api-development-standards.md) | [数据库配置](../docs/DATABASE_TABLE_PREFIX_MIGRATION.md)