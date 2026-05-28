# 🚀 POC开发详细指南

本文档提供POC（Proof of Concept）快速原型开发的完整指南，专注于功能验证而非完美设计。

## 🎯 POC核心原则

### 核心理念

- **功能实现 > 完美设计 > 复杂架构**
- **Prisma + MongoDB 数据驱动，类型安全**
- **快速验证，迭代优化**
- **无权限系统，专注核心业务**

### 开发优先级

1. ✅ **核心功能实现** - 确保主要功能可用
2. ✅ **基本用户体验** - 简单易用的界面
3. ✅ **数据持久化** - Prisma + MongoDB 存储
4. ❌ **复杂权限系统** - POC阶段不实现
5. ❌ **完美性能优化** - 后续迭代考虑
6. ❌ **企业级架构** - 避免过度设计

## 📋 POC开发检查清单

### 第一步：设计规范确认

- [ ] **阅读 THEME.md** - 了解设计风格要求
- [ ] **确认配色方案** - 使用主题变量避免硬编码
- [ ] **了解间距标准** - 默认使用 `gap-4`
- [ ] **参考组件样式** - Card、Button、Input 等标准样式

### 第二步：快速技术实现

- [ ] **数据存储方案** - 使用 Prisma + MongoDB (参考 lib/db/)
- [ ] **API路由设计** - 使用 Next.js API Routes，简单实用
- [ ] **现有组件复用** - 检查shadcn/ui组件库
- [ ] **状态管理** - 使用Zustand，轻量简洁

### 第三步：功能实现

- [ ] **核心逻辑优先** - 先实现主要功能
- [ ] **简化验证逻辑** - POC阶段只进行前端基础必填校验，不做复杂验证
- [ ] **使用Axios拦截器** - 统一处理token和错误
- [ ] **Prisma数据管理** - 使用 DataManager 模式（lib/db/）

## 🚫 POC无权限系统原则

### 核心规定

- **POC项目无权限系统** - 该项目为POC验证，不实现任何权限控制
- **Token仅用于登录状态** - JWT token只保存登录状态，不做权限验证
- **所有功能对所有用户开放** - 登录用户可使用所有功能
- **避免角色相关开发** - 不开发角色管理、权限分配等复杂功能
- **专注核心业务功能** - 将开发资源集中在业务功能实现上

### 实施指导

```typescript
// ❌ 错误：POC项目中不要这样做
function checkPermission(user: User, resource: string) {
  if (!user.roles.includes('admin')) {
    throw new Error('无权限访问');
  }
}

// ✅ 正确：POC项目简化处理
function checkLogin(user: User | null) {
  if (!user) {
    throw new Error('请先登录');
  }
}
```

## 🔍 POC数据校验原则

### 前端校验为主

- 仅在前端进行基础的必填项校验
- 避免复杂的业务规则验证
- 减少校验逻辑对性能的影响

### 后端简化处理

- 后端接口对接收数据不做复杂校验
- 接收数据后直接存储和处理
- 校验逻辑不阻塞核心功能的快速实现

### 基础校验范围

- ✅ **必填字段非空** - 使用 `required` 属性
- ✅ **基础格式检查** - 邮箱、数字等简单格式
- ❌ **复杂业务规则** - 避免深度业务验证
- ❌ **数据完整性检查** - POC阶段不需要
- ❌ **多级验证逻辑** - 保持简单

### 具体实施

```typescript
// ✅ 前端：简单的必填校验
<input required type="text" name="username" />
<input required type="email" name="email" />

// ✅ 后端：简化处理
export async function POST(request: NextRequest) {
  const body = await request.json();
  // 直接存储，不做复杂验证
  await LoginUserDataManager.create(body);
  return NextResponse.json({ success: true });
}
```

## 🔄 Prisma + MongoDB 数据驱动开发模式

### 核心原则

- **类型安全**: Prisma 自动生成类型定义
- **动态CRUD**: 支持运行时数据增删查改
- **简单实用**: 避免复杂的数据验证和权限系统

### 数据模型结构

```
prisma/
├── schema.prisma      # Prisma Schema 定义
└── migrations/        # 数据库迁移（MongoDB 不需要）

lib/db/
├── prisma.ts          # Prisma 客户端实例
└── index.ts           # 数据访问层（DataManager）
```

### 数据模型

```prisma
// prisma/schema.prisma

model LoginUser {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  username    String   @unique
  password    String
  displayName String
  email       String   @unique
  // ...
}

model User {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  phone     String   @unique
  nickname  String
  // ...
}

model Notification {
  id      String   @id @default(auto()) @map("_id") @db.ObjectId
  userId  String   @db.ObjectId
  type    String
  title   String
  // ...
}

model Registration {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  activityId String
  userId     String   @db.ObjectId
  // ...
}
```

