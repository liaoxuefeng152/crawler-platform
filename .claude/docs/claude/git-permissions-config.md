# Git权限控制配置说明

## 📋 概述

本文档说明项目中Claude Code的Git操作权限配置，确保AI不能自动执行git add、commit、push等敏感操作。

---

## 🔒 配置文件位置

**主配置文件**: `.claude/settings.local.json`

**Hook脚本**: `.claude/hooks/prevent-git-write.sh`

**详细文档**: `.claude/docs/git-hooks-config.md`

---

## 🛡️ 权限配置详解

### 1. 核心权限模式

```json
"defaultMode": "respectPermissions"
```

- **之前**: `"bypassPermissions"` - 绕过所有权限检查
- **现在**: `"respectPermissions"` - 严格遵守权限配置

**影响**: AI现在必须遵守permissions.allow列表中的规则，不能随意执行任何命令。

### 2. Git读取权限（允许）

以下Git操作**允许**AI执行：

```json
"Bash(git status:*)"   // 查看Git状态
"Bash(git log:*)"      // 查看提交历史
"Bash(git diff:*)"     // 查看文件差异
```

**用途**: AI可以查看代码变更、提交历史，但**不能修改**Git状态。

### 3. Git写入权限（禁止）

以下Git操作**明确禁止**AI执行：

```json
"gitPermissions": {
  "allowAdd": false,      // ❌ 禁止 git add
  "allowCommit": false,   // ❌ 禁止 git commit
  "allowPush": false,     // ❌ 禁止 git push
  "allowPull": false,     // ❌ 禁止 git pull
  "allowRead": true       // ✅ 允许读取操作
}
```

### 4. 确认机制（交互式会话）

Claude Code被配置为**禁止自动执行**任何Git写入操作。如果需要执行Git操作，必须遵循以下流程：

```json
"requireConfirmation": {
  "gitAdd": "Git add操作需要与用户交互式确认",
  "gitCommit": "Git commit操作需要与用户交互式确认",
  "gitPush": "Git push操作需要与用户交互式确认"
}
```

**交互式确认流程**：
1. AI检测到需要执行Git操作
2. AI通过对话向用户说明要执行的Git命令
3. 用户明确同意后，**由用户手动执行**Git命令
4. AI**绝对不能**自动执行git add/commit/push

**示例对话**：
```
AI: "代码已完成开发和测试。现在需要提交代码，请手动执行以下命令：
    git add .
    git commit -m 'feat: 添加用户管理功能'
    git push

    您是否已手动执行这些命令？"
用户: "是的，已执行"
AI: "好的，提交完成。我们可以继续下一阶段开发"
```

### 5. Hooks实时拦截（新增✨）

```json
"hooks": {
  "PreToolUse": [
    {
      "matcher": "Bash",
      "hooks": [
        {
          "type": "command",
          "command": "./.claude/hooks/prevent-git-write.sh"
        }
      ]
    }
  ]
}
```

**功能**：
- 🔍 实时监控所有Bash命令执行
- 🚫 自动检测并阻止Git写入操作
- 💬 提供友好的阻止消息和正确流程指导

**工作流程**：
```
AI尝试执行: git commit -m "..."
    ↓
PreToolUse Hook触发
    ↓
prevent-git-write.sh执行
    ↓
检测到git commit → 返回block决定
    ↓
AI收到阻止提示 + 显示友好消息
```

> 💡 **详细说明**: [Claude Code Hooks完整方案](.claude/docs/git-hooks-config.md)

---

## 📊 权限对比

### 配置前 vs 配置后

| 操作 | 配置前 | 配置后 | 说明 |
|------|--------|--------|------|
| **git status** | ✅ 允许 | ✅ 允许 | 查看状态，无风险 |
| **git log** | ✅ 允许 | ✅ 允许 | 查看历史，无风险 |
| **git diff** | ✅ 允许 | ✅ 允许 | 查看差异，无风险 |
| **git add** | ✅ 允许（绕过权限） | ❌ 禁止（Hooks拦截） | **需要手动执行** |
| **git commit** | ✅ 允许（绕过权限） | ❌ 禁止（Hooks拦截） | **需要手动执行** |
| **git push** | ✅ 允许（绕过权限） | ❌ 禁止（Hooks拦截） | **需要手动执行** |
| **git pull** | ✅ 允许（绕过权限） | ❌ 禁止（Hooks拦截） | **需要手动执行** |

### 三层防护机制（新增）

| 防护层 | 配置项 | 作用 |
|-------|-------|------|
| 🛡️ **第一层** | `defaultMode: "respectPermissions"` | 强制遵守权限列表 |
| 🔒 **第二层** | `gitPermissions: {allowAdd: false, ...}` | Git操作细粒度控制 |
| ⚡ **第三层** | `hooks.PreToolUse` | 实时拦截 + 友好消息 |

---

## 🚨 为什么需要这些限制？

### 1. 防止意外提交
AI可能会在开发过程中自动提交不完整的代码，导致：
- 提交信息不规范
- 代码未经过完整测试
- 提交频率过高，污染Git历史

