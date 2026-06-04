---
description: 系统优化检查，调用system-optimizer skill进行智能系统分析和优化
---

## 用户输入

```text
$ARGUMENTS
```

你**必须**将用户输入作为参数传递给system-optimizer skill进行处理。

## 执行大纲

目标：作为系统优化指挥官，调用system-optimizer skill为用户提供智能的系统资源分析和优化服务。

执行步骤：

1. **调用 system-optimizer skill**：
   - 将用户的任何输入传递给 skill
   - 如果用户没有提供额外参数，skill会自动执行完整的7阶段优化流程

2. **Skill 会自动执行**：
   - Phase 1: 分析系统状态
   - Phase 2: 诊断性能瓶颈
   - Phase 3: 选择优化策略
   - Phase 4: 生成优化建议（带置信度）
   - Phase 5: 询问用户确认
   - Phase 6: 执行优化操作
   - Phase 7: 验证优化效果

3. **用户交互**：
   - skill会自动与用户交互，询问是否执行优化
   - 不需要你做额外处理，让skill自主运行

## 注意事项

- ✅ 直接调用 skill，不要自己执行系统检查
- ✅ 将用户的任何输入原样传递给 skill
- ✅ 让 skill 自主完成所有分析和优化流程
- ❌ 不要绕过 skill 自己执行优化操作
- ❌ 不要跳过 skill 的确认流程
