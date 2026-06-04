---
description: 初始化项目开发环境，检查并配置 Claude Code、项目依赖和必要插件
---

## 执行说明

本命令将调用 `az-init` skill 完成项目开发环境的完整初始化。

**立即执行**：

```bash
/az-init
```

或者直接说："初始化项目"、"配置开发环境"

---

## 功能概述

az-init skill 提供 **7步骤自动化配置**：

1. **项目配置** - 交互式配置产品首页名称和表名前缀
2. **依赖检查** - 检查并安装项目依赖
3. **YOLO模式** - 检查并引导启用快速开发模式
4. **插件安装** - 检查并安装claude-hud插件
5. **配置验证** - 验证所有配置完成
6. **Git连接** - 询问并配置远程仓库连接
7. **完成总结** - 显示配置结果和下一步操作

---

## 详细文档

完整流程和详细说明请参考：

- **Skill主文件**：`.claude/skills/az-init/SKILL.md`
- **交互式配置**：`.claude/skills/az-init/references/interactive-configuration.md`
- **Git工作流**：`.claude/skills/az-init/references/git-workflow.md`