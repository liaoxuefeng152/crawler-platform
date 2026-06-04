---
name: system-check
description: '系统资源分析报告生成器。使用 /system-check 命令触发。分析系统内存、CPU、进程使用情况，生成详细的可视化报告。识别VSCode、Claude、Node.js等进程的内存占用，检测僵尸进程和异常占用。提供优化建议和健康评分。适用于日常监控、问题诊断、性能调优场景。'
---

# System Check - 系统资源分析报告

智能系统资源分析，生成详细的内存和进程报告。

## Quick Start

**触发**: 使用 `/system-check` 命令

```
/system-check
```

这将自动执行完整的系统分析并生成报告。

## 分析流程

### Step 1: 系统总体状态

```bash
free -h
```

收集指标：

- 总内存、已用内存、可用内存
- 内存使用百分比
- 缓存/缓冲区占用

### Step 2: 进程内存分析

```bash
# Top 20 内存占用进程
ps aux --sort=-%mem | head -20

# 进程数量统计
ps aux | grep -E "(claude|next|node|code)" | grep -v grep | wc -l

# 僵尸进程检测
ps aux | awk '$8 ~ /Z/ {print}' | wc -l
```

### Step 3: 分类统计

```bash
# VSCode Server 内存统计
ps aux | grep vscode-server | grep -v grep | \
  awk '{sum+=$6; count++} END {print "进程数: " count ", 总内存: " sum/1024 " MB"}'

# Claude 进程统计
ps aux | grep claude | grep -v grep | \
  awk '{sum+=$6; count++} END {print "进程数: " count ", 总内存: " sum/1024 " MB"}'

# Node 进程统计
ps aux | grep node | grep -v grep | \
  awk '{sum+=$6; count++} END {print "进程数: " count ", 总内存: " sum/1024 " MB"}'

# TypeScript 服务器统计
ps aux | grep tsserver | grep -v grep | wc -l
```

### Step 4: 详细进程列表

```bash
# Claude 进程详情
ps aux | grep "claude" | grep -v grep | \
  awk '{printf "PID %s: %.1f MB\n", $2, $6/1024}'

# TypeScript 服务器详情
ps aux | grep "tsserver" | grep -v grep | \
  awk '{printf "PID %s: %.1f MB - %s\n", $2, $6/1024, $11}'

# Next.js 进程检测
pgrep -f "next dev" | wc -l
pgrep -f "next build" | wc -l
```

## 报告生成格式

### 系统总体情况

| 指标     | 值             | 状态     |
| -------- | -------------- | -------- |
| 总内存   | [值] Gi        | ✅/⚠️/🔴 |
| 已使用   | [值] Gi ([%]%) | ✅/⚠️/🔴 |
| 可用内存 | [值] Gi ([%]%) | ✅/⚠️/🔴 |
| 僵尸进程 | [数量]         | ✅/⚠️    |

状态判定：

- ✅ 正常：内存 <60%，僵尸进程 =0
- ⚠️ 警告：内存 60-80%，僵尸进程 <5
- 🔴 危险：内存 >80%，僵尸进程 ≥5

### 内存占用分析

| 类别              | 进程数 | 总内存  | 占比 |
| ----------------- | ------ | ------- | ---- |
| VSCode Server     | [数量] | [MB] GB | [%]  |
| Claude 进程       | [数量] | [MB] GB | [%]  |
| Node 进程         | [数量] | [MB] GB | [%]  |
| TypeScript 服务器 | [数量] | [MB] GB | [%]  |

### 主要内存占用详情

列出 Top 10 进程详情：

```
PID [xxx]: [xxx] MB - [进程名/描述]
```

### 优化建议

根据分析结果提供针对性建议：

1. **VSCode TypeScript 服务器优化**（如 TS服务器 >3个）
   - 配置建议：`typescript.tsserver.maxTsServerMemory`

2. **Claude 会话管理**（如 Claude进程 >3个）
   - 建议：关闭不活跃会话

3. **Node 进程清理**（如发现异常）
   - 建议：检查后台运行的服务

### 健康评分

根据以下指标计算健康评分：

| 指标       | 权重 | 评分标准                                 |
| ---------- | ---- | ---------------------------------------- |
| 内存使用率 | 40%  | <50%=100分, 50-70%=80分, >70%=60分       |
| 僵尸进程   | 20%  | 0=100分, 1-5=80分, >5=0分                |
| 进程冗余度 | 20%  | 正常=100分, 轻微冗余=80分, 严重冗余=60分 |
| 系统负载   | 20%  | <10=100分, 10-15=80分, >15=60分          |

**总分计算**：加权平均，输出百分比

## 执行模式

### 默认模式（无参数）

完整执行 4 步分析流程，生成详细报告。

### 快速模式（--quick）

仅执行 Step 1-2，输出简要状态。

### 详细模式（--verbose）

执行完整流程，包含每个进程的详细信息。

## 最佳实践

1. **定期检查** - 每天执行一次，监控系统健康
2. **问题诊断** - 系统卡顿时立即执行，定位问题
3. **对比分析** - 优化前后执行，验证效果
4. **报告存档** - 重要分析结果可保存到 memory 目录

## 输出示例

```
📊 系统资源分析报告

系统总体情况
├── 总内存: 251 Gi ✅
├── 已使用: 47 Gi (18.7%) ✅
├── 可用内存: 164 Gi (65%) ✅
└── 僵尸进程: 0 ✅

内存占用分析
├── VSCode Server: 19进程, 3.4 GB
├── Claude: 6进程, 1.8 GB
├── Node: 13进程, 3.5 GB
└── TypeScript: 3服务器, 1.5 GB

健康评分: 95/100 ✅ 优秀

结论: 系统运行健康，无需优化。
```

## 与 system-optimizer 的关系

- `/system-check`: 本 skill - 专注分析报告
- `/sys-check`: system-optimizer - 专注优化执行

两者可配合使用：

1. 先用 `/system-check` 查看状态
2. 如需优化，再用 `/sys-check` 执行优化
