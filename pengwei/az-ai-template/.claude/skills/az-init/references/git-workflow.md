# Git 远程连接详细流程

本文档包含az-init步骤5的Git远程连接完整流程。

> ⚠️ **关键**：步骤4完成后，**必须**执行此步骤询问用户。不能跳过！

---

## 第一步：询问是否需要 Git 连接（必须执行）

**立即使用 AskUserQuestion 工具**，参数如下：

```json
{
  "questions": [
    {
      "question": "是否需要连接远程 Git 仓库并推送代码？",
      "header": "Git 推送",
      "multiSelect": false,
      "options": [
        {
          "label": "是，连接并推送",
          "description": "远程仓库会自动创建，首次推送使用 commit 信息 [vendor]:init"
        },
        {
          "label": "否，稍后手动操作",
          "description": "跳过此步骤，显示手动操作指南"
        }
      ]
    }
  ]
}
```

---

## 第二步：根据用户选择执行

### 如果用户选择"否，稍后手动操作"

显示以下内容，然后**结束流程**：

```markdown
📋 手动 Git 操作指南

# 步骤1：提交变更
git add project.config.json project.config.schema.json package.json package-lock.json prisma/schema.prisma prisma/schema.template.prisma
git commit -m "[vendor]:init"

# 步骤2：配置远程仓库（替换 {项目名} 为实际项目名）
git remote remove origin
git remote add origin https://git.dev.azshentong.com/shentong/quiz-projects/{项目名}.git

# 步骤3：推送代码（仓库会自动创建）
git push -u origin main
```

### 如果用户选择"是，连接并推送"

继续执行第三步。

---

## 第三步：询问 Git 仓库地址（必须执行）

> ⚠️ **关键**：**没有任何默认地址的概念**，必须由用户明确提供完整的 Git 仓库地址！

**立即使用 AskUserQuestion 工具**，参数如下：

```json
{
  "questions": [
    {
      "question": "请输入完整的 Git 仓库地址（必须在 Other 中输入）",
      "header": "Git 地址",
      "multiSelect": false,
      "options": [
        {
          "label": "我将在 Other 中输入地址",
          "description": "请在 Other 选项中输入完整的 Git 仓库 URL，例如：https://git.dev.azshentong.com/shentong/quiz-projects/xxx.git"
        },
        {
          "label": "跳过，稍后手动操作",
          "description": "不提供地址，显示手动操作指南"
        }
      ]
    }
  ]
}
```

### 处理逻辑

1. **如果用户选择"跳过，稍后手动操作"或未在 Other 中输入有效地址**：
   - 显示手动操作指南
   - 结束 Git 推送流程

2. **如果用户在 Other 中输入了完整地址**：
   - 使用用户提供的地址继续执行第四步

> 🚨 **禁止行为**：
> - ❌ 禁止自动构造 Git 地址（如基于项目名拼接）
> - ❌ 禁止使用任何"默认格式"
> - ❌ 禁止猜测用户想要的地址
> - ✅ 必须使用用户明确输入的完整地址

---

## 第四步：检测远程仓库状态并推送（关键安全步骤）

> ⚠️ **安全要求**：推送前必须检测远程仓库状态，防止意外覆盖或数据丢失！

### 4.0 检测远程仓库状态（必须执行）

**在推送之前，必须执行以下检测**：

```bash
# 1. 配置远程仓库（先配置才能检测）
git remote remove origin 2>/dev/null || true
git remote add origin {用户提供的Git地址}

# 2. 获取远程仓库信息
git fetch origin 2>/dev/null || true

# 3. 检测远程main分支是否存在
REMOTE_EXISTS=$(git rev-parse origin/main 2>/dev/null && echo "true" || echo "false")

# 4. 检测远程提交数量
if [ "$REMOTE_EXISTS" = "true" ]; then
  REMOTE_COMMITS=$(git rev-list --count origin/main 2>/dev/null || echo "0")
  echo "⚠️ 远程仓库已有内容：$REMOTE_COMMITS 个提交"
else
  echo "✅ 远程仓库为空或不存在"
fi
```

### 4.1 根据检测结果选择处理方式

**情况A：远程仓库为空或不存在**
```bash
# 直接推送
git push -u origin main
```

**情况B：远程仓库已有内容（危险！）**

**必须使用 AskUserQuestion 询问用户**：

```json
{
  "questions": [
    {
      "question": "⚠️ 检测到远程仓库已有内容！这可能是一个已存在的项目，推送可能导致数据覆盖或冲突。请选择处理方式：",
      "header": "远程仓库",
      "multiSelect": false,
      "options": [
        {
          "label": "跳过推送，手动处理",
          "description": "推荐：不执行推送，显示手动操作指南，由用户自己决定如何处理"
        },
        {
          "label": "合并远程代码后推送",
          "description": "执行 git pull --rebase 合并远程代码，可能需要解决冲突"
        },
        {
          "label": "强制推送（危险）",
          "description": "⚠️ 执行 git push -f 会覆盖远程所有代码，此操作不可逆！"
        }
      ]
    }
  ]
}
```

### 4.2 提交本地变更

```bash
# 添加变更文件（包含新的 project.config.json）
git add project.config.json project.config.schema.json package.json package-lock.json prisma/schema.prisma prisma/schema.template.prisma

# 创建提交
git commit -m "[vendor]:init

- 配置项目名称和表名前缀
- 创建 project.config.json 统一配置文件
- 重新生成 Prisma Schema"
```

