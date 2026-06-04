# SuperDoc 文档知识库 MCP 使用指南

## 📚 功能说明

**SuperDoc Knowledge MCP** 是专门为 AI 提供文档查询能力的 MCP 服务器，让 AI 能实时获取 SuperDoc 的使用文档、API 说明和最佳实践。

---

## 🎯 解决的核心问题

### ❌ 原问题

**SuperDoc MCP（官方）只能编辑文档，不能查询文档知识**

- SuperDoc MCP 功能：打开、编辑、保存 DOCX 文件
- AI 无法通过 MCP 了解 SuperDoc 的使用方法
- AI 不知道 SuperDocEditor 组件的正确属性
- AI 不了解 SuperDoc 的最佳实践和常见问题

### ✅ 解决方案

**SuperDoc Knowledge MCP（本地知识库）**

- ✅ AI 可查询 SuperDoc React 组件文档
- ✅ AI 可获取 API 文档和 SDK 使用方法
- ✅ AI 可了解最佳实践和常见问题
- ✅ AI 可获取示例代码和集成指南

---

## 🚀 使用方式

### 1. MCP 工具列表

重启 Claude Code 后，新增的 MCP 工具：

| 工具名称                | 功能说明                     |
| ----------------------- | ---------------------------- |
| `query_superdoc_docs`   | 查询 SuperDoc 文档知识库     |
| `list_superdoc_topics`  | 列出所有可用的文档主题和索引 |
| `get_superdoc_examples` | 获取示例代码（按场景筛选）   |

### 2. 使用示例

#### 示例 1: 查询 React 组件使用方法

```bash
# 在 Claude Code 中执行
请使用 superdoc-knowledge MCP 查询：
"如何使用 SuperDocEditor 组件？"
```

**AI 会返回**：

- SuperDocEditor 组件的完整属性列表
- React 集成示例代码
- Next.js SSR 问题解决方案
- 样式导入注意事项

---

#### 示例 2: 查询最佳实践

```bash
# 查询文档编辑最佳实践
请查询 SuperDoc 的："文档编辑最佳实践"
```

**AI 会返回**：

- 变更跟踪模式推荐（`suggest=true`）
- 批量替换占位符的最佳方法
- 精确查找和替换的技巧
- 文档会话管理建议

---

#### 示例 3: 列出所有文档主题

```bash
# 查看可用文档主题
请使用 list_superdoc_topics 列出所有 SuperDoc 文档主题
```

**AI 会返回**：

```
📚 SuperDoc 文档主题索引：

📂 React 组件文档
  📄 SuperDocEditor 组件
  📄 SuperDocPreview 组件
  📄 Next.js 集成指南

📂 API 文档
  📄 SDK 文档
  📄 CLI 文档
  📄 REST API

📂 最佳实践
  📄 文档编辑最佳实践
  📄 性能优化
  📄 安全最佳实践
```

---

#### 示例 4: 获取示例代码

```bash
# 获取文档编辑示例
请使用 get_superdoc_examples 获取 "document-editing" 场景的示例代码
```

**AI 会返回**：

- React 组件集成示例
- Blob 转 File 示例
- Next.js dynamic 导入示例
- 事件处理示例

---

## 📊 MCP 工具对比

| MCP 服务器             | 功能           | 使用场景                  |
| ---------------------- | -------------- | ------------------------- |
| **superdoc（官方）**   | 编辑 DOCX 文件 | AI 自动编辑文档           |
| **superdoc-knowledge** | 查询文档知识   | AI 学习 SuperDoc 使用方法 |

**推荐使用流程**：

1. **学习阶段**：使用 `superdoc-knowledge` 查询文档

   ```
   请查询 SuperDocEditor 的正确使用方法
   ```

2. **开发阶段**：基于文档知识开发前端组件

   ```
   根据文档知识，帮我优化 SuperDocPreview 组件
   ```

3. **编辑阶段**：使用 `superdoc` MCP 编辑文档
   ```
   请使用 superdoc MCP 批量替换占位符
   ```

---

## 🔧 文档知识库结构

```
.claude/knowledge/superdoc/
├── llms.txt              # 主文档索引（LLM友好格式）
├── examples.json         # 示例代码库（可选）
└── best-practices.md     # 最佳实践文档（可选）
```

### 如何更新文档知识库

#### 手动更新（推荐）

```bash
# 下载最新文档索引
curl -o .claude/knowledge/superdoc/llms.txt https://docs.superdoc.dev/llms.txt

# 或手动编辑（添加项目特定知识）
vim .claude/knowledge/superdoc/llms.txt
```

#### 添加项目特定知识

