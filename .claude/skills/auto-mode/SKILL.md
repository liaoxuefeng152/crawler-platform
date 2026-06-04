---
name: auto-mode
description: 全自动模式状态管理与行为规范
---

## AUTO_MODE 检测

**状态存储**: `.az/plan-xxx/communication/active-bridge.md`

**标志格式**: `[AUTO_MODE]: true`

**检测命令**:
```bash
grep "\[AUTO_MODE\]: true" .az/plan-*/communication/active-bridge.md
```

## 行为规范

### AUTO_MODE=true时

**允许**:
- ✅ 直接执行下一阶段
- ✅ 记录结果到active-bridge.md
- ✅ 保持AUTO_MODE标志
- ✅ 标记状态（BACKEND_READY, TEST_PASSED等）

**禁止**:
- ❌ AskUserQuestion
- ❌ 等待确认
- ❌ 清除标志
- ❌ 未完成就停止

### AUTO_MODE=false时

- 可询问用户
- 可使用AskUserQuestion
- 用户说"继续+全自动"时创建标志

## 创建时机

满足任一即创建:
1. 用户输入包含"全自动"、"不要询问"
2. 用户回答"继续"且含"全自动"
3. 架构专家检测到上述条件

**创建位置**: `.az/plan-xxx/communication/active-bridge.md`

**创建内容**:
```markdown
## 🚀 全自动模式控制

**[AUTO_MODE]: true**

**[AUTO_MODE_START]: YYYY-MM-DD HH:MM**

**[AUTO_MODE_REASON]: 用户明确要求"全自动开发，不要询问"**
```

## 执行记录格式

```markdown
## 🚀 全自动模式执行记录
- 时间：YYYY-MM-DD HH:MM
- Agent：[agent-name]
- 阶段：[阶段名称]
- 操作：XXX
- 检测：[AUTO_MODE]: true
- 行为：跳过询问，直接执行
- 状态：[AUTO_MODE]: true（继续保持）
```