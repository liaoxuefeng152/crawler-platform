---
name: az-init
description: 项目开发环境一键初始化工具。用于新项目或从模板创建的项目，自动配置项目名称、数据库连接、YOLO模式、插件安装和Git远程连接。触发场景：用户需要初始化开发环境、新项目首次配置、团队成员克隆项目后首次运行。提供交互式配置引导，确保所有配置正确完成。
---

# AZ-Init 项目初始化工具

一键式开发环境初始化工具，为项目团队成员提供完整的配置引导。

## 🚨 强制性执行检查清单

**AI 执行此 skill 时，必须按顺序完成以下所有步骤，不可跳过：**

| 步骤 | 内容                 | 强制性      | 完成标记               |
| ---- | -------------------- | ----------- | ---------------------- |
| 0    | 自动配置项目         | 🔴 必须     | `✅ 项目配置完成`      |
| 1    | 检查项目依赖         | 🟡 推荐     | `✅ 依赖检查完成`      |
| 2    | 检查 YOLO 模式       | 🟡 推荐     | `✅ YOLO 模式检查完成` |
| 3    | 检查 claude-hud 插件 | 🟡 推荐     | `✅ 插件检查完成`      |
| 4    | 验证配置             | 🟡 推荐     | `✅ 配置验证完成`      |
| 5    | **Git 远程连接询问** | 🔴 **必须** | `✅ Git 连接询问完成`  |
| 6    | 完成总结             | 🟡 推荐     | `✅ 初始化完成`        |

**⚠️ 关键要求：**

- 🔴 **步骤 5（Git 连接询问）是强制性的**，必须使用 `AskUserQuestion` 询问用户
- 🔴 **禁止跳过任何 🔴 标记的步骤**
- 🔴 **每个步骤完成后必须输出完成标记**

## 核心功能

**7步骤自动化配置**：

1. **项目配置** - 交互式配置项目名称和表名前缀
2. **依赖检查** - 检查并安装项目依赖
3. **YOLO模式** - 检查并引导启用快速开发模式
4. **插件安装** - 检查并安装claude-hud插件
5. **配置验证** - 验证所有配置完成
6. **Git连接** - 🔴 **必须询问**并配置远程仓库连接
7. **完成总结** - 显示配置结果和下一步操作

## 适用场景

**触发条件**：

- 新项目首次配置
- 从模板创建的项目
- 团队成员克隆项目后首次运行
- 用户说"初始化项目"、"配置开发环境"、"运行az-init"

## 执行流程

### 步骤 0: 自动配置项目（关键步骤）

**必须首先执行**自动配置脚本：

```bash
node .claude/skills/az-init/scripts/sync-project-prefix.js
```

**脚本功能**：

1. 交互式询问**产品首页名称**（将显示在页面标题、登录页、导航栏）
2. 使用当前目录名作为项目目录名
3. 更新 `project.config.json`（主配置文件）
4. 更新 `package.json` 的 `name` 字段
5. 更新 `.env` 的配置
6. 从系统环境变量同步数据库连接
7. 重新生成 Prisma Schema

**配置架构**：

```
project.config.json          # Git仓库（公开配置）
├── projectName              # 产品首页名称
└── projectDir               # 项目目录名

.env                         # .gitignore（本地敏感配置）
├── DATABASE_URL             # 本地开发数据库连接
└── PROJECT_TABLE_PREFIX     # 表名前缀

GitLab CI/CD Variables       # CI/CD环境（线上敏感配置）
└── DATABASE_URL             # 生产环境数据库连接
```

**交互示例**：

```
============================================================
📝 项目名称配置
============================================================

当前项目目录名：az-ai-template

请输入产品首页名称（将显示在页面标题、登录页、导航栏等位置）
直接按 Enter 使用默认名称：深瞳AI Coding

产品首页名称: 深瞳AI Coding
```

### 步骤 1: 检查项目依赖

检查 `node_modules` 和 `package-lock.json` 状态。

**如果未安装**：使用 AskUserQuestion 询问用户是否安装。

### 步骤 2: 检查 YOLO 模式

检测 `~/.claude/settings.json` 中的配置：

```bash
grep -q '"defaultMode":.*"bypassPermissions"' ~/.claude/settings.json
```

**正确的YOLO模式配置**：

```json
{
  "permissions": {
    "defaultMode": "bypassPermissions"
  },
  "skipDangerousModePermissionPrompt": true
}
```

> ⚠️ **重要**：
>
> - ❌ **错误**：`dangerouslySkipPermissions: true`（旧版，VSCode插件不生效）
> - ✅ **正确**：`permissions.defaultMode: "bypassPermissions"`（新版，VSCode插件生效）

### 步骤 3: 检查 claude-hud 插件

检查插件安装和配置状态。

**如果未安装**：引导用户执行：

```
/plugin marketplace add jarrodwatts/claude-hud
/plugin install claude-hud
/claude-hud:setup
```

**正确配置**（使用 statusLine 方式）：

```json
{
  "statusLine": {
    "type": "command",
    "command": "bash -c '\"/usr/bin/node\" \"$HOME/.claude/plugins/marketplaces/claude-hud/dist/index.js\"'"
  }
}
```

### 步骤 4: 验证配置