```txt
# 在 llms.txt 末尾添加项目特定内容

## 项目特定知识

### 当前项目集成状态
- 前端组件：components/documents/superdoc-preview.tsx
- 已处理 SSR 问题：使用 next/dynamic
- 已处理 Blob 转 File：new File([blob], filename)

### 项目特定问题
- 问题1：文档加载慢 → 原因：MinIO下载慢 → 解决：使用预签名URL
- 问题2：样式冲突 → 原因：Tailwind CSS → 解决：使用 CSS Modules

### 项目最佳实践
- ✅ 使用 SuperDocPreviewDialog 对话框模式
- ✅ 使用 MinIO 存储原始文档
- ✅ 使用 MCP 批量替换占位符（而非手动）
```

---

## 🎯 实际应用场景

### 场景 1: AI 开发 SuperDoc 相关功能

**问题**：AI 不了解 SuperDocEditor 的正确用法，导致代码错误

**解决**：

```bash
# AI 先查询文档
请使用 superdoc-knowledge 查询 SuperDocEditor 组件属性

# AI 基于文档开发
请根据文档知识，帮我创建一个文档预览页面
```

---

### 场景 2: AI 优化现有 SuperDoc 组件

**问题**：现有的 superdoc-preview.tsx 有性能问题，需要优化

**解决**：

```bash
# AI 查询最佳实践
请查询 SuperDoc 的性能优化最佳实践

# AI 根据最佳实践优化
请根据文档知识，优化 superdoc-preview.tsx 的性能
```

---

### 场景 3: AI 解决 SuperDoc 问题

**问题**：用户遇到"SSR 问题"或"Blob 转 File 问题"

**解决**：

```bash
# AI 查询常见问题
请查询 SuperDoc 的 "SSR问题" 和 "Blob转File" 解决方案

# AI 提供准确解决方案
根据文档知识，SSR问题应该使用 next/dynamic，Blob应该转换为 File...
```

---

## 📚 知识库内容概览

### React 组件核心知识

✅ **SuperDocEditor 组件**

- 完整属性列表：document, documentMode, onReady, toolbar
- 使用示例：URL加载、Blob加载、File加载
- 重要注意事项：样式导入、SSR问题、Blob转File

✅ **Next.js 集成最佳实践**

- SSR问题：使用 next/dynamic
- 样式导入：在组件顶部导入
- Blob转File：new File([blob], filename, {type: '...'})

---

### MCP 工具核心知识

✅ **变更跟踪模式**

- recommend: suggest=true（可审核）
- 不推荐：suggest=false（无法撤销）

✅ **精确查找**

- 查找返回 textRanges（用于编辑的目标地址）
- 使用 textRanges 进行精确替换

✅ **批量替换占位符**

- 查找所有占位符 → 解析名称 → 批量替换

---

### SDK 核心知识

✅ **基础用法**

- SuperDocClient 初始化
- 打开、编辑、保存、关闭文档

✅ **批量处理**

- 模板批量生成文档
- 并行处理多个文档

---

## 🚨 常见问题

### Q1: MCP 无法启动？

**原因**：缺少依赖

**解决**：

```bash
cd .claude/mcp-servers
npm install
```

---

### Q2: 文档查询失败？

**原因**：llms.txt 不存在

**解决**：

```bash
# 检查文件是否存在
ls -la .claude/knowledge/superdoc/llms.txt

# 手动下载
curl -o .claude/knowledge/superdoc/llms.txt https://docs.superdoc.dev/llms.txt
```

---

### Q3: 查询结果不准确？

**原因**：知识库内容过时

**解决**：

```bash
# 更新文档索引
curl -o .claude/knowledge/superdoc/llms.txt https://docs.superdoc.dev/llms.txt

# 或手动添加项目特定知识
vim .claude/knowledge/superdoc/llms.txt
```

---

## 🔗 相关资源

- **官方文档**: https://docs.superdoc.dev/
- **LLM 文档索引**: https://docs.superdoc.dev/llms.txt
- **GitHub**: https://github.com/superdoc-dev/superdoc
- **本地知识库**: `.claude/knowledge/superdoc/llms.txt`

---

## ✅ 配置完成清单

- [x] MCP 服务器脚本创建
- [x] 文档知识库目录创建
- [x] llms.txt 文档索引创建
- [x] MCP 配置更新
- [x] 依赖安装
- [ ] 重启 Claude Code 测试
- [ ] 实际查询测试

---

**下一步**：重启 Claude Code，然后测试 MCP 功能：

```bash
# 测试查询功能
请使用 superdoc-knowledge MCP 查询："SuperDocEditor 组件使用方法"

# 测试主题列表
请使用 list_superdoc_topics 列出所有文档主题
```
