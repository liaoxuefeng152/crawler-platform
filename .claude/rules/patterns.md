# 常见模式

## 🏷️ 项目名称配置规范

**项目名称分两种**：

1. **项目目录名**：用于 package.json name 和数据库表名前缀
2. **项目显示名称**：用于页面标题、登录页、导航栏等用户可见位置

### 配置架构

```
project.config.json          # Git 仓库（公开配置）
├── projectName              ✅ "深瞳AI Coding"
└── projectDir               ✅ "az-ai-template"

.env                         # .gitignore（本地敏感配置）
├── DATABASE_URL             ⚠️ 本地开发
└── PROJECT_TABLE_PREFIX     ⚠️ 表名前缀

GitLab CI/CD Variables       # CI/CD 环境（线上敏感配置）
└── DATABASE_URL             ✅ 生产环境
```

### 配置位置

| 配置项                     | 位置                  | 用途                           |
| -------------------------- | --------------------- | ------------------------------ |
| `projectName`              | `project.config.json` | 项目显示名称（主配置）         |
| `projectDir`               | `project.config.json` | 项目目录名（主配置）           |
| `PROJECT_TABLE_PREFIX`     | `.env`                | 数据库表名前缀                 |
| `NEXT_PUBLIC_PROJECT_NAME` | `.env`                | 页面显示的项目名称（本地开发） |
| `DATABASE_URL`             | CI/CD Variables       | 线上数据库连接                 |

### ⚠️ AI 修改项目名称时必须遵守

**当用户要求修改项目名称时，AI 必须修改以下文件**：

| 序号 | 文件                  | 配置项                     | 说明                       |
| ---- | --------------------- | -------------------------- | -------------------------- |
| 1    | `project.config.json` | `projectName`              | **主配置文件**（必须修改） |
| 2    | `.env`                | `NEXT_PUBLIC_PROJECT_NAME` | 本地开发配置（会自动同步） |
| 3    | `docker/Dockerfile`   | `PROJECT_TABLE_PREFIX`     | 构建时硬编码，需同步修改   |

### 修改项目名称的正确方式

**推荐**：运行 az-init 脚本自动配置

```bash
node .claude/skills/az-init/scripts/sync-project-prefix.js
```

**手动修改**：需要修改 `project.config.json` 中的 `projectName` 字段

### 安全性说明

| 配置项         | 安全等级   | 能否上传Git | 存储位置              |
| -------------- | ---------- | ----------- | --------------------- |
| 项目名称       | 公开       | ✅ 可以     | `project.config.json` |
| 项目目录名     | 公开       | ✅ 可以     | `project.config.json` |
| 数据库连接地址 | **中敏感** | **禁止**    | CI 变量 / `.env`      |
| 飞书 AppSecret | **高敏感** | **禁止**    | CI 变量 / `.env`      |

## 📁 环境变量文件规范

### 核心原则

**本项目统一使用 `.env` 作为环境变量配置文件，禁止使用 `.env.local`。**

### ⚠️ `.env.local` 自动迁移规则（强制执行）

当 AI 检测到项目中存在 `.env.local` 文件时，**必须**执行以下迁移流程：

**步骤1：检测与通知**

```bash
# 检测命令
ls -la .env.local 2>/dev/null && echo "发现.env.local文件，需要迁移"
```

**步骤2：自动迁移**

```bash
# 迁移命令（保留.env原有内容，追加.env.local的新内容）
if [ -f ".env.local" ]; then
  # 合并内容（跳过重复项）
  while IFS= read -r line; do
    key=$(echo "$line" | cut -d'=' -f1)
    if [ -n "$key" ] && ! grep -q "^${key}=" .env 2>/dev/null; then
      echo "$line" >> .env
    fi
  done < .env.local
  # 清空.env.local（保留文件但清空内容，避免git追踪问题）
  > .env.local
  echo "迁移完成：.env.local内容已合并到.env"
fi
```

