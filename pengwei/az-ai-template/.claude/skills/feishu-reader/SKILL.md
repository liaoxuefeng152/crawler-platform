---
name: feishu-reader
description: 读取和访问飞书云文档的专业工具。支持普通文档（docx）和 Wiki 文档，自动检查环境变量配置，提供交互式凭证配置，生成符合 Next.js API Routes 规范的代码。当用户需要读取飞书文档、访问飞书 Wiki、开发飞书相关 API、配置飞书应用凭证或集成飞书文档到现有系统时使用。支持 docx 和 wiki 文档类型，自动检测 URL 类型。
---

# 飞书文档读取技能

读取和访问飞书云文档（支持普通文档和 Wiki 文档）的专业工具。

## 工作流程

按照以下阶段顺序执行：

### 阶段 1：环境配置检查

1. **检查环境变量**：
   - 读取项目根目录的 `.env` 文件
   - 检查是否存在 `FEISHU_APP_ID` 和 `FEISHU_APP_SECRET`
   - 验证凭证是否为占位符值

2. **判断凭证状态**：
   - ✅ **配置完整**：进入阶段 3
   - ❌ **缺失/无效**：进入阶段 2

### 阶段 2：交互式凭证配置（仅在需要时）

如果环境变量缺失或无效，使用 `AskUserQuestion` 与用户交互：

**问题 1**：
```
问题：检测到飞书凭证未配置，您希望如何配置？
选项：
1. 【提供凭证】- "我现在提供 App ID 和 Secret"
2. 【帮助获取】- "帮助我找到飞书应用凭证"
3. 【取消操作】- "暂时不配置"
```

- **选择"提供凭证"**：
  - 询问 `FEISHU_APP_ID`
  - 询问 `FEISHU_APP_SECRET`
  - 更新 `.env` 文件（征得用户同意）

- **选择"帮助获取"**：
  - 提供飞书开放平台文档链接
  - 说明创建应用和获取凭证的步骤
  - 提供权限配置指导
  - 询问是否继续配置

- **选择"取消操作"**：
  - 友好结束，不进行后续开发

### 阶段 3：API 路由开发

确认凭证配置后，基于项目规范生成代码：

#### 代码生成规范

1. **遵循项目架构**：
   - 使用 Next.js API Routes（App Router）
   - 文件位置：`app/api/[模块]/[操作]/route.ts`
   - TypeScript 全链路类型安全
   - 使用 Zod 进行请求验证

2. **复用核心函数**：
   - 从 `app/api/recruitment/lib/feishu-client.ts`：
     - `getFeishuTenantToken()` - 获取访问令牌
     - `fetchFeishuDocument(url)` - 读取文档内容
     - `isFeishuConfigured()` - 检查配置状态

3. **API 路由模板** - 完整模板见 [代码模式参考](references/code-patterns.md)

4. **JSDoc 注释规范**：
   - 必须包含 @route、@description、@tags、@param、@returns
   - 用于生成 OpenAPI 文档

### 阶段 4：测试和验证

1. **测试 API 路由**：
   - 提供测试 curl 命令
   - 或使用现有的 `/api/test/feishu-read` 接口

2. **文档保存（可选）**：
   - 提供将文档保存为 Markdown 的选项
   - 参考 `.claude/scripts/feishu-wiki-reader.ts` 实现

## 支持的文档类型

1. **普通文档（docx）**：
   - URL 格式：`https://xxx.feishu.cn/docx/xxxxx`
   - 直接读取文档内容

2. **Wiki 文档**：
   - URL 格式：`https://xxx.feishu.cn/wiki/xxxxx`
   - 自动获取节点信息并读取实际文档

3. **不支持的类型**：
   - 多维表格（Bitable）
   - 提示用户使用普通文档或 Wiki 文档

## 错误处理

提供用户友好的错误提示：

- `FEISHU_NOT_CONFIGURED`：飞书凭证未配置
- `FEISHU_INVALID_URL`：无法从链接中提取文档 ID
- `FEISHU_NO_PERMISSION`：无权限访问该文档
- `FEISHU_DOC_NOT_FOUND`：文档不存在或已删除
- `FEISHU_WIKI_NO_PERMISSION`：无权限访问该 Wiki 文档
- `FEISHU_WIKI_NOT_FOUND`：Wiki 文档不存在或已删除
- `FEISHU_EMPTY_DOC`：文档内容为空

完整的错误处理模式见 [代码模式参考](references/code-patterns.md)。

## 技术参考

**核心库**：`app/api/recruitment/lib/feishu-client.ts`

**关键函数**：
```typescript
// 检查凭证是否配置
isFeishuConfigured(): boolean

// 获取租户访问令牌（缓存 2 小时）
getFeishuTenantToken(): Promise<string>

// 读取飞书文档（支持 docx 和 wiki）
fetchFeishuDocument(url: string): Promise<string>
```

**测试脚本**：`.claude/scripts/feishu-wiki-reader.ts`

**API 示例**：`app/api/test/feishu-read/route.ts`

**前端集成**：`app/dashboard/recruitment/interview/page.tsx`（预览功能）

**飞书 API 详情**：API 端点、权限、错误码见 [飞书 API 参考](references/feishu-api.md)。

## 输出规范

1. **代码生成**：
   - 符合项目 TypeScript 规范
   - 遵循 Next.js App Router 最佳实践
   - 包含完整的 JSDoc 注释
   - 使用 Zod 进行请求验证

2. **用户沟通**：
   - 清晰的配置指引
   - 友好的错误提示
   - 详细的测试步骤

3. **文档输出**：
   - Markdown 格式
   - 保留文档结构（标题、列表、代码块、表格等）

## 注意事项

1. **凭证安全**：
   - 绝不在代码中硬编码凭证
   - 始终从环境变量读取
   - `.env` 文件应添加到 `.gitignore`

2. **权限要求**：
   - 飞书应用需要"文档读取"权限
   - Wiki 文档需要"知识库读取"权限
   - 文档需要分享给应用或设置为全员可见

3. **API 限流**：
   - 飞书 API 有调用频率限制
   - 大文档建议分页读取
   - 已实现 `has_more` 和 `page_token` 机制

## 使用示例

**用户输入**：
```
帮我读取这个飞书文档：https://vzyjg03bu3.feishu.cn/wiki/LjGfwUvodiDqMKkhsBQcBamZnch
```

**Skill 执行流程**：
1. 检查 `.env` 文件中的 `FEISHU_APP_ID` 和 `FEISHU_APP_SECRET`
2. 如果缺失，询问用户提供凭证
3. 生成或使用现有的 API 路由
4. 调用 `fetchFeishuDocument()` 读取文档
5. 返回格式化的文档内容（Markdown）

**输出示例**：
```markdown
# 文档标题

这是文档的第一段内容...

## 二级标题

- 列表项 1
- 列表项 2

### 代码示例

​```javascript
console.log('Hello Feishu');
​```

---
文档读取成功！标题：文档标题，内容长度：1234 字符
```
