# 工具选型验证规则

**强制级别**: CRITICAL
**适用范围**: 选择新工具/依赖/技术方案时

---

## 核心原则

选择任何新工具或依赖时，必须先用 WebSearch 搜索验证最佳方案和版本兼容性，不能仅凭经验或直接安装。

---

## 强制流程

1. **搜索验证** → WebSearch 搜索最新兼容性和最佳实践
2. **确认版本** → 查阅官方文档确认推荐版本
3. **兼容检查** → 验证与 Next.js 16 + React 19 + Prisma 兼容
4. **记录决策** → 在 `.az/plan.md` 记录选型依据
5. **验证构建** → `npm run build` 必须成功

---

## 搜索关键词格式

- `{依赖名} Next.js 16 React 19 compatibility 2026`
- `{依赖名} production ready guide`
- `{依赖名} vs {替代方案} comparison`

---

## 决策记录要求

在 `.az/plan.md` 记录：搜索关键词、推荐版本、兼容性结果、最终选择及依据。

---

## 检查清单

**选型前**: [ ] WebSearch搜索 [ ] 官方文档确认 [ ] 兼容性检查 [ ] 记录决策
**安装后**: [ ] 安装验证 [ ] 构建成功 [ ] 类型检查通过

---

## 禁止行为

- ❌ 不搜索直接安装最新版本
- ❌ 不验证与现有技术栈兼容性
- ❌ 不记录选型决策依据
- ❌ 超过3次盲目试错

---

## Agent职责

| Agent | 职责 |
|-------|------|
| frontend-expert | 前端依赖选型，验证React 19兼容 |
| backend-expert | 后端依赖选型，验证Prisma兼容 |
| architecture-planning-expert | 技术方案制定，记录选型依据 |

---

**相关文档**: [依赖管理指南](../docs/development/dependency-management.md)