**步骤3：验证与清理**

- ✅ 确认 `.env` 包含所有必要的环境变量
- ✅ 确认 `.env.local` 内容已清空（文件保留但无内容）
- ✅ 确认 `.env` 在 `.gitignore` 中（敏感信息不提交）
- ⚠️ 通知用户确认迁移结果

### 迁移示例

**迁移前**：

```
.env                    → DATABASE_URL=mongodb://...
.env.local              → PROJECT_TABLE_PREFIX=xxx
                           NEXT_PUBLIC_PROJECT_NAME=xxx
```

**迁移后**：

```
.env                    → DATABASE_URL=mongodb://...
                           PROJECT_TABLE_PREFIX=xxx
                           NEXT_PUBLIC_PROJECT_NAME=xxx
.env.local              → (空文件)
```

### 禁止行为

- ❌ 检测到 `.env.local` 存在时不执行迁移
- ❌ 直接删除 `.env.local` 文件（应清空内容而非删除）
- ❌ 跳过重复项检查导致 `.env` 内容冲突
- ❌ 迁移后不通知用户确认

## 🕐 日期时间处理规范

项目采用统一的日期时间格式处理规范：

- **前端输入**: `datetime-local` 格式 (`2025-12-23T11:38`)
- **前端显示**: 中文本地化 (`2025年12月23日 11:38`)
- **后端存储**: ISO 8601 (`2025-12-23T11:38:00.000Z`)
- **API 传输**: ISO 8601

### 时区：统一使用 Asia/Shanghai（东八区）

- 服务器：`TZ=Asia/Shanghai`（已配置）
- 前端：`toLocaleString` 添加 `timeZone: 'Asia/Shanghai'`
- 工具库：优先使用 `lib/datetimeUtils.ts`

> 💡 详细规范：[日期时间处理指南](./.claude/docs/development/datetime-handling-guide.md)

## ⚡ 技术栈一致性

### 核心技术栈

- ✅ **前端组件**: 优先使用 shadcn/ui
- ✅ **状态管理**: 使用 Zustand
- ✅ **数据存储**: 使用 Prisma + MongoDB（生产级存储）
- ✅ **API 设计**: 使用 Next.js API Routes
- ✅ **类型安全**: 全链路 TypeScript + Zod
- ✅ **数据验证**: 前端 Zod + 后端 Zod Schema 双重验证

### 数据库配置

- **数据库**: MongoDB（使用 SHENTONG 环境变量）
- **ORM**: Prisma 7.x
- **连接字符串**: `SHENTONG_MIDDLEWARE_MONGO_URI`
- **数据访问层**: `lib/db/index.ts`

## 🗄️ 数据库连接配置（动态适配）

### 环境变量优先级

1. **SHENTONG_MIDDLEWARE_MONGO_URI**（系统环境变量，最高优先级）
2. **DATABASE_URL**（.env 文件，向后兼容）

### 配置策略

| 环境        | 配置来源                                     | 优先级 |
| ----------- | -------------------------------------------- | ------ |
| 本地开发    | `SHENTONG_MIDDLEWARE_MONGO_URI` 系统环境变量 | 最高   |
| Docker 构建 | `.env` 中的 `DATABASE_URL`                   | 默认   |
| K8s 部署    | Dockerfile 中的 `ENV DATABASE_URL`           | 生产   |

### 自动同步机制

**开发时**：

- 自动检测 `SHENTONG_MIDDLEWARE_MONGO_URI` 与 `.env` 中的 `DATABASE_URL`
- 如果不匹配，自动更新 `.env`
- 确保本地开发始终使用系统环境变量

**推送前确认（重要）**：

- ⚠️ 推送代码前，检查 `.env` 变更
- 确认 `DATABASE_URL` 是否为项目通用配置
- 如果是个人开发环境配置，考虑是否需要提交

### 多开发者协作指南

**首次使用项目**：

