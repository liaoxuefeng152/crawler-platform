# Skills 技能库

本项目包含 **38个skills**，分为官方技能和项目自定义技能两类。

---

## 📦 官方技能（17个）

从 Anthropic 官方同步的技能，定期更新。

| Skill | 用途 |
|-------|------|
| `algorithmic-art` | 使用 p5.js 创建算法艺术 |
| `brand-guidelines` | Anthropic 官方品牌配色和字体 |
| `canvas-design` | 创建精美的 PNG/PDF 艺术作品 |
| `claude-api` | Claude API / Anthropic SDK 开发（含 Managed Agents） |
| `doc-coauthoring` | 文档协作流程指南 |
| `docx` | Word 文档（.docx）操作 |
| `frontend-design` | 高质量前端界面设计 |
| `internal-comms` | 内部沟通文档格式指南 |
| `mcp-builder` | MCP 服务器开发指南 |
| `pdf` | PDF 文件操作（读取、提取、创建） |
| `pptx` | PowerPoint 文件操作 |
| `skill-creator` | 创建和改进 Skills |
| `slack-gif-creator` | Slack GIF 动画创建 |
| `theme-factory` | 主题样式工具 |
| `webapp-testing` | Playwright Web 应用测试 |
| `web-artifacts-builder` | Claude.ai HTML Artifacts 构建 |
| `xlsx` | Excel 表格文件操作 |

---

## 🔧 项目自定义技能（21个）

项目特有的技能，为深瞳AI Coding开发流程定制。

### 核心工作流

| Skill | 用途 |
|-------|------|
| `workflow-manager` | 9阶段标准化开发流程（Plan → Clarify → Tasks → Dev → OpenAPI → Test → Verification → QA → Security Review） |
| `az-init` | 项目开发环境一键初始化 |

### 开发规范

| Skill | 用途 |
|-------|------|
| `react-best-practices` | React/Next.js 性能优化规范（强制执行） |
| `frontend-patterns` | 前端开发模式指南 |
| `backend-patterns` | 后端架构模式指南 |
| `generate-openapi-doc` | OpenAPI 文档生成工作流 |
| `generate-e2e-tests` | E2E 测试代码模板生成 |

### 飞书集成

| Skill | 用途 |
|-------|------|
| `feishu-reader` | 飞书云文档读取工具 |
| `link-feishu-cli` | 飞书 CLI 安装配置助手 |

### 组件库

| Skill | 用途 |
|-------|------|
| `component-library-guide` | L1索引skill，帮助发现可复用组件 |
| `component-library` | 项目组件库（可配置表格、布局、UI组件） |

### 辅助工具

| Skill | 用途 |
|-------|------|
| `bug` | Bug 错误分析器 |
| `smart-illustrator` | 智能配图与 PPT 信息图生成 |
| `solution-doc-generator` | 方案文档生成（架构文档/集成规范） |
| `strategic-compact` | 上下文压缩建议 |
| `system-check` | 系统资源分析报告 |
| `system-optimizer` | Linux 系统优化调优 |
| `ui-ux-pro-max` | UI/UX 设计智能（50风格/21配色） |
| `user-story-mermaid` | 用户需求 Mermaid 序列图生成 |
| `continuous-learning-v2` | 基于本能的学习系统 |

---

## 🔄 更新记录

| 日期 | 操作 |
|------|------|
| 2026-04-24 | 更新官方17个skills到最新版本（claude-api新增Managed Agents支持） |

---

## 📝 使用方式

通过 Skill 工具调用：

```
Skill(skill_name)
```

例如：
- `Skill(workflow-manager)` - 启动9阶段工作流
- `Skill(claude-api)` - Claude API 开发
- `Skill(feishu-reader)` - 读取飞书文档