### 2. 保持代码审查流程
- 用户需要审查AI生成的代码
- 确保代码质量符合标准
- 手动测试关键功能后再提交

### 3. 避免误操作推送
- 防止未完成的代码被推送到远程仓库
- 避免破坏团队协作流程
- 保持远程仓库的稳定性

### 4. 确保人类主导权
- Git操作应该是**有意识的人类决策**
- 提交应该有明确的意图和规范的信息
- 推送前应该进行代码审查
- **AI不能替代人类的战略判断**

---

## 📝 正确的工作流程

### AI + 用户协作流程

1. **AI开发阶段**
   - ✅ AI可以编写代码
   - ✅ AI可以查看Git状态
   - ✅ AI可以运行测试
   - ❌ AI不能提交代码

2. **用户审查阶段**
   - 👤 用户审查AI生成的代码
   - 👤 用户运行测试验证功能
   - 👤 用户检查代码质量

3. **用户提交阶段**
   - 👤 用户手动执行 `git add`
   - 👤 用户手动执行 `git commit`
   - 👤 用户编写规范的提交信息
   - 👤 用户手动执行 `git push`（需要时）

### 示例对话

**❌ 错误做法**（AI自动提交）:
```
用户: "修复登录bug"
AI: [自动执行] git add .
     [自动执行] git commit -m "fix: 修复登录bug"
     [自动执行] git push
```

**✅ 正确做法**（交互式确认 + 用户手动执行）:
```
用户: "修复登录bug"
AI: [编写代码] 已修复登录bug，修改了以下文件...
    [运行测试] 测试通过
    [交互式确认] 代码已准备就绪。请手动执行以下命令提交代码：
                    git add app/login/page.tsx
                    git commit -m "fix: 修复登录bug"
                    git push

                    执行完成后请告诉我。
用户: [手动执行] git add app/login/page.tsx
     [手动执行] git commit -m "fix: 修复登录bug"
     [手动执行] git push
用户: "已执行完成"
AI: 好的，提交成功。我们可以继续下一项任务...
```

---

## 🔧 如何调整权限？

### 临时允许AI提交（不推荐）

如果需要临时允许AI执行Git操作，修改配置：

```json
"gitPermissions": {
  "allowAdd": true,      // 临时允许
  "allowCommit": true,   // 临时允许
  "allowPush": false,    // 仍然禁止推送
  "allowPull": false
}
```

**注意**: 完成后立即改回 `false`！

### 恢复默认宽松配置（不推荐）

```json
"defaultMode": "bypassPermissions"
```

**警告**: 这会让AI可以执行任何命令，包括危险的Git操作！

---

## 📖 相关文档

- **🔧 Hooks完整方案**: [.claude/docs/git-hooks-config.md](.claude/docs/git-hooks-config.md)
- **📘 项目开发指南**: [CLAUDE.md](../../CLAUDE.md)
- **📋 Git工作流最佳实践**: [Git Workflow Guide](./git-workflow-guide.md)

---

## ✅ 验证配置是否生效

### 测试步骤

#### 1️⃣ 检查Hook加载状态

在Claude Code中执行：
```
/hooks
```

**预期输出**：应该看到 `PreToolUse` hook 已加载

#### 2️⃣ 测试Git写入操作被阻止

```
用户: "执行 git add ."
AI: [Hook阻止] 🚫 Git写入操作被阻止：根据项目配置，AI不能自动执行git add/commit/push操作。

    📋 正确流程：
    1. AI负责编写代码
    2. 您负责审查代码质量
    3. 您手动执行Git操作

    请手动执行以下命令：
      git add .

    🔗 配置说明：.claude/docs/claude/git-permissions-config.md
```

#### 3️⃣ 测试Git读取操作正常

```
用户: "查看 git status"
AI: [正常执行]
    On branch test-run4
    Changes not staged for commit...
```

### 预期结果

- ✅ AI可以执行 `git status`
- ✅ AI可以执行 `git log`
- ✅ AI可以执行 `git diff`
- ❌ AI不能执行 `git add` （Hook拦截）
- ❌ AI不能执行 `git commit` （Hook拦截）
- ❌ AI不能执行 `git push` （Hook拦截）
- 💬 所有阻止操作都有友好的提示消息

---

## 🎯 总结

### 核心原则

1. **AI辅助开发，人类战略决策**
   - AI负责编写代码
   - 人类负责审查和提交
   - **Git操作必须通过交互式会话确认**

2. **Git操作需要明确意图**
   - 每次提交都应该有明确的目的
   - 提交信息应该规范且有意义
   - **AI不能替人类做Git决策**

3. **安全第一**
   - 防止意外操作
   - 保持代码库的稳定性
   - **人类保持对Git的完全控制权**

### 配置要点

- ✅ `defaultMode: "respectPermissions"` - 严格遵守权限
- ✅ `allowAdd: false` - 禁止自动添加
- ✅ `allowCommit: false` - 禁止自动提交
- ✅ `allowPush: false` - 禁止自动推送
- ✅ `allowRead: true` - 允许查看状态

---

**配置生效时间**: 立即生效（重启Claude Code后）

**维护者**: 项目配置管理员

**更新日期**: 2025-12-29