### 数据管理器使用

```typescript
// lib/db/index.ts
import { LoginUserDataManager, UserDataManager } from '@/lib/db';

// 用户认证
const user = await LoginUserDataManager.validateLogin(username, password);

// 创建用户
await LoginUserDataManager.create({
  username: 'newuser',
  password: 'password',
  displayName: 'username',
  email: 'user@example.com',
});

// 获取所有用户
const users = await LoginUserDataManager.getAll();
```

## 🛠️ API路由开发模式

### 标准API结构

```typescript
// app/api/auth/login/route.ts
import { LoginUserDataManager } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // 1. 解析请求数据
    const body = await request.json();

    // 2. 使用数据访问层操作 MongoDB
    const user = await LoginUserDataManager.validateLogin(username, password);

    // 3. 返回简单响应
    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
```

### CRUD操作模式

- **CREATE**: 注册用户 → 插入到 MongoDB
- **READ**: 查询用户 → 从 MongoDB 读取
- **UPDATE**: 修改信息 → 更新 MongoDB 数据
- **DELETE**: 删除账户 → 从 MongoDB 移除

## 🔧 开发工具和命令

### 开发命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 代码格式化
npm run format

# 代码质量检查
npm run lint:fix
```

### 技术栈特性

- **Zustand**: 轻量级状态管理，简单易用
- **Axios**: HTTP客户端，支持拦截器和错误处理
- **Prisma + MongoDB**: 类型安全的数据库访问，适合生产环境
- **TypeScript**: 全链路类型安全
- **ESLint + Prettier**: 代码规范自动化

## 📊 项目目录结构

```
app/
├── api/                 # Next.js API Routes
│   ├── auth/           # 认证相关API
│   └── user/           # 用户管理API
├── login/              # 登录页面
├── signup/             # 注册页面
└── dashboard/          # 仪表板页面
lib/
├── db/                 # 数据库访问层
│   ├── prisma.ts       # Prisma 客户端
│   └── index.ts        # 数据管理器
├── auth.ts            # JWT认证工具
├── apiCreator.ts      # Axios HTTP客户端
└── utils.ts           # 工具函数
prisma/
└── schema.prisma      # Prisma Schema 定义
store/
└── useUserStore.ts    # Zustand用户状态管理
```

## 🔄 POC问题解决路径

### 设计相关问题

```
问题类型: 样式、布局、色彩、字体
解决路径: THEME.md → 相关章节 → 参考代码示例
常见场景:
- 颜色使用 → THEME.md#配色方案
- 间距设置 → THEME.md#间距系统
- 组件样式 → THEME.md#组件样式
```

### 数据存储问题

```
问题类型: 数据库操作、CRUD功能
解决路径: 参考 lib/db/ → 数据访问层 → Prisma 客户端
常见场景:
- 用户数据 → LoginUserDataManager / UserDataManager
- 新模块数据 → 复用 DataManager 模式
- API开发 → 参考 app/api/auth/ 结构
```

### 开发相关问题

```
问题类型: 组件开发、架构、技术选型
解决路径: development/ → 具体指南 → POC优先原则
常见场景:
- 新组件开发 → 优先使用shadcn/ui现有组件
- 数据管理 → 复用DataManager模式
- 架构问题 → 保持简单，避免过度设计
```

## ⚠️ POC原则突破审批机制

任何工作流在需要突破POC核心原则时（如添加权限系统、复杂验证等），**必须在需求澄清（Clarify）阶段明确告知用户**

必须说明：
1. 计划突破哪个POC原则
2. 为什么需要突破（业务必要性）
3. 提供遵守POC原则的替代方案
4. 等待用户明确批准后才能实施

**未经用户明确同意，不得擅自突破POC原则**

## 💡 POC开发核心要点

### 记住

- **POC开发的核心是快速验证功能可行性，避免陷入过度设计的陷阱！**
- **功能实现优先，复杂架构后续考虑。Prisma + MongoDB 提供类型安全的生产级存储。**

### 避免陷阱

- ❌ 不要为了"完美"而过度设计
- ❌ 不要引入复杂的权限系统
- ✅ 使用 Prisma + MongoDB 进行数据存储（已集成）
- ❌ 不要过度优化性能
- ❌ 不要写复杂的业务验证逻辑

---

**💡 快速参考**: 完整的模块开发模板请参考 [模块开发模板指南](./module-development-template.md)
