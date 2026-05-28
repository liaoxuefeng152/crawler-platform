# Claude 运用指南

> **更新**: 2026-03-09 - Skills 目录完整更新

---

## 📚 Skills 专业技能集

### 核心技能

| Skill | 功能概述 |
|-------|---------|
| **workflow-manager** | 9阶段标准化工作流管理（Plan → Clarify → Tasks → Dev → OpenAPI → Test → Verification → QA → Security Review），确保项目开发全流程质量 |
| **component-library-guide** | L1索引skill，帮助前端专家快速发现和使用项目可复用组件，避免重复开发 |
| **az-init** | 项目开发环境一键初始化工具，自动配置项目名称、数据库连接、Git远程连接等 |

### 艺术与设计

| Skill | 功能概述 |
|-------|---------|
| **algorithmic-art** | 使用p5.js创建算法艺术和生成艺术，支持流场、粒子系统等 |
| **brand-guidelines** | 应用Anthropic官方品牌色彩和排版标准到各类文档和设计 |
| **canvas-design** | 创建PNG/PDF格式的视觉艺术和设计作品，支持设计哲学指导 |
| **frontend-design** | 创建高质量前端界面和Web组件设计，避免通用AI美学 |
| **smart-illustrator** | 智能配图与PPT信息图生成器，支持文章配图、PPT信息图、封面图、Bento Grid风格 |
| **theme-factory** | 为文档、幻灯片、HTML landing page等应用主题样式，内置10种预设主题 |
| **ui-ux-pro-max** | UI/UX设计智能，50+风格、21+调色板、50+字体配对、20+图表 |

### 文档处理

| Skill | 功能概述 |
|-------|---------|
| **doc-coauthoring** | 文档协作structured工作流程指南，帮助用户高效撰写文档、提案、技术规格 |
| **docx** | Word文档(.docx)创建、编辑、分析，支持格式处理、修订跟踪、批注管理 |
| **feishu-reader** | 飞书云文档读取和访问工具，支持普通docx和Wiki文档，自动检查环境变量配置 |
| **pdf** | PDF文本提取、创建、合并、分割和表单处理，支持批量操作 |
| **pptx** | PowerPoint演示文稿创建、编辑和分析，支持布局、注释、演讲者备注 |
| **xlsx** | Excel电子表格(.xlsx/.xlsm/.csv/.tsv)创建、编辑、公式计算和数据分析 |

### 开发工具

| Skill | 功能概述 |
|-------|---------|
| **claude-api** 🆕 | 构建Claude API/Anthropic SDK应用程序，支持Python/TypeScript/Java/Go/Ruby/C#/PHP多语言SDK，含Agent SDK指导 |
| **component-library** | 项目可复用组件库（layout、ui组件等） |
| **generate-e2e-tests** | 根据plan.md和tasks.md自动生成Playwright E2E测试代码模板 |
| **generate-openapi-doc** | OpenAPI文档生成工作流，扫描API路由、验证JSDoc、生成openapi.json和Swagger UI |
| **mcp-builder** | 构建高质量MCP服务器集成外部服务，支持Python FastMCP和Node/TypeScript MCP SDK |
| **react-best-practices** | React/Next.js性能优化规范（Vercel Engineering），40+规则覆盖打包、渲染、缓存优化 |
| **skill-creator** | 创建新技能或扩展现有技能，支持eval评测、benchmark对比、description优化 |
| **web-artifacts-builder** | 构建复杂多组件React artifacts，支持shadcn/ui组件和状态管理 |
| **webapp-testing** | 使用Playwright进行本地Web应用测试，支持UI验证、截图、浏览器日志 |

### 沟通与协作

| Skill | 功能概述 |
|-------|---------|
| **internal-comms** | 企业内部沟通文档撰写（状态报告、领导更新、新闻稿、FAQ、事件报告等） |
| **slack-gif-creator** | 创建Slack专用的动画GIF，提供约束验证和动画概念 |

### 系统与自动化

| Skill | 功能概述 |
|-------|---------|
| **continuous-learning-v2** | 基于本能的学习系统，观察会话、创建原子本能、演进为skills/commands/agents |
| **strategic-compact** | 建议在逻辑间隔进行手动上下文压缩，保持任务阶段完整性 |
| **system-optimizer** | Linux开发环境系统资源优化和性能调优，分析负载、识别瓶颈、执行清理 |

