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

## 🔀 Git 合并规则

### 核心原则

| 原则 | 说明 |
|------|------|
| **先备份再合并** | 创建备份分支保存完整本地 commit 历史 |
| **保留 commit 历史** | 使用 rebase/merge，避免 stash（只保存工作区） |
| **可回滚机制** | 备份分支可随时恢复完整内容 |
| **合并后验证** | 检查 commit 数量和关键文件完整性 |

### 合并流程（6步骤）

| 步骤 | 操作 | 目的 |
|------|------|------|
| 1. 创建备份 | `git branch backup-{timestamp}` | 保存完整本地状态 |
| 2. 记录状态 | 创建 `.az/merge-state.json` | 记录备份分支名、commit列表 |
| 3. 分析差异 | 对比本地 vs 远程 | 标注冲突类型（功能/配置/样式） |
| 4. 交互确认 | AskUserQuestion 逐文件选择 | 人工决定合并策略 |
| 5. 执行合并 | rebase 或手动合并 | 保留 commit 历史 |
| 6. 验证结果 | 检查 commit 数量 + build | 确保内容完整 |

### 状态文件（.az/merge-state.json）

记录以下关键信息：备份分支名、本地 commit 列表、冲突文件清单、合并状态。

### 回滚机制

**合并失败或内容丢失时**：
- `git reset --hard backup-{timestamp}` — 恢复到备份状态
- `git checkout backup-{timestamp}` — 查看备份内容

**清理时机**：推送成功后再删除备份分支。

### 禁止行为

- ❌ 不创建备份直接合并
- ❌ 使用 stash（会丢失 commit 历史）
- ❌ 自动选择合并策略
- ❌ 合并后自动推送
- ❌ 推送前删除备份
