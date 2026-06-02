# Git Hooks 配置说明

## 📋 概述

项目已配置Husky + 自定义pre-commit hook，用于自动检查组件skill文档的完整性。

## 🔧 安装

Husky已经通过npm安装并初始化：

```bash
npm install --save-dev husky
npx husky init
```

## 🎯 Pre-commit Hook 功能

### 自动检查组件文档

当提交包含组件文件（`components/*.tsx`）的变更时，pre-commit hook会自动：

1. **扫描暂存区**：检查所有新增或修改的.tsx组件文件
2. **验证文档存在**：查找对应的skill文档
   - 路径：`.claude/skills/component-library/[component-name]/SKILL.md`
   - 或：`.claude/skills/component-library/[component-name].skill`
3. **阻止提交**：如果发现组件缺少skill文档，阻止提交并给出提示

### Hook 执行流程

```
git commit
    ↓
pre-commit hook 触发
    ↓
扫描暂存区的组件文件
    ↓
检查每个组件的skill文档
    ↓
所有文档存在 → 允许提交
缺少文档 → 阻止提交并显示帮助信息
```

## 📝 Hook 输出示例

### ✅ 成功场景

```bash
$ git commit -m "feat: update button component"
🔍 检查组件skill文档完整性...
📦 发现以下组件文件变更:
components/ui/button.tsx

✅ button: 已找到skill文档

✅ 所有组件文档检查通过
[main abc1234] feat: update button component
```

### ❌ 失败场景

```bash
$ git commit -m "feat: add new card component"
🔍 检查组件skill文档完整性...
📦 发现以下组件文件变更:
components/ui/my-card.tsx

❌ 缺少skill文档: my-card
   组件文件: components/ui/my-card.tsx
   请参考 COMPONENT_DEVELOPMENT_CHECKLIST.md 创建skill文档

🚫 提交被阻止：发现 1 个组件缺少skill文档

💡 解决方案：
   1. 参考组件开发检查清单创建skill文档
   2. 核心组件使用: python3 .claude/skills/skill-creator/scripts/init_skill.py
   3. 简单组件复制模板: .claude/skills/component-library/SKILL_TEMPLATE.md
   4. 更新L1索引: .claude/skills/component-library-guide/SKILL.md

📚 详细文档: .claude/docs/development/COMPONENT_DEVELOPMENT_CHECKLIST.md
```

## 🛠️ 手动测试Hook

### 测试当前暂存区

```bash
# 直接运行pre-commit hook
.husky/pre-commit
```

### 模拟提交测试

```bash
# 暂存一个组件文件
git add components/ui/test-component.tsx

# 尝试提交（会被阻止）
git commit -m "test"
```

## 🔍 Hook 脚本详情

### 文件位置

`.husky/pre-commit`

### 核心逻辑

```bash
# 1. 获取暂存区的组件文件
component_files=$(git diff --cached --name-only --diff-filter=ACM | grep -E '^components/.*\.tsx$')

# 2. 检查每个组件的skill文档
for file in $component_files; do
  component_name=$(basename "$file" .tsx)
  skill_doc=$(find .claude/skills/component-library -name "${component_name}/SKILL.md")

  if [ -z "$skill_doc" ]; then
    missing_docs=$((missing_docs + 1))
  fi
done

# 3. 如果缺少文档，阻止提交
if [ $missing_docs -gt 0 ]; then
  exit 1
fi
```

## ⚙️ 配置修改

### 禁用Hook（临时）

```bash
# 使用--no-verify标志跳过hook
git commit --no-verify -m "message"
```

⚠️ **警告**：不推荐在生产环境中跳过文档检查

### 修改Hook检查范围

编辑 `.husky/pre-commit`，修改组件文件匹配模式：

```bash
# 当前：仅检查components/目录下的.tsx文件
grep -E '^components/.*\.tsx$'

# 示例：检查所有src/目录下的组件
grep -E '^src/components/.*\.tsx$'
```

### 添加额外检查

在 `.husky/pre-commit` 中添加其他验证：

```bash
# 在exit 0之前添加
# 示例：运行ESLint
npm run lint:fix

# 示例：运行类型检查
npm run type-check
```

## 🔧 故障排查

### Hook 不执行

**问题**：提交时hook没有运行

**解决方案**：
```bash
# 1. 检查文件权限
ls -la .husky/pre-commit
# 应该显示：-rwxrwxr-x

# 2. 重新设置权限
chmod +x .husky/pre-commit

# 3. 重新安装husky
npm uninstall husky
npm install --save-dev husky
npx husky install
```

### Hook 总是失败

**问题**：即使有文档也提示缺少

**解决方案**：
```bash
# 1. 检查文档路径是否正确
find .claude/skills/component-library -name "SKILL.md"

# 2. 检查组件名称是否匹配
# 组件文件：components/ui/my-card.tsx
# 应查找：.claude/skills/component-library/**/my-card/SKILL.md

# 3. 手动测试hook
bash .husky/pre-commit
```

### 需要 更新文档模板

如果组件文档路径变更，需要同步更新：
1. `.husky/pre-commit` - Hook检查逻辑
2. `.claude/docs/development/COMPONENT_DEVELOPMENT_CHECKLIST.md` - 开发流程
3. `.claude/skills/component-library/SKILL_TEMPLATE.md` - 文档模板

## 📚 相关文档

- **组件开发检查清单**：`.claude/docs/development/COMPONENT_DEVELOPMENT_CHECKLIST.md`
- **Skill模板**：`.claude/skills/component-library/SKILL_TEMPLATE.md`
- **验证脚本**：`scripts/verify-component-skills.sh`

## 🎯 最佳实践

1. **不要跳过Hook**：避免使用 `--no-verify`，除非确实必要
2. **及时更新文档**：组件变更时同步更新skill文档
3. **定期验证**：使用 `npm run check:component-skills` 定期检查所有组件
4. **团队协作**：确保所有团队成员都安装了husky（`npm install`）

## 🚀 下一步

配置GitHub Actions CI以在PR时自动检查组件文档完整性：

```bash
# 创建GitHub Actions workflow
# 参见：.github/workflows/component-skills-check.yml
```

---

**最后更新**：2025-12-23
**维护者**：架构专家 + 前端专家团队
