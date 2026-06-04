# Ralph-Loop执行指南

> **工具**: `/ralph-wiggum:ralph-loop`
> **用途**: 迭代执行agent直到完成承诺满足
> **核心**: 明确完成承诺 + 可验证标准

---

## 🎯 Ralph-Loop核心参数

### 必需参数
- **任务描述**: 明确要做什么
- **完成承诺**: 必须可验证的明确标准
- **最大迭代次数**: 建议20次（优化后的安全值）

### 完成承诺示例

#### ✅ 好的完成承诺（明确可验证）
```bash
--completion-promise "所有API端点测试通过（返回200/201状态码），且swagger-test-report.md已生成，且测试通过率=100%"
```

#### ❌ 差的完成承诺（模糊不可验证）
```bash
--completion-promise "测试完成"
```

---

## 📋 常用模板

### 模板1: 后端开发ralph-loop
```bash
/ralph-wiggum:ralph-loop \
  "你需要在Dev阶段实现所有后端API。tasks.md中定义了${API_COUNT}个API端点。
   完成标准：所有API实现完毕，且TypeScript类型检查通过，且npm run build成功" \
  --max-iterations 20 \
  --completion-promise "所有API实现完毕，且TypeScript类型检查通过，且npm run build成功"
```

### 模板2: 后端Swagger测试ralph-loop
```bash
/ralph-wiggum:ralph-loop \
  "你需要在Test阶段执行后端Swagger测试。spec-api.md中定义了${API_COUNT}个API端点。
   完成标准：所有API端点测试通过（返回200/201状态码），且swagger-test-report.md已生成，且测试通过率=100%" \
  --max-iterations 20 \
  --completion-promise "所有API端点测试通过（返回200/201状态码），且swagger-test-report.md已生成，且测试通过率=100%"
```

### 模板3: 前端开发ralph-loop
```bash
/ralph-wiggum:ralph-loop \
  "你需要在Dev阶段实现所有前端页面。tasks.md中定义了${PAGE_COUNT}个页面。
   完成标准：所有页面实现完毕，且TypeScript类型检查通过，且npm run lint无错误" \
  --max-iterations 20 \
  --completion-promise "所有页面实现完毕，且TypeScript类型检查通过，且npm run lint无错误"
```

### 模板4: 前端E2E测试ralph-loop
```bash
/ralph-wiggum:ralph-loop \
  "你需要在Test阶段编写并执行前端E2E测试。plan.md中定义了${STORY_COUNT}个用户故事。
   完成标准：所有用户故事的E2E测试通过（playwright测试报告显示passed=total且无failed），且playwright-test-report.md已生成" \
  --max-iterations 20 \
  --completion-promise "所有用户故事的E2E测试通过（playwright测试报告显示passed=total且无failed），且playwright-test-report.md已生成"
```

---

## 📊 进度输出标准

每次迭代必须在active-bridge.md输出标准进度：

```markdown
## 任务进度 - 第N次迭代（2025-12-30 16:30）
- ✅ 任务N.1: [具体任务] - 完成
- ✅ 任务N.2: [具体任务] - 完成
- 进度：X/Y 任务已完成（Z%）

## 任务完成（2025-12-30 17:00）
- ✅ 所有任务完成：Y/Y
- ✅ 自检：TypeScript 0错误，build成功
- ✅ 总耗时：30分钟

**[STATUS]: READY** - 任务完成
- 完成时间：2025-12-30 17:00
- 下一步：进入下一阶段
```

---

## 🚨 关键原则

1. **完成承诺必须明确可验证**
   - ✅ "测试通过率=100%"
   - ❌ "测试完成"

2. **必须输出实时进度**
   - 每次迭代都记录到active-bridge.md
   - 用户可实时查看进度

3. **最大迭代次数建议20**
   - 避免无限循环
   - 足够完成复杂任务

---

## 📚 参考文档

- **完整模板**: [ralph-loop-templates.md](../../.claude/skills/workflow-manager/references/ralph-loop-templates.md)
- **工作流**: [workflow-manager SKILL.md](../../.claude/skills/workflow-manager/SKILL.md)
- **架构专家**: [architecture-planning-expert.md](../../.claude/agents/architecture-planning-expert.md)
