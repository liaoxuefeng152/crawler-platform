---
name: system-optimizer
description: 'System resource optimization and performance tuning for Linux development environments. Use /sys-check command to trigger. Analyzes system load, memory usage, CPU usage, and processes. Identifies performance bottlenecks (VSCode multi-instance, Next.js redundant servers, memory leaks, zombie processes). Generates intelligent optimization recommendations with confidence scores. Executes safe cleanup operations (temporary files, stale processes). Validates optimization effectiveness with before/after metrics. Ideal for SSH connection issues, system slowdowns, and daily maintenance.'
---

# System Optimizer

Intelligent system resource optimization and performance tuning.

## Quick Start

**Trigger**: Use `/sys-check` command

```
/sys-check
```

This will:

1. Analyze system resources
2. Identify bottlenecks
3. Generate recommendations
4. Ask for confirmation
5. Execute optimizations
6. Validate results

## Optimization Workflow

### Phase 1: Analysis

Run `sys-check` to collect metrics:

- System load (1-minute average)
- Memory usage & available memory
- CPU usage
- Process counts (VSCode, Next.js, Claude, Node)
- Top 5 CPU/memory consumers
- Zombie processes

### Phase 2: Diagnosis

Identify bottlenecks:

| Metric  | Normal | Warning | Critical |
| ------- | ------ | ------- | -------- |
| Load    | <10    | 10-15   | >15      |
| Memory  | <60%   | 60-80%  | >80%     |
| CPU     | <50%   | 50-80%  | >80%     |
| VSCode  | <10    | 10-15   | >15      |
| Next.js | <2     | 2-3     | >3       |
| Claude  | <3     | 3-5     | >5       |

### Phase 3: Strategy Selection

Select optimization strategy based on diagnosis:

**Strategy A: VSCode Optimization**

- Trigger: VSCode >15 processes
- See: `references/vscode-optimization.md`
- Actions: Stop redundant extension hosts, configure file watchers
- Expected: ~1-2GB memory, 10-20% load reduction

**Strategy B: Next.js Optimization**

- Trigger: Next.js >3 processes
- See: `references/nextjs-optimization.md`
- Actions: Stop stale servers, clear cache
- Expected: ~500MB-1GB memory, 5-15% load reduction

**Strategy C: Memory Optimization**

- Trigger: Memory >60%
- See: `references/memory-optimization.md`
- Actions: Clean temp files, clear caches
- Expected: ~2-5GB freed

**Strategy D: Load Optimization**

- Trigger: Load >10
- See: `references/load-optimization.md`
- Actions: Kill high-CPU processes, stop stale services
- Expected: ~30-50% load reduction

### Phase 4: Recommendation

For each issue, provide:

```
Issue: [Problem]
Impact: [High/Medium/Low]
Action: [Specific step]
Expected: [Improvement]
Confidence: [Score]%
```

### Phase 5: Confirmation (Interactive)

**MUST use AskUserQuestion tool for interactive confirmation:**

```javascript
// Use AskUserQuestion tool to ask user about optimization actions
AskUserQuestion({
  questions: [
    {
      question: '检测到系统需要优化，请选择执行方式：',
      header: '优化范围',
      multiSelect: false,
      options: [
        {
          label: '全部优化（推荐）',
          description:
            '执行所有安全优化和进程清理，预期释放4GB内存，降低负载32%',
        },
        {
          label: '仅安全清理',
          description:
            '只清理临时文件和缓存，不操作进程，预期释放1-3GB磁盘空间',
        },
        {
          label: '自定义选择',
          description: '手动选择要执行的优化项目',
        },
        {
          label: '取消优化',
          description: '跳过本次优化，仅查看分析报告',
        },
      ],
    },
  ],
});
```

**Handling user response:**

- If "全部优化" → Execute all Priority 1 and 2 actions
- If "仅安全清理" → Execute only Priority 1 actions
- If "自定义选择" → Ask follow-up questions for each optimization item:
  ```javascript
  AskUserQuestion({
    questions: [
      {
        question: '请选择要执行的优化项目（可多选）：',
        header: '优化项目',
        multiSelect: true,
        options: [
          {
            label: '清理临时文件',
            description: '清理/tmp目录中1天前的claude临时文件，预期释放1-2GB',
          },
          {
            label: '清理npm缓存',
            description: '清理npm缓存，预期释放500MB-1GB',
          },
          {
            label: '清理Next.js缓存',
            description: '清理.next/cache目录，预期释放200-500MB',
          },
          {
            label: '优化Next.js进程',
            description:
              '停止旧的next-server进程，保留最新2个，预期释放500MB-1GB',
          },
          {
            label: '优化VSCode进程',
            description: '停止冗余的extensionHost进程，预期释放1-2GB',
          },
        ],
      },
    ],
  });
  ```
- If "取消优化" → Skip execution, show summary only

### Phase 6: Execution

**Priority 1 - Safe** (Always):

```bash
find /tmp -name "claude-*" -mtime +1 -delete
npm cache clean --force
rm -rf .next/cache
```

**Priority 2 - Process Cleanup** (Ask user):

```bash
# Stop redundant Next.js servers
ps aux | grep "next-server" | grep -v grep | \
  awk '{print $2}' | head -n -2 | xargs -I {} kill -TERM {}
```

**Priority 3 - Configuration** (Ask user):

- VSCode file watcher exclusions
- Next.js memory limits

### Phase 7: Validation

Run `sys-check` again to validate:

```
Before → After
Load: [X] → [Y] ([Δ]%)
Memory: [X]% → [Y]% ([Δ]%)
```

## Common Scenarios

### SSH Disconnections

**Symptom**: SSH frequently disconnects

**Analysis**:

```
/sys-check → Load: 18.3 (Critical)
```

**Fix**: Stop redundant servers, clean temp files
**Expected**: Load 18.3 → ~10.5

### System Slowdown

**Symptom**: Slow response

**Analysis**:

```
/sys-check → VSCode: 22, Memory: 75%
```

**Fix**: Configure file watchers, stop extension hosts
**Expected**: Memory 75% → ~55%

### Daily Maintenance

**Analysis**:

```
/sys-check → All normal ✅
```

**Action**: No optimization needed

## Best Practices

1. **Interactive First** - MUST use AskUserQuestion tool for all confirmations
2. **Clear Options** - Provide 4 options: 全部优化, 仅安全清理, 自定义选择, 取消
3. **Multi-select Support** - Allow users to choose specific optimization items
4. **Prioritize Safety** - Execute safe operations first (Priority 1)
5. **Provide Context** - Explain what, why, expected improvement for each option
6. **Validate Results** - Always check after optimization with before/after metrics

## Integration

The `sys-check` command (`.claude/commands/sys-check`) is the primary interface.

Both `sys-check` and `/sys-check` trigger the same workflow, but using `/sys-check` (this skill) provides intelligent analysis and interactive confirmation.
