# 数据库设计规范

**强制级别**: CRITICAL

---

## 核心规则

数据库表名、字段名、索引名**必须使用 snake_case**（下划线分隔）。

在 Prisma Schema 中，TypeScript/Prisma Client 暴露的字段可以保持 camelCase，但必须用 `@map("snake_case")` 或 `@@map("snake_case")` 显式映射到底层数据库命名。

| 对象   | ✅ 正确           | ❌ 错误         |
| ------ | ----------------- | --------------- |
| 表名   | `asset_packages`  | `assetPackages` |
| 字段名 | `created_at`      | `createdAt`     |
| 索引名 | `idx_source_bank` | `idxSourceBank` |

**例外**: MongoDB 内置 `_id` 保持不变。

---

## Agent职责

| Agent                        | 职责                           |
| ---------------------------- | ------------------------------ |
| backend-expert               | Schema设计时强制使用snake_case |
| architecture-planning-expert | 规划时明确命名要求             |

---

## Prisma 命名要求

- 新增 model 必须使用 `@@map("snake_case_table")` 映射真实集合/表名
- 新增字段如使用 camelCase，必须使用 `@map("snake_case_field")` 映射真实字段名
- 新增索引名必须使用 snake_case
- 业务代码优先使用 Prisma Client 的类型安全字段名，不直接拼接数据库字段名

## 现有字段兼容

- 现有表字段**不改名**，避免数据迁移风险
- **新增**表和字段必须遵守 snake_case
