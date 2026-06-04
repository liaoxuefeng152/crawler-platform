# GitHub Actions CI 配置说明

## 📋 概述

项目已配置GitHub Actions CI工作流，用于在PR和Push时自动检查组件skill文档的完整性。

## 🎯 工作流触发条件

### 自动触发

**Push事件**：
- 推送到 `main` 分支
- 推送到 `develop` 分支

**Pull Request事件**：
- PR打开到 `main` 或 `develop`
- PR有新的提交（synchronize）
- PR重新打开（reopened）

### 工作流文件

`.github/workflows/component-skills-check.yml`

## 🔍 CI检查流程

### 执行步骤

```
1. 📥 Checkout代码
   ↓
2. 🔧 设置Node.js环境
   ↓
3. 📦 安装依赖
   ↓
4. 🔍 检查组件skill文档完整性
   ↓
5. 💬 PR评论（如果检查失败）
   ↓
6. ✅ 检查通过（如果所有文档存在）
```

### 检查逻辑

```bash
# 1. 查找所有组件文件
find components -name "*.tsx" -type f

# 2. 检查每个组件的skill文档
for component in components; do
  skill_doc=$(find .claude/skills/component-library -name "SKILL.md")

  if [ -z "$skill_doc" ]; then
    missing_count++
  fi
done

# 3. 如果缺少文档，CI失败
if [ $missing_count -gt 0 ]; then
  exit 1
fi
```

## 📊 CI执行结果

### ✅ 成功场景

**GitHub Actions Summary**：

```markdown
## ✅ 组件Skill文档检查报告

### 🎉 检查通过

所有组件都有对应的skill文档支持。
```

**Actions日志**：

```
✅ 所有组件文档检查通过
```

### ❌ 失败场景

**PR自动评论**：

```markdown
## 🔍 组件Skill文档检查报告

### ❌ 检查未通过

发现 **2** 个组件缺少skill文档：

- my-awesome-card (components/ui/my-awesome-card.tsx)
- custom-button (components/ui/custom-button.tsx)

### 💡 解决方案

1. **参考组件开发检查清单创建skill文档**
   ```bash
   # 核心组件使用skill-creator
   python3 .claude/skills/skill-creator/scripts/init_skill.py [component-name] \
     --path .claude/skills/component-library/[category]

   # 简单组件复制模板
   mkdir -p .claude/skills/component-library/[category]/[component-name]
   cp .claude/skills/component-library/SKILL_TEMPLATE.md \
      .claude/skills/component-library/[category]/[component-name]/SKILL.md
   ```

2. **更新L1索引**
   ```bash
   # 编辑 .claude/skills/component-library-guide/SKILL.md
   # 在"核心组件详解"或"按功能快速查找"中添加新组件索引
   ```

3. **验证文档完整性**
   ```bash
   npm run check:component-skills
   ```

### 📚 相关文档

- [组件开发检查清单.claude/docs/development/COMPONENT_DEVELOPMENT_CHECKLIST.md)
- [Skill模板](/.claude/skills/component-library/SKILL_TEMPLATE.md)
- [Git Hooks指南.claude/docs/development/GIT_HOOKS_GUIDE.md)

---

💬 **自动化检查**: 此评论由GitHub Actions自动生成。
```

**Actions日志**：

```
🚫 发现 2 个组件缺少skill文档

💡 解决方案：
   1. 参考组件开发检查清单创建skill文档
   2. 核心组件使用: python3 .claude/skills/skill-creator/scripts/init_skill.py
   3. 简单组件复制模板: .claude/skills/component-library/SKILL_TEMPLATE.md
   4. 更新L1索引: .claude/skills/component-library-guide/SKILL.md

📚 详细文档: .claude/docs/development/COMPONENT_DEVELOPMENT_CHECKLIST.md
Error: Process completed with exit code 1.
```

## 🔧 配置详解

### 工作流文件结构

```yaml
name: Component Skills Documentation Check

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  component-skills-check:
    runs-on: ubuntu-latest
    steps:
      - Checkout代码
      - 设置Node.js环境
      - 安装依赖
      - 检查组件文档
      - PR评论（失败时）
      - 检查通过（成功时）
```

### 权限配置

```yaml
permissions:
  contents: read        # 读取代码
  pull-requests: write  # 在PR中创建评论
```

### 自定义触发条件

**仅对PR检查**：

```yaml
on:
  pull_request:
    branches: [main, develop]
```

**排除特定分支**：

```yaml
on:
  push:
    branches:
      - main
      - develop
      - '!hotfix/**'  # 排除hotfix分支
```

**按路径过滤**：

```yaml
on:
  pull_request:
    paths:
      - 'components/**.tsx'      # 仅当组件文件变更时
      - '.claude/skills/**'      # 或skill文档变更时
```