### 4.3 执行推送（根据用户选择）

**如果用户选择"跳过推送，手动处理"**：
```markdown
📋 手动 Git 操作指南

检测到远程仓库已有内容，建议您手动处理：

# 步骤1：查看远程仓库状态
git remote -v
git fetch origin
git log origin/main --oneline -10

# 步骤2：根据情况选择操作
# 选项A：合并远程代码
git pull --rebase origin main
git push -u origin main

# 选项B：强制推送（覆盖远程，谨慎使用！）
git push -f origin main
```

**如果用户选择"合并远程代码后推送"**：
```bash
# 拉取并rebase
git pull --rebase origin main

# 如果有冲突，提示用户解决
if [ $? -ne 0 ]; then
  echo "❌ 合并冲突，请手动解决后执行："
  echo "  git rebase --continue"
  echo "  git push -u origin main"
  exit 1
fi

# 推送
git push -u origin main
```

**如果用户选择"强制推送（危险）"**：
```bash
# 再次警告
echo "⚠️ 警告：即将执行强制推送，远程仓库内容将被完全覆盖！"
echo "此操作不可逆，请确认您的选择。"

# 执行强制推送
git push -f origin main
```

---

## 第五步：处理推送失败

### 场景 1: Git 写入被安全规则限制

如果失败且错误信息包含"被规则限制"或类似内容：

**使用 AskUserQuestion 询问用户**：

```json
{
  "questions": [
    {
      "question": "Git 操作被安全规则限制。是否强制让 AI 执行？",
      "header": "强制执行",
      "multiSelect": false,
      "options": [
        {
          "label": "是，强制执行",
          "description": "AI 将继续执行 Git 操作"
        },
        {
          "label": "否，显示手动指南",
          "description": "显示手动操作指南，由用户自己执行"
        }
      ]
    }
  ]
}
```

- 如果用户选择"是"，继续执行
- 如果用户选择"否"，显示手动操作指南

### 场景 2: main 分支受保护（禁止 force push）

如果 force push 被拒绝：

```bash
# 方案：创建新的空 commit 然后正常推送
git commit --allow-empty -m "[vendor]:init"
git push origin main
```

### 场景 3: 推送时发现远程有新提交（non-fast-forward）

**注意**：此场景应该在步骤4.0已经被检测到并询问用户。如果仍然出现此错误：

```bash
# 方案：提示用户选择处理方式
echo "❌ 远程仓库有新的提交，无法直接推送"
echo "请选择："
echo "  1. 执行 git pull --rebase origin main 合并后重试"
echo "  2. 执行 git push -f origin main 强制推送（覆盖远程）"
```

### 场景 4: 认证失败或权限不足

```bash
echo "❌ Git 认证失败或权限不足"
echo "请检查："
echo "  1. SSH密钥是否已配置"
echo "  2. 是否有仓库写入权限"
echo "  3. 仓库地址是否正确"
```

---

## 第六步：推送成功总结

推送成功后，显示：

```markdown
✅ Git 推送完成！

📊 推送结果：
┌───────────────┬─────────┬────────────────────┐
│     操作      │  状态   │        说明        │
├───────────────┼─────────┼────────────────────┤
│ 提交变更      │ ✅ 完成 │ Commit: [vendor]:init │
├───────────────┼─────────┼────────────────────┤
│ 配置远程仓库  │ ✅ 完成 │ {仓库地址}          │
├───────────────┼─────────┼────────────────────┤
│ 推送代码      │ ✅ 完成 │ main 分支已推送    │
└───────────────┴─────────┴────────────────────┘

🔗 仓库地址：{仓库URL}

📌 重要提示：
- 远程仓库已自动创建（私有项目）
- CI/CD 将自动触发构建（如果配置了）
```

---

## 手动操作完整指南

如果用户选择手动操作，提供以下完整指南：

```bash
# ============================================
# Git 手动操作完整指南
# ============================================

# 步骤1：查看当前状态
git status

# 步骤2：添加变更文件
git add project.config.json project.config.schema.json package.json package-lock.json prisma/schema.prisma prisma/schema.template.prisma

# 步骤3：创建提交
git commit -m "[vendor]:init"

# 步骤4：查看远程仓库配置
git remote -v

# 步骤5：配置远程仓库（如果需要修改）
git remote remove origin
git remote add origin https://git.dev.azshentong.com/shentong/quiz-projects/你的项目名.git

# 步骤6：推送到远程
git push -u origin main

# 如果推送失败，尝试以下方案：
# 方案A：拉取远程更新后合并
git pull origin main --rebase
git push origin main

# 方案B：强制推送（谨慎使用）
git push -f origin main
```

---

## 安全注意事项

### 多用户协作场景

| 场景 | 建议 |
|------|------|
| 从已有仓库克隆的项目 | 不建议运行Git步骤 |
| 多人协作项目 | 只有项目负责人执行Git初始化 |
| 检测到已有远程仓库 | 默认不修改配置 |

### 安全检查

在执行Git操作前，检查以下内容：

1. **检查远程仓库状态**：
   ```bash
   git remote -v
   git fetch origin
   git log origin/main --oneline -5
   ```

2. **检查是否有未提交的更改**：
   ```bash
   git status
   ```

3. **确认推送地址正确**：
   ```bash
   git remote get-url origin
   ```