---

## 📋 Skills 更新记录

### v2.2 (2026-03-09)

| Skill | 变更类型 | 更新内容 |
|-------|---------|---------|
| **claude-api** | 🆕 新增 | Claude API/Anthropic SDK应用构建，支持7种语言，含Agent SDK指导、自适应thinking、compaction支持 |
| **docx** | 🔄 重构 | v2.0完整重构：新增docx-js创建文档工作流、XML编辑指南、接受修订脚本(accept_changes.py)、office脚本集成、页边距/表格/图片/超链接/脚注完整API |
| **skill-creator** | 🔄 重构 | v2.0完整重构：新增eval-viewer评测系统、benchmark对比分析、description优化循环(run_loop.py)、schemas.md参考文档 |
| **xlsx** | 📝 更新 | 新增公式验证检查清单、recalc.py脚本集成、错误处理JSON输出、LibreOffice宏自动配置 |
| **workflow-manager** | 📝 更新 | 7阶段升级为9阶段（新增OpenAPI、Security Review） |

### 历史版本

| Skill | 变更类型 | 说明 |
|-------|---------|------|
| **smart-illustrator** | ➕ 新增 | 智能配图与PPT信息图生成器，支持Bento Grid风格 |
| **feishu-reader** | ➕ 新增 | 飞书云文档读取工具 |
| **generate-e2e-tests** | ➕ 新增 | Playwright E2E测试代码生成 |
| **generate-openapi-doc** | ➕ 新增 | OpenAPI文档生成工作流 |
| **continuous-learning-v2** | ➕ 新增 | 本能学习系统 |
| **strategic-compact** | ➕ 新增 | 上下文压缩建议 |
| **system-optimizer** | ➕ 新增 | Linux系统优化 |
| **react-best-practices** | ➕ 新增 | React/Next.js性能规范 |
| **az-init** | ➕ 新增 | 项目初始化工具 |

---

## 🚀 可移植性

整个`.claude/`目录现在可以完全独立复制到其他项目：

```bash
# 复制到新项目
cp -r .claude/ ~/new-project/.claude/

# 立即可用，无需额外配置
```

**核心文档**已从`.az/docs/`迁移到`.claude/docs/`，实现完全可移植性。

---

## 配置文件

### settings.local.json

项目权限配置文件，定义允许执行的命令操作。

### agents/ - 专家代理配置

- **architecture-planning-expert**: 架构规划、需求拆解、并行开发策略专家
- **backend-expert**: Node.js/Python 后端开发专家，API设计和数据库架构
- **frontend-expert**: React/Next.js/TypeScript 前端开发专家，组件设计和性能优化
- **fullstack-requirement-expert**: 全栈需求分析专家，业务需求与技术实现衔接
- **qa-expert**: QA专家，代码质量检查、功能验证、构建验证
- **test-expert**: 测试专家，单元测试、E2E测试、类型安全验证

### commands/ - 自定义命令

- **/az-coding**: 启动完整9阶段工作流
- **/az-coding-again**: 基于现有plan进行持续开发
- **/bug**: 错误分析命令，分析终端/浏览器报错并提供解决方案
- **/chinese**: 中文语言设置，确保 AI 使用中文回复

### docs/ - 文档和指南

- **shadcn-mcp-guide.md**: shadcn/ui MCP 集成使用指南

---

## 使用方式

专家代理：`Task`工具自动调用特定领域专家
专业技能：`Skill`工具直接激活相关技能
自定义命令：使用 `/` 前缀调用（如 `/az-coding`）

---

## 💬 交互式问答原则（核心交互规范）

### 核心要求

- ✅ **所有操作前必须确认**: Claude执行任何写入、删除、修改操作前，必须通过交互式问答与用户确认
- ✅ **主动式交互**: Claude应该在需要决策时主动使用 `AskUserQuestion` 工具询问用户
- ✅ **禁止默默执行**: 除非是只读操作（如git status、ls、cat等），否则不得在未确认的情况下执行
- ✅ **提供选项**: 对于有多种解决方案的问题，必须主动提供选项并询问用户偏好

### 交互场景清单