## 🛠️ 本地测试CI逻辑

### 使用act工具（本地运行GitHub Actions）

```bash
# 安装act
brew install act  # macOS
# 或
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# 运行workflow
act pull_request

# 查看所有jobs
act -l
```

### 手动执行检查脚本

```bash
# 直接运行检查逻辑
bash -c '
  component_files=$(find components -name "*.tsx" -type f)
  for file in $component_files; do
    component_name=$(basename "$file" .tsx)
    skill_doc=$(find .claude/skills/component-library -name "${component_name}/SKILL.md")
    if [ -z "$skill_doc" ]; then
      echo "❌ 缺少文档: $component_name"
    fi
  done
'
```

## 📈 CI状态徽章

### 添加到README.md

```markdown
![Component Skills Check](https://github.com/username/repo/actions/workflows/component-skills-check.yml/badge.svg)
```

### 示例

```markdown
# 深瞳AI Coding

![Component Skills Check](https://github.com/template/template/actions/workflows/component-skills-check.yml/badge.svg)

> AI辅助开发项目，完整的组件文档自动化维护系统
```

## 🔔 通知配置

### Slack通知

在workflow中添加Slack步骤：

```yaml
- name: 🔔 Slack通知
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: '组件文档检查失败，请检查PR'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Email通知

GitHub默认会发送通知给PR创建者。

## 🚀 高级用法

### 定期执行（每日检查）

```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # 每天00:00执行
  push:
    branches: [main]
```

### 矩阵测试（多Node版本）

```yaml
strategy:
  matrix:
    node-version: [18, 20, 22]
steps:
  - uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.node-version }}
```

### 缓存优化

```yaml
- name: 💾 缓存node_modules
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

## 🔍 故障排查

### CI不执行

**问题**：PR或push没有触发CI

**检查项**：
1. Workflow文件路径：`.github/workflows/component-skills-check.yml`
2. 分支名称：是否匹配 `main` 或 `develop`
3. YAML语法：使用在线工具验证

### 误报（文档存在但报缺失）

**问题**：组件有文档但CI报告缺失

**原因**：文档路径或命名不匹配

**解决方案**：
```bash
# 检查组件名称
basename components/ui/my-card.tsx .tsx  # my-card

# 检查文档路径
find .claude/skills/component-library -name "my-card/SKILL.md"

# 确保路径一致
# 组件：components/ui/my-card.tsx
# 文档：.claude/skills/component-library/ui/my-card/SKILL.md
```

### PR评论未创建

**问题**：CI失败但没有PR评论

**检查权限**：
1. Workflow权限：`pull-requests: write`
2. GitHub Token权限：在仓库设置中确认

## 📚 相关文档

- **组件开发检查清单**：`.claude/docs/development/COMPONENT_DEVELOPMENT_CHECKLIST.md`
- **Git Hooks指南**：`.claude/docs/development/GIT_HOOKS_GUIDE.md`
- **验证脚本**：`scripts/verify-component-skills.sh`
- **GitHub Actions文档**：https://docs.github.com/en/actions

## 🎯 最佳实践

1. **不要禁用CI**：CI是质量保证的重要环节
2. **及时修复失败**：CI失败时应立即修复，不要绕过
3. **保持CI快速**：优化依赖安装和检查逻辑
4. **清晰的错误信息**：确保CI输出易于理解和修复
5. **团队协作**：所有团队成员都应了解CI流程

## 🔄 与Git Hooks的配合

### 三层保护机制

```
┌─────────────────────────────────────────────┐
│ Layer 1: 开发时检查         │
│   - 本地pre-commit hook                      │
│   - 提交前检查暂存区组件                      │
│   - 阻止无文档的提交                          │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Layer 2: CI检查（本workflow）                 │
│   - GitHub Actions自动执行                   │
│   - PR时检查所有组件                          │
│   - 失败时阻止merge并评论                     │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Layer 3: 定期审查              │
│   - 每月自动检查所有组件                       │
│   - 创建GitHub Issue提醒                      │
│   - 确保文档长期保持最新                       │
└─────────────────────────────────────────────┘
```

### 协同工作流程

```
开发者修改组件
    ↓
Layer 1: Git Hook检查（本地）
    ↓ 阻止提交
    ↓ 补充文档后重新提交
    ↓ 推送到远程
    ↓
Layer 2: GitHub Actions检查（远程）
    ↓ PR检查失败
    ↓ 添加评论指导修复
    ↓ 修复后重新push
    ↓ CI通过
    ↓ 合并到主分支
    ↓
Layer 3: 定期审查（每月）
    ↓ 发现过时文档
    ↓ 创建Issue提醒更新
    ↓ 开发者更新文档
```

---

**最后更新**：2025-12-23
**维护者**：架构专家 + 前端专家团队