1. 确保系统环境变量 `SHENTONG_MIDDLEWARE_MONGO_URI` 已配置
2. 运行 `npm run dev`，配置会自动同步
3. 推送前确认 `.env` 变更

**推送代码前**：

1. 检查 `git status`，确认 `.env` 是否有变更
2. 如果 `DATABASE_URL` 是你的个人开发环境，评估是否需要提交
3. 线上部署将使用 `.env` 中的配置

### AI 自动化规则

当 AI 检测到数据库配置相关操作时：

1. 优先读取 `SHENTONG_MIDDLEWARE_MONGO_URI`
2. 开发时自动同步 `.env`
3. 推送前提醒开发者确认 `.env` 变更

### 配置检测命令

```bash
# 查看所有 SHENTONG 相关的系统环境变量
# 能查看的中间件配置包括：
# - MongoDB 数据库连接 (SHENTONG_MIDDLEWARE_MONGO_URI)
# - Redis 缓存连接 (SHENTONG_MIDDLEWARE_REDIS_URI, SHENTONG_MIDDLEWARE_REDIS_KEY_PREFIX)
# - PostgreSQL 数据库连接 (SHENTONG_MIDDLEWARE_POSTGRES_URI)
# - MinIO 对象存储配置 (SHENTONG_MIDDLEWARE_MINIO_*)
# - Kafka 消息队列配置 (SHENTONG_MIDDLEWARE_KAFKA_*)
env | grep SHENTONG

# 查看项目配置
cat .env | grep DATABASE_URL

# 检查变更
git diff .env
```

## 📦 MinIO 文件存储配置

### 核心原则

**本项目使用 MinIO 作为文件存储服务，支持文件上传、下载、删除等操作。**

### 环境变量配置

通过 `env | grep SHENTONG` 查看以下 MinIO 相关配置：

| 环境变量                                      | 说明           |
| --------------------------------------------- | -------------- |
| `SHENTONG_MIDDLEWARE_MINIO_ENDPOINT`          | 公网访问地址   |
| `SHENTONG_MIDDLEWARE_MINIO_LOCAL_ENDPOINT`    | 集群内访问地址 |
| `SHENTONG_MIDDLEWARE_MINIO_ACCESS_KEY_ID`     | 访问密钥       |
| `SHENTONG_MIDDLEWARE_MINIO_SECRET_ACCESS_KEY` | 密钥           |
| `SHENTONG_MIDDLEWARE_MINIO_BUCKET_NAME`       | 存储桶名称     |

### 使用方式

**1. 命令行上传文件**

```bash
# 上传整个目录
npx tsx scripts/upload-to-minio.ts "./本地目录" "存储前缀"

# 示例：上传借款人测试数据
npx tsx scripts/upload-to-minio.ts "./个贷文档/借款人测试数据" "debtor-test-data"
```

**2. 代码中使用**

```typescript
import { minioService } from '@/lib/storage/minio-service';

// 上传单个文件
const result = await minioService.uploadFile(
  '/path/to/file.pdf',
  'documents/file.pdf'
);

// 上传整个目录
const results = await minioService.uploadDirectory(
  '/path/to/documents',
  'documents'
);

// 获取文件访问 URL
const url = minioService.getObjectUrl('documents/file.pdf');

// 获取预签名 URL（临时访问）
const presignedUrl = await minioService.getPresignedUrl(
  'documents/file.pdf',
  3600
);

// 下载文件
await minioService.downloadFile('documents/file.pdf', '/local/path/file.pdf');

// 删除文件
await minioService.deleteFile('documents/file.pdf');

// 列出文件
const files = await minioService.listFiles('documents/');
```

### 服务层代码位置

- **MinIO 服务**: `lib/storage/minio-service.ts`
- **上传脚本**: `scripts/upload-to-minio.ts`

## 🗂️ 数据库表名前缀系统（多项目数据隔离）

### 核心原则

**本项目采用表名前缀机制，实现多项目共用数据库时的数据隔离。**