1. **文件操作**: Write、Edit、Delete 前必须确认
2. **Git操作**: git commit、git push、git merge 前必须确认（已配置为禁止自动执行）
3. **依赖安装**: npm install、npm uninstall 前必须确认
4. **架构决策**: 选择技术方案、组件库、状态管理等前必须询问用户偏好
5. **任务执行**: 执行长时间任务前必须确认用户意图和范围
6. **问题解决**: 发现bug或问题时，必须先报告用户，询问如何处理再执行
7. **代码重构**: 大规模重构前必须与用户确认重构范围和策略

### 交互式问答示例

```
❌ 不推荐：默默执行 npm install react-query
✅ 推荐：检测到需要安装 react-query 依赖，是否执行安装？
    选项：
    A. 立即安装
    B. 先查看package.json当前依赖
    C. 取消操作

❌ 不推荐：直接修改所有组件文件
✅ 推荐：发现需要重构10个组件文件以适配新API，请确认：
    选项：
    A. 全自动重构所有文件
    B. 先展示第一个文件的修改预览
    C. 分批重构（每批3个文件）
    D. 取消操作
```

### 设计理念

> 💡 **交互式问答确保用户始终保持对项目的控制权，AI作为智能助手而非自主代理，所有关键决策都需要人类的战略指导。**

---

## Git 权限控制

项目使用 Husky Git Hooks 控制 AI 的 Git 操作权限，配置文件位于 `.husky/pre-commit`：

### 分支检测机制

- **main/master 分支**: 强制执行代码质量检查（类型检查、构建验证、测试）
- **开发分支**: 跳过所有检查，允许 AI 自由提交和开发

### 工作原理

```bash
# .husky/pre-commit 自动检测当前分支
current_branch=$(git rev-parse --abbrev-ref HEAD)

# 非 main/master 分支直接通过
if [ "$current_branch" != "main" ] && [ "$current_branch" != "master" ]; then
    echo "⏭️  跳过代码质量检查（仅在 main/master 分支执行）"
    exit 0
fi

# main/master 分支执行完整检查
npm run type-check && npm run build && npm test
```

### AI 提交策略

- ✅ **开发分支**: AI 可以直接 `git add/commit/push`
- ⚠️ **main/master**: 需要人工审核后再提交到主分支

---

## shadcn/ui MCP 集成

本项目已集成 shadcn/ui MCP 服务器，提供智能化的组件管理能力：

### MCP 功能：

- **智能组件分析**：自动分析现有组件状态和配置
- **批量组件管理**：一次性添加多个相关组件及依赖
- **设计系统集成**：确保组件符合项目设计规范
- **快速原型开发**：加速组件开发和迭代过程

### 使用示例：

```
# 智能组件生成
"使用 shadcn/ui MCP 工具创建一个用户管理表单组件"

# 批量组件添加
"使用 MCP 批量添加数据表格所需的所有相关组件"

# 组件分析
"请分析项目中已集成的 shadcn/ui 组件状态"
```

详细使用指南请参考：[shadcn/ui MCP 集成使用指南](./docs/claude/shadcn-mcp-guide.md)

---

## 📚 docs/ 目录结构

`.claude/docs/` 包含所有agents依赖的核心参考文档：

```
.claude/docs/
├── references/              # Agents强依赖的Reference文档
│   ├── sequential-thinking-method.md
│   ├── ralph-loop-execution-guide.md
│   ├── backend-api-testing-guide.md
│   └── frontend-e2e-testing-guide.md
│
├── development/             # 开发指南
│   ├── poc-development-guide.md
│   ├── COMPONENT_DEVELOPMENT_CHECKLIST.md
│   ├── agent-collaboration-guide.md
│   └── [other guides...]
│
├── backend/                 # 后端技术参考
├── testing/                 # 测试参考
├── templates/               # 测试报告模板
├── claude/                  # Claude配置指南
│
├── THEME.md                 # 设计规范
├── spec-api-standard.md     # API契约标准
├── api-development-standards.md
└── [core standards...]
```

**注意**：`.az/docs/` 保留用于项目特定文档和归档，不随`.claude/`移植。

---

## 🔗 文档引用规则

所有文档引用使用相对于项目根目录的路径：

```markdown
# ✅ 正确：引用.claude/docs/中的文档
[THEME.md](.claude/docs/THEME.md)
[API开发标准](.claude/docs/api-development-standards.md)

# ❌ 错误：不要引用已过时的路径
[过时文档](.az/docs/some-file.md)
```

---

**文档版本**: 2.2
**最后更新**: 2026-03-09