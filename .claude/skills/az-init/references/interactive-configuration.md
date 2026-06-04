# 交互式配置引导详细流程

本文档包含az-init各步骤的详细交互式配置流程。

## 步骤 1: 项目依赖安装

### 检测逻辑

```bash
# 检查 node_modules 和 package-lock.json
if [ -d "node_modules" ] && [ -f "package-lock.json" ]; then
  echo "✅ 项目依赖已安装"
elif [ -d "node_modules" ]; then
  echo "⚠️  node_modules 存在，但缺少 package-lock.json"
  echo "建议运行：npm install"
else
  echo "❌ 项目依赖未安装"
  echo "必须运行：npm install"
fi
```

### 交互式询问

**如果项目依赖未安装或需要更新**，使用 AskUserQuestion 工具：

```json
{
  "questions": [
    {
      "question": "检测到项目依赖未安装或需要更新。项目依赖是运行项目所必需的。是否现在运行 'npm install' 安装依赖？",
      "header": "依赖安装",
      "multiSelect": false,
      "options": [
        {
          "label": "是，立即安装",
          "description": "运行 npm install 安装所有依赖"
        },
        {
          "label": "否，稍后手动安装",
          "description": "跳过此步骤，稍后手动运行 npm install"
        }
      ]
    }
  ]
}
```

**如果用户选择"是"**，执行：

```bash
npm install
```

---

## 步骤 2: YOLO 模式配置

### 检测逻辑

```bash
# 检查当前权限模式（正确的配置项）
if grep -q '"defaultMode":.*"bypassPermissions"' ~/.claude/settings.json 2>/dev/null; then
  echo "✅ YOLO 模式已启用"
  YOLO_ENABLED=true
else
  echo "⚠️  YOLO 模式未启用"
  YOLO_ENABLED=false
fi
```

### 交互式询问

**如果 YOLO 模式未启用**，使用 AskUserQuestion 工具：

```json
{
  "questions": [
    {
      "question": "YOLO 模式可以跳过权限确认，提升开发效率。推荐在开发环境中启用。注意：启用后，AI 执行命令时不再需要您确认。请确保您信任项目配置。是否启用 YOLO 模式？",
      "header": "YOLO模式",
      "multiSelect": false,
      "options": [
        {
          "label": "是，启用 YOLO 模式",
          "description": "配置 ~/.claude/settings.json 启用快速开发模式"
        },
        {
          "label": "否，保持安全模式",
          "description": "保持当前配置，每次操作需要确认"
        },
        {
          "label": "跳过，稍后手动配置",
          "description": "跳过此步骤，稍后手动配置"
        }
      ]
    }
  ]
}
```

### YOLO 模式配置方法

**方法1: 使用命令行参数启动（临时）**

```bash
claude --dangerously-skip-permissions
```

**方法2: 修改配置文件（永久生效）⭐ 推荐**

编辑 `~/.claude/settings.json`，添加以下配置：

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
> - 正确的配置项是 `permissions.defaultMode: "bypassPermissions"`
> - ❌ **错误**：`dangerouslySkipPermissions: true`（旧版，VSCode插件中不生效）
> - ✅ **正确**：`permissions.defaultMode: "bypassPermissions"`（新版，VSCode插件中生效）
>
> 如果配置文件已有其他内容，只需添加 `permissions` 部分即可，不要覆盖整个文件。

---

## 步骤 3: claude-hud 插件配置

### 检测逻辑

```bash
# 检查插件是否已安装
if [ -d "$HOME/.claude/plugins/marketplaces/claude-hud" ]; then
  echo "✅ claude-hud 插件已安装"
  HUD_INSTALLED=true
else
  echo "❌ claude-hud 插件未安装"
  HUD_INSTALLED=false
fi

# 检查配置是否存在
if grep -q "claude-hud" ~/.claude/settings.json 2>/dev/null; then
  echo "✅ claude-hud 配置已设置"
  HUD_CONFIGURED=true
else
  echo "❌ claude-hud 配置未设置"
  HUD_CONFIGURED=false
fi
```

### 交互式询问

**如果 claude-hud 未安装**，使用 AskUserQuestion 工具：

```json
{
  "questions": [
    {
      "question": "claude-hud 可以在输入框下方显示项目状态、任务进度等信息，提升开发体验。推荐度：⭐⭐⭐⭐⭐ 是否安装 claude-hud 插件？",
      "header": "插件安装",
      "multiSelect": false,
      "options": [
        {
          "label": "是，立即安装",
          "description": "安装 claude-hud 插件并配置"
        },
        {
          "label": "否，跳过此步骤",
          "description": "跳过插件安装，可稍后手动安装"
        }
      ]
    }
  ]
}
```

### 安装步骤

如果用户选择"是"，引导用户执行以下命令（在 Claude Code 输入框中执行，不是终端）：

```
# 第1步：添加 marketplace
/plugin marketplace add jarrodwatts/claude-hud

# 第2步：安装插件
/plugin install claude-hud

# 第3步：初始化配置
/claude-hud:setup
```

**重要提示**：

- 这些命令需要在 Claude Code 的输入框中执行
- 不是在终端中执行
- 执行后会自动配置 `~/.claude/settings.json`

### ⚠️ claude-hud 配置修正

**问题**：`/plugin install` 自动生成的配置可能使用 `hooks` 方式，但该文件路径不存在，导致插件无法正常工作。

**正确配置**（使用 `statusLine` 方式）：

```json
{
  "statusLine": {
    "type": "command",
    "command": "bash -c '\"/usr/bin/node\" \"$HOME/.claude/plugins/marketplaces/claude-hud/dist/index.js\"'"
  }
}
```

**错误配置示例**（不要使用）：

```json
{
  "plugins": ["claude-hud"],
  "hooks": {
    "user-prompt-submit": "node \"$HOME/.claude/plugins/marketplaces/claude-hud/dist/hooks/user-prompt-submit.js\""
  }
}
```

> ⚠️ 此配置中的 `dist/hooks/user-prompt-submit.js` 文件不存在，会导致插件失效。

**如果用户遇到配置问题**，引导用户手动修正 `~/.claude/settings.json`：

1. 删除 `plugins` 和 `hooks` 相关配置
2. 添加正确的 `statusLine` 配置
3. 重启 Claude Code 生效

---

## 步骤 4: 验证安装结果

在用户完成安装操作后，引导用户验证：

```bash
# 重新检查状态
echo "🔍 验证配置状态..."
echo ""

# 检查项目依赖
if [ -d "node_modules" ] && [ -f "package-lock.json" ]; then
  echo "✅ 项目依赖：已安装"
else
  echo "⚪ 项目依赖：未安装"
fi

# 检查 YOLO 模式（正确的配置项）
if grep -q '"defaultMode":.*"bypassPermissions"' ~/.claude/settings.json 2>/dev/null; then
  echo "✅ YOLO 模式：已启用"
else
  echo "⚪ YOLO 模式：未启用"
fi

# 检查 claude-hud
if [ -d "$HOME/.claude/plugins/marketplaces/claude-hud" ]; then
  echo "✅ claude-hud：已安装"
else
  echo "⚪ claude-hud：未安装"
fi

echo ""
echo "🎉 开发环境初始化完成！"
echo ""
echo "下一步："
echo "  1. 运行 'npm run dev' 启动开发服务器"
echo "  2. 访问 http://localhost:3000 查看应用"
```
