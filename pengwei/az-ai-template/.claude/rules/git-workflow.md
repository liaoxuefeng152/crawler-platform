# Git 工作流

## 📝 Git 原则

- **AI 编写代码，人类负责提交**
- **协作模式**: 人类(战略决策) → Claude Code(战术执行) → 人类(质量把控)

## 🔐 Git 权限控制

**Claude Code 已配置为禁止自动执行 Git 写入操作。**

### 允许的操作

- ✅ AI 可以读取 Git 状态（`git status`、`git log`、`git diff`）

### 禁止的操作

- ❌ AI **禁止**执行 Git 写入操作（`git add`、`git commit`、`git push`）

### 交互式确认流程

如需 Git 操作：
1. Claude 必须通过**交互式会话**与用户确认
2. 由用户手动执行 Git 命令

> 详细配置说明：[Git权限控制配置](./.claude/docs/claude/git-permissions-config.md)

## 🔄 工作流协调器（WorkflowCoordinator）

**WorkflowCoordinator** 是确保 9 阶段工作流完整执行的核心组件：

### 核心功能

- 📍 **状态跟踪**: 通过 `.az/workflow-state.json` 实时跟踪工作流状态
- 🔄 **自动继续**: 阶段完成后自动判断并进入下一阶段，防止工作流中断
- 🚧 **阻塞管理**: 记录和解决阻塞问题
- 📊 **进度可视化**: 随时查看工作流执行状态

### 关键脚本

- `.claude/skills/workflow-manager/scripts/workflow-coordinator.py` - 中央协调器
- `.claude/skills/workflow-manager/scripts/auto-continue.sh` - 自动继续检查
- `.az/workflow-state.json` - 工作流状态存储

### 使用示例

```bash
# 查看工作流状态
python3 .claude/skills/workflow-manager/scripts/workflow-coordinator.py --status

# 检查是否自动继续
python3 .claude/skills/workflow-manager/scripts/workflow-coordinator.py --auto-continue

# 标记阶段完成
python3 .claude/skills/workflow-manager/scripts/workflow-coordinator.py --complete Test
```