验证所有配置项状态并显示结果。

### 步骤 5: Git 远程连接（🔴 强制执行 - 不可跳过）

> ⚠️ **这是强制性步骤，必须执行，禁止跳过！**
> ⚠️ **只询问一次，用户做出选择后立即执行，禁止重复询问！**

**必须使用 `AskUserQuestion` 询问用户**，以下是标准询问模板：

```
AskUserQuestion({
  questions: [{
    header: "Git连接",
    multiSelect: false,
    options: [
      { label: "是，需要修改", description: "您提供新的 Git 地址，我将更新远程仓库连接并推送" },
      { label: "否，保持现状", description: "保持现有的远程仓库连接不变" }
    ],
    question: "是否需要修改 Git 远程仓库连接？"
  }]
})
```

**完整询问流程**：

1. **第一次询问：是否需要修改 Git 连接？**（只询问一次！）
   - 是，需要修改 → 进入步骤 2
   - 否，保持现状 → **立即输出完成标记**，**禁止再次询问**

2. **第二次询问（如果选择"是"）：Git 仓库地址**
   - ⚠️ **必须由用户输入完整地址**
   - ❌ 禁止自动构造地址
   - ❌ 禁止使用默认格式

3. **执行 Git 操作**（如果用户提供了地址）：

   ```bash
   git add project.config.json project.config.schema.json package.json package-lock.json prisma/schema.prisma prisma/schema.template.prisma
   git commit -m "[vendor]:init"
   git remote remove origin 2>/dev/null || true
   git remote add origin {用户提供的Git地址}
   git push -u origin main
   ```

4. **处理失败情况**：
   - 安全规则限制 → 询问是否强制执行
   - main分支受保护 → 创建空commit后推送
   - 远程有新提交 → rebase后推送

5. **完成标记**：
   - 成功：`✅ Git 连接询问完成（已连接到 {用户提供的Git地址}）`
   - 用户拒绝：`✅ Git 连接询问完成（用户选择保持现状）`

### 步骤 6: 完成总结

显示配置结果：

```
✅ 开发环境初始化完成！

📁 配置文件位置：
  project.config.json - 主配置文件（上传到 Git）
  .env - 本地敏感配置（不上传）
  CI/CD Variables - 线上敏感配置（DATABASE_URL）

📋 下一步：
  1. 运行 'npm run dev' 启动开发服务器
  2. 访问 http://localhost:3000 查看应用
```

## 资源

### scripts/

可执行脚本（无需加载到上下文，直接运行）：

| 脚本                             | 用途                                           |
| -------------------------------- | ---------------------------------------------- |
| `scripts/sync-project-prefix.js` | 自动配置脚本（项目配置、环境变量、Schema生成） |
| `scripts/az-init-check.sh`       | 环境检查脚本（依赖、YOLO模式、插件状态）       |

**执行方式**：

```bash
# 自动配置项目
node .claude/skills/az-init/scripts/sync-project-prefix.js

# 环境检查
bash .claude/skills/az-init/scripts/az-init-check.sh
```

### references/

详细文档（按需加载）：

| 文档                                      | 用途                                                                        |
| ----------------------------------------- | --------------------------------------------------------------------------- |
| `references/interactive-configuration.md` | 交互式配置引导详细流程（AskUserQuestion参数、YOLO模式配置、claude-hud安装） |
| `references/git-workflow.md`              | Git远程连接完整流程（6个子步骤、失败处理、安全注意事项）                    |

**使用方法**：需要执行特定步骤时阅读对应文档。保持SKILL.md精简。

### 相关配置文件

| 文件                         | 用途           |
| ---------------------------- | -------------- |
| `project.config.json`        | 项目主配置文件 |
| `project.config.schema.json` | 配置文件Schema |
| `package.json`               | 项目依赖配置   |
| `.env`                       | 本地环境变量   |

### 配置模板

**project.config.json**：

```json
{
  "$schema": "./project.config.schema.json",
  "projectName": "产品首页名称",
  "projectDir": "项目目录名"
}
```

## 注意事项

### 安全性

| 配置项         | 安全等级 | 能否上传Git |
| -------------- | -------- | ----------- |
| 项目名称       | 公开     | ✅ 可以     |
| 项目目录名     | 公开     | ✅ 可以     |
| DATABASE_URL   | **敏感** | ❌ 禁止     |
| 飞书 AppSecret | **敏感** | ❌ 禁止     |

### YOLO模式配置

**VSCode插件用户注意**：

- 必须使用新配置格式 `permissions.defaultMode: "bypassPermissions"`
- 旧格式 `dangerouslySkipPermissions` 在VSCode插件中不生效

### Git初始化安全

**多用户协作场景**：

- 从已有仓库克隆的项目，不建议运行Git步骤
- 多人协作项目，只有项目负责人执行Git初始化
- 检测到已有远程仓库时，默认不修改配置

## 错误处理

| 错误场景         | 处理方式             |
| ---------------- | -------------------- |
| 配置文件不存在   | 自动创建默认配置     |
| 依赖安装失败     | 提示用户手动安装     |
| YOLO模式配置错误 | 显示正确配置示例     |
| Git推送失败      | 提供手动操作指南     |
| 远程仓库已有内容 | 提示用户选择处理方式 |
