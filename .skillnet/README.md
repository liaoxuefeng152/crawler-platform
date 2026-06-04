# SkillNet MCP 集成指南

## 📋 概述

本项目集成了 **skill-mcp** - 一个本地技能管理系统，支持：
- ✅ 本地技能导入和管理
- ✅ 版本控制和回滚
- ✅ RBAC权限管理
- ✅ Pipeline编排（DAG）
- ✅ MCP协议对接

## 🗂️ 目录结构

```
.skillnet/
├── data/skills/          # 技能包存储
├── cache/                # 缓存目录
├── skills/               # 本地技能源文件
│   ├── financial-report-analyzer/
│   ├── loan-calculator/
│   └── financial-ratio-analyzer/
└── pipelines/            # Pipeline编排文件
    └── financial-health-check.yaml
```

## 🚀 快速开始

### 1. 查看已导入技能

```bash
npx skill-mcp list
```

### 2. 导入新技能

```bash
# 从本地目录导入
npx skill-mcp import .skillnet/skills/my-skill --category "finance" --tags "tag1,tag2"

# 从Git仓库导入
npx skill-mcp import https://github.com/org/skill-repo --branch main
```

### 3. 查看技能详情

```bash
npx skill-mcp info financial-report-analyzer
```

### 4. 版本管理

```bash
# 查看版本历史
npx skill-mcp versions financial-report-analyzer

# 回滚到指定版本
npx skill-mcp rollback financial-report-analyzer --to 0.0.1

# 更新技能（创建新版本）
npx skill-mcp import .skillnet/skills/financial-report-analyzer --overwrite
```

### 5. Pipeline编排

```bash
# 验证Pipeline
npx skill-mcp pipeline validate .skillnet/pipelines/financial-health-check.yaml

# 可视化DAG
npx skill-mcp pipeline graph .skillnet/pipelines/financial-health-check.yaml

# 执行Pipeline（dry-run）
npx skill-mcp pipeline run .skillnet/pipelines/financial-health-check.yaml --dry-run
```

## 📦 已导入技能清单

| 技能名称 | 版本 | 描述 |
|---------|------|------|
| `financial-report-analyzer` | v0.0.4 | 分析财务报表，计算财务比率 |
| `loan-calculator` | v0.0.1 | 贷款计算器，支持多种还款方式 |
| `financial-ratio-analyzer` | v0.0.1 | 杜邦分析、行业对标 |

## 🔧 MCP 工具列表

| 工具名称 | 功能 |
|---------|------|
| `skill_list` | 列出所有技能 |
| `skill_view` | 查看技能内容 |
| `skill_file` | 读取技能文件 |
| `skill_pipeline` | 执行Pipeline |
| `skill_feedback` | 提交反馈 |

## 📝 创建新技能

1. 在 `.skillnet/skills/` 下创建目录
2. 创建 `SKILL.md` 文件（必须包含frontmatter）
3. 运行导入命令

```markdown
---
name: my-skill
version: 0.0.1
description: 技能描述
tags: tag1, tag2
category: finance
---

# 技能标题

## 描述
详细描述...

## 输入格式
```json
{ "input": "value" }
```

## 输出格式
```json
{ "output": "value" }
```
```

## ⚠️ 注意事项

- SkillNet云端API (`api-skillnet.openkg.cn`) 当前无法访问
- skill-mcp 是本地技能管理系统，不支持云端下载
- 所有技能数据存储在本地SQLite数据库

## 📚 相关文档

- [skill-mcp README](https://npm.im/skill-mcp)
- [SkillNet调研文档](./SkillNet%20调研文档（Next.js%20+%20OpenClaw%20+%20MCP）%20.md)