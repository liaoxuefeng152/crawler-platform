# 数据库表名前缀迁移 - 第一步完成报告

> ⚠️ **重要说明**：本文档记录的是首次迁移时的状态，示例中使用的 `az-ai-template` 是当时的项目名。
> **当前项目的前缀由项目目录名决定**，运行 `node scripts/sync-project-prefix.js` 获取实际前缀。

## 📅 执行时间
2026-02-27 09:23:14 UTC

## ✅ 完成内容

### 1. 环境变量配置
**文件**: `.env.local`

添加了项目表名前缀配置：
```env
# 项目表名前缀（由 az-init 自动配置，等于项目目录名）
PROJECT_TABLE_PREFIX="<项目名>"
```

### 2. Schema 模板系统
**创建文件**: `prisma/schema.template.prisma`

- 将原有的 `schema.prisma` 转换为模板文件
- 添加了详细的使用说明和示例
- 未来添加新表时，只需在模板中定义模型

**生成文件**: `prisma/schema.prisma`

- 自动生成的实际 schema 文件
- 所有表名自动添加前缀 `{PROJECT_TABLE_PREFIX}-`
- 包含生成时间戳和项目前缀信息

### 3. 自动化脚本

#### `scripts/generate-schema.js`
- 从 `.env.local` 读取 `PROJECT_TABLE_PREFIX`
- 自动为所有 `@@map` 指令添加项目前缀
- 跳过注释中的示例代码
- 生成带前缀的 `schema.prisma`

#### `scripts/migrate-table-prefix.js`
- 自动检测数据库中的集合
- 对比 schema 中的表名
- 使用 MongoDB admin 数据库执行 `renameCollection`
- 生成详细的迁移日志

### 4. NPM 命令
**更新文件**: `package.json`

添加了新的 npm 命令：
```json
{
  "generate:schema": "node scripts/generate-schema.js && prisma generate",
  "db:migrate:prefix": "node scripts/migrate-table-prefix.js"
}
```

修改了构建命令：
```json
{
  "build": "node scripts/generate-schema.js && prisma generate && next build --turbo"
}
```

### 5. 数据库迁移结果
**迁移日志**: `prisma/migration-log.json`

成功迁移的表（首次迁移时项目名为 `az-ai-template`）：
- `login_users` → `{PROJECT_TABLE_PREFIX}-login_users` ✅
- `users` → `{PROJECT_TABLE_PREFIX}-users` ✅

## 📊 数据库验证

### 当前表名
- ✅ `{PROJECT_TABLE_PREFIX}-login_users`
- ✅ `{PROJECT_TABLE_PREFIX}-users`

> 运行 `cat .env.local | grep PROJECT_TABLE_PREFIX` 查看当前前缀

### 数据库连接
- **类型**: MongoDB
- **主机**: mongo-service.gms:27017
- **数据库**: wangzhenke
- **状态**: 连接正常

## 🎯 未来新表开发流程

### 开发新功能时：

1. **编辑模板文件**：`prisma/schema.template.prisma`
   ```prisma
   model NewModel {
     id        String   @id @default(auto()) @map("_id") @db.ObjectId
     name      String
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt

     @@map("new_models")  // 会自动生成为：{PROJECT_TABLE_PREFIX}-new_models
   }
   ```

2. **生成 Schema**：
   ```bash
   npm run generate:schema
   ```

3. **更新数据库**：
   ```bash
   npx prisma db push
   ```

### 注意事项：
- ✅ 所有新表都会自动添加前缀
- ✅ 前缀由项目目录名决定（运行 `node scripts/sync-project-prefix.js` 自动配置）
- ✅ 不同项目使用不同的前缀即可实现数据隔离
- ⚠️ 不要直接修改 `prisma/schema.prisma`（会被自动生成覆盖）

## 🔄 下一步计划（第二步）

### 需要更新的文件：

1. **`.claude/rules/patterns.md`**
   - 添加表名前缀强制规则
   - 说明新表开发流程

2. **`.claude/docs/development/module-development-template.md`**
   - 更新数据库模型开发指南
   - 添加 schema 模板使用说明

3. **Agent 配置文件**：
   - `backend-expert.md` - 后端开发时强制使用前缀
   - `architecture-planning-expert.md` - 架构设计时考虑多项目数据隔离

4. **开发文档**：
   - 创建 `DATABASE_TABLE_PREFIX_GUIDE.md`
   - 更新 `CLAUDE.md` 相关章节

## 🧪 用户验证步骤

请按照以下步骤验证数据库表名是否正确：

### 0. 获取当前项目前缀
```bash
cat .env.local | grep PROJECT_TABLE_PREFIX
```

### 1. 连接数据库
```bash
# 使用 MongoDB Compass 或命令行连接
mongosh mongodb://mongo-service.gms:27017/wangzhenke
```

### 2. 查看所有集合
```javascript
show collections
```

**预期结果**（假设前缀为 `<项目名>`）：
```
<项目名>-login_users
<项目名>-users
```

### 3. 检查数据完整性
```javascript
// 替换 <项目名> 为实际前缀
db["<项目名>-login_users"].find().count()
db["<项目名>-users"].find().count()
```

### 4. 测试应用功能
```bash
# 启动开发服务器
npm run dev

# 测试登录功能
# 访问 http://localhost:3000/login
# 使用现有账号登录，验证数据查询正常
```

## ✅ 确认清单

- [x] 环境变量配置正确
- [x] Schema 模板系统创建完成
- [x] 自动化脚本可用
- [x] NPM 命令添加完成
- [x] 数据库表名迁移成功
- [x] 数据库连接正常
- [ ] **用户验证数据库表名正确**
- [ ] **用户验证应用功能正常**

---

**状态**: 第一步完成，等待用户验证

**下一步**: 用户确认后，执行第二步（更新 Claude 规则和 Agent 配置）