### ⚠️ 获取当前项目前缀（必须）

**在开发前，务必先确认当前项目的前缀**：

```bash
# 方法1：运行自动配置脚本（推荐）
node .claude/skills/az-init/scripts/sync-project-prefix.js

# 方法2：查看环境变量
cat .env | grep PROJECT_TABLE_PREFIX
```

**前缀规则**：前缀 = 当前项目目录名（由 `az-init` 自动配置）

### 配置方式

**环境变量**：`.env`

```env
# 项目表名前缀（由 az-init 自动设置为项目名）
# ⚠️ 请勿手动修改，运行 node .claude/skills/az-init/scripts/sync-project-prefix.js 自动配置
PROJECT_TABLE_PREFIX="<项目名>"
```

**表名规则**：

- 模板中的 `@@map("table_name")` 自动生成为 `@@map("{PROJECT_TABLE_PREFIX}-table_name")`
- 例如：项目名为 `test1`，则 `@@map("users")` → `@@map("test1-users")`

### 开发流程（强制）

#### 添加新表的正确流程：

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

#### ⚠️ 重要注意事项：

- ✅ **必须编辑模板文件**：`prisma/schema.template.prisma`
- ❌ **禁止直接修改**：`prisma/schema.prisma`（会被自动覆盖）
- ✅ **自动防重复**：脚本会检测已有前缀，避免重复添加
- ✅ **构建时自动生成**：`npm run build` 会自动生成 schema

### 防重复机制

**脚本逻辑**：

```javascript
// 如果表名已经有前缀，不再重复添加
if (tableName.startsWith(`${prefix}-`)) {
  return match;
}
```

**示例**（假设前缀为 `<项目名>`）：

- `users` → `<项目名>-users` ✅ 首次添加
- `<项目名>-users` → `<项目名>-users` ✅ 已有前缀，保持不变

### 多项目协作

**不同项目使用不同前缀**：

- 项目A：`PROJECT_TABLE_PREFIX="project-a"` → `project-a-users`
- 项目B：`PROJECT_TABLE_PREFIX="project-b"` → `project-b-users`
- 共用数据库，数据完全隔离 ✅

### 迁移指南

**首次启用表名前缀**：

1. 运行 `node .claude/skills/az-init/scripts/sync-project-prefix.js` 自动配置
2. 运行 `npm run generate:schema` 生成新 schema
3. 手动迁移数据库表名（一次性操作，已完成）

**修改项目前缀**：

1. 运行 `node .claude/skills/az-init/scripts/sync-project-prefix.js` 自动更新
2. 运行 `npm run generate:schema` 更新 schema
3. 手动重命名数据库集合（谨慎操作）

> 💡 详细文档：[数据库表名前缀迁移报告](./.claude/docs/DATABASE_TABLE_PREFIX_MIGRATION.md)

## 🎯 功能完整开发原则

**核心理念**：功能完整、质量可靠、用户体验优先

### ✅ 必须实现

- **数据库存储** - 使用 Prisma + MongoDB（已集成）
- **完整验证** - 前端基础校验 + 后端数据校验（Zod Schema）
- **功能闭环** - 每个功能必须有完整的用户旅途闭环
- **简单权限** - 基于用户ID的资源所有权检查（参考现有模式）

### 🔐 权限设计原则（简单为主）

- ✅ **资源所有权检查** - 用户只能操作自己创建的资源
- ✅ **复用现有登录系统** - `useUserStore` + `/login`
- ✅ **后端userId验证** - 通过请求体或JWT获取用户标识
- ❌ **不需要复杂权限** - 无需RBAC、ACL等企业级权限

### ❌ 禁止行为

- ❌ **重复开发登录系统** - 必须复用现有登录系统
- ❌ **只有UI不集成API** - 必须完整集成
- ❌ **只有代码不测试** - 必须通过测试验证
- ❌ **阻塞构建的类型错误** - 必须修复
