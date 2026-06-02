# System Optimizer Skill - 使用指南

## ✅ 安装完成

**system-optimizer skill** 已成功创建并打包。

## 📁 文件结构

```
.claude/
├── commands/
│   ├── sys-check              # 快速检查命令
│   └── sys-check.md           # 命令说明
├── skills/
│   └── system-optimizer/
│       ├── SKILL.md            # 核心技能文档
│       └── references/
│           ├── vscode-optimization.md
│           ├── nextjs-optimization.md
│           ├── memory-optimization.md
│           └── load-optimization.md
└── prompts/
    └── SYSTEM_OPTIMIZATION.md
```

## 🚀 使用方式

### 方式1: 快速检查（Command）

```bash
sys-check
```

**输出**:
- 系统状态报告
- 建议优化方向
- 快速可执行操作

**适用**: 快速查看系统状态

### 方式2: 智能优化（Skill）

```
/sys-check
```

**输出**:
- 完整的系统分析
- 智能瓶颈识别
- 优化方案推荐（含置信度）
- 交互式确认流程
- 执行优化操作
- 验证优化效果

**适用**: 需要智能分析和优化决策

## 🎯 推荐使用场景

### 场景1: SSH频繁断开

```
/sys-check
```

**Claude会**:
1. 分析系统负载
2. 识别瓶颈（如Next.js进程过多）
3. 推荐优化方案
4. 询问确认
5. 执行优化
6. 验证效果

### 场景2: 系统响应缓慢

```
/sys-check
```

**Claude会**:
1. 检查内存/CPU使用
2. 识别高占用进程
3. 提供清理建议
4. 交互式确认
5. 安全清理

### 场景3: 每日检查

```bash
sys-check
```

**快速查看**: 系统是否正常

## 💡 工作流程示例

### 完整优化流程

```
用户: /sys-check

Claude: [Phase 1: 分析]
运行 sys-check 命令...

[显示报告]
系统负载: 18.3 (Critical)
内存: 75% (Warning)
VSCode: 22个
Next.js: 8个

Claude: [Phase 2: 诊断]
识别瓶颈:
- 主要: Next.js进程过多 (8个)
- 次要: VSCode进程过多 (22个)

Claude: [Phase 3: 方案]
推荐优化:
1. 停止6个冗余Next.js服务器 - 预计释放: ~3GB
2. 配置VSCode文件监听 - 预计释放: ~2GB
3. 清理临时文件 - 预计释放: ~1GB
总计: 预计释放 ~6GB，降低负载40%

Claude: [Phase 4: 确认 - 交互式问答]
检测到系统需要优化，请选择执行方式：

[显示交互式选项面板]
1. 全部优化（推荐）- 执行所有安全优化和进程清理
2. 仅安全清理 - 只清理临时文件和缓存
3. 自定义选择 - 手动选择要执行的优化项目
4. 取消优化 - 仅查看分析报告

用户: [选择 1 - 全部优化]

Claude: [Phase 5: 执行]
✓ 停止6个Next.js服务器
✓ 配置文件监听排除规则
✓ 清理临时文件

Claude: [Phase 6: 验证]
优化结果:
系统负载: 18.3 → 10.2 ⬇️ 44%
内存: 75% → 52% ⬇️ 23%

优化成功！建议每日检查一次。
```

## 📊 优化策略

Skill包含4种优化策略：

### Strategy A: VSCode优化
- **触发**: VSCode >15进程
- **预期**: 释放1-2GB，降低负载10-20%
- **参考**: `references/vscode-optimization.md`

### Strategy B: Next.js优化
- **触发**: Next.js >3进程
- **预期**: 释放500MB-1GB，降低负载5-15%
- **参考**: `references/nextjs-optimization.md`

### Strategy C: 内存优化
- **触发**: 内存 >60%
- **预期**: 释放2-5GB
- **参考**: `references/memory-optimization.md`

### Strategy D: 负载优化
- **触发**: 负载 >10
- **预期**: 降低负载30-50%
- **参考**: `references/load-optimization.md`

## 🔧 配置建议

### 添加到PATH（可选）

```bash
# 添加到 ~/.bashrc
echo 'export PATH="$PATH:/home/gms/work-space/ai-test/az-ai/.claude/commands"' >> ~/.bashrc
source ~/.bashrc

# 现在可以直接使用
sys-check    # 快速检查
/sys-check  # 智能优化
```

### 创建别名（可选）

```bash
# 添加到 ~/.bashrc
echo 'alias sys-optimize="/sys-check"' >> ~/.bashrc
source ~/.bashrc

# 使用
sys-optimize
```

## 🎨 核心特性

1. **智能分析**: 自动识别性能瓶颈
2. **策略选择**: 根据问题选择最佳优化方案
3. **置信度评分**: 每个推荐都有预期效果和置信度
4. **交互式问答**: 使用 AskUserQuestion 工具提供友好的选项界面
5. **多级选择**: 支持全部优化/安全清理/自定义选择/取消
6. **多选支持**: 自定义模式支持选择具体的优化项目
7. **安全优先**: 优先执行安全操作
8. **效果验证**: 优化后自动验证结果

## ⚡ 快速参考

| 命令 | 功能 | 适用场景 |
|------|------|----------|
| `sys-check` | 快速检查 | 查看系统状态 |
| `/sys-check` | 智能优化 | 需要分析和优化 |
| `sys-check --auto` | 自动优化 | 安全的自动清理 |

## 📚 相关文档

- **Skill文档**: `.claude/skills/system-optimizer/SKILL.md`
- **命令文档**: `.claude/commands/sys-check.md`
- **优化策略**: `.claude/skills/system-optimizer/references/*.md`
- **Prompt模板**: `.claude/prompts/SYSTEM_OPTIMIZATION.md`

## ✨ 优势

相比仅使用command，使用skill的优势：

1. ✅ **智能化**: AI分析瓶颈，不需要用户手动判断
2. ✅ **结构化**: 7阶段标准化流程
3. ✅ **策略化**: 针对每种问题都有专门的优化策略
4. ✅ **交互式**: 用户参与决策，不会盲目执行
5. ✅ **可验证**: 优化前后对比，验证效果
6. ✅ **可复用**: 策略库可以积累和复用

## 🎯 最佳实践

1. **每天检查一次**: 使用 `/sys-check` 确保系统健康
2. **问题出现时**: 立即使用 `/sys-check` 分析和优化
3. **开发前**: 检查系统状态，确保资源充足
4. **保存工作**: 优化前保存当前工作
5. **逐步执行**: 按优先级执行优化（安全→进程→配置）

---

**版本**: 1.0.0
**状态**: ✅ 已安装并可用
**更新**: 2026-01-08
