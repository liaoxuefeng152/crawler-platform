# Bug 错误分析器 - 增强版 Skill

当前项目终端/浏览器报错分析器，提供**自动化工作流程**的问题分析和完整解决方案。

## 🎯 Skill 功能

本 Skill 提供**完整的自动化 Bug 修复工作流**：

```
用户报告错误
    ↓
自动错误分析
    ↓
架构专家分析确认
    ↓
专家协作修复
    ↓
E2E测试验证
    ↓
自动清理临时文件
    ↓
生成修复报告
```

## 🚀 使用方法

### 标准模式（默认）

```
/bug <错误信息>
```

**功能**：
1. **自动错误分类**：识别前端/后端/构建/测试错误
2. **严重性评估**：P0/P1/P2/P3优先级判断
3. **架构专家分析**：调用架构专家进行问题分析确认（强制）
4. **专家协作修复**：架构专家调用对应专家（frontend-expert/backend-expert）进行修复
5. **E2E测试验证**：自动进行端到端测试验证修复
6. **自动清理**：清理过程中生成的临时脚本文件
7. **生成报告**：生成完整的修复报告

### ⚠️ 重要：必须调用架构专家

**无论是否使用任何参数，所有 bug 分析都必须调用架构专家！**

- 标准模式（`/bug <错误信息>`）：调用架构专家分析 → 执行完整修复流程
- 不允许绕过架构专家直接分析

## 📋 工作流程详解

### 阶段1: 错误分析（Error Analysis）

- **执行者**: bug-analyzer（自动分析器）
- **输入**: 用户提供的错误信息
- **输出**: 错误分类和严重性评估
- **时长**: ~1分钟

**工作内容**：
- 自动识别错误类型（前端/后端/构建/测试）
- 评估严重性级别（P0-P3）
- 生成初步分析报告

### 阶段2: 架构专家分析（Architecture Analysis）

- **执行者**: architecture-planning-expert
- **输入**: 错误分析报告
- **输出**: 问题根因分析和修复方案
- **时长**: ~3-5分钟

**工作内容**：
- 调用 `architecture-planning-expert` 进行深度分析
- 确定根本原因和影响范围
- 设计修复方案
- 确定需要调用的专家类型

### 阶段3: 专家修复（Expert Fix）

- **执行者**: frontend-expert 或 backend-expert
- **输入**: 修复方案
- **输出**: 代码修复
- **时长**: ~10-30分钟（取决于问题复杂度）

**工作内容**：

根据错误类型自动调用对应专家：

- **frontend-expert**：React组件、TypeScript类型、Next.js客户端错误
- **backend-expert**：API路由、数据库、认证授权错误
- 使用 **ralph-loop** 确保修复完整性

### 阶段4: E2E测试验证（E2E Testing）

- **执行者**: test-expert
- **输入**: 修复后的代码
- **输出**: 测试报告
- **时长**: ~5-10分钟

**工作内容**：
- 调用 `test-expert` 进行端到端测试
- 验证修复效果
- 确保没有引入新问题

### 阶段5: 清理（Cleanup）

- **执行者**: cleanup-script（自动清理）
- **输入**: 工作目录
- **输出**: 清理完成报告
- **时长**: ~1分钟

**工作内容**：

自动清理以下临时文件：
- `scripts/temp-*.ts` - 临时脚本
- `scripts/test-*.ts` - 测试脚本
- `*.debug.log` - 调试日志
- 工作流状态文件

保留以下重要文件：
- `.az/bug-fix-report-*.md` - 修复报告
- `.az/bug-test-report-*.md` - 测试报告

## 🎯 工作流控制命令

### 初始化工作流

```bash
bash .claude/commands/bug/workflow-coordinator.sh --init '<错误信息>'
```

### 更新工作流状态

```bash
# 更新到架构分析阶段
bash .claude/commands/bug/workflow-coordinator.sh --update-state ARCHITECTURE_REVIEW

# 更新到修复阶段
bash .claude/commands/bug/workflow-coordinator.sh --update-state FIXING frontend_repair

# 更新到测试阶段
bash .claude/commands/bug/workflow-coordinator.sh --update-state TESTING

# 标记阶段完成
bash .claude/commands/bug/workflow-coordinator.sh --update-state FIXING frontend_repair completed
```

### 记录临时文件

```bash
bash .claude/commands/bug/workflow-coordinator.sh --record-file '/path/to/temp/file'
```

### 手动清理

```bash
bash .claude/commands/bug/workflow-coordinator.sh --cleanup
```

### 查看状态

```bash
bash .claude/commands/bug/workflow-coordinator.sh --status
```

### 完成工作流

```bash
bash .claude/commands/bug/workflow-coordinator.sh --finish
```

## 📊 支持的错误类型

### 前端错误（Frontend Errors）

- TypeScript 编译错误
- React/Next.js 运行时错误
- shadcn/ui 组件错误
- Zustand 状态管理错误
- 模块导入/路径错误

### 后端错误（Backend Errors）

- API 路由错误
- Prisma 数据库错误
- MongoDB 连接错误
- 数据验证错误（Zod）
- 认证授权错误

### 构建错误（Build Errors）

- Webpack 打包错误
- TypeScript 类型错误
- 依赖冲突错误
- 环境配置错误

### 测试错误（Test Errors）

- E2E 测试失败
- 单元测试失败
- 集成测试失败

## 🎖️ 严重性级别

| 级别   | 描述       | 响应时间 | 示例                             |
| ------ | ---------- | -------- | -------------------------------- |
| **P0** | 阻塞性错误 | 立即     | 应用无法启动、核心功能完全不可用 |
| **P1** | 高优先级   | 30分钟内 | 主要功能不可用、数据丢失风险     |
| **P2** | 中优先级   | 2小时内  | 次要功能不可用、性能下降         |
| **P3** | 低优先级   | 24小时内 | UI小问题、文案错误               |

## 📁 状态文件

工作流状态保存在 `.az/bug-workflow-state.json`：

```json
{
  "workflow": "bug-fix",
  "version": "1.0.0",
  "startTime": "2025-01-14T10:30:00Z",
  "currentStage": "ARCHITECTURE_REVIEW",
  "currentSubstage": "analyzing_root_cause",
  "errorMessage": "TypeError: Cannot read property 'x' of undefined",
  "errorType": "frontend",
  "severity": "P1",
  "stagesCompleted": ["ERROR_ANALYSIS"],
  "stageStatus": {
    "ERROR_ANALYSIS": "completed",
    "ARCHITECTURE_REVIEW": "in_progress"
  },
  "reworkHistory": [],
  "cleanupRequired": true,
  "tempFiles": ["/path/to/temp-script.ts"]
}
```

## 💡 使用示例

### 示例1: 前端组件错误

```
/bug Error: failed to render component: Button is not defined
```

**工作流程**：

1. 自动识别为前端错误（P1）
2. 调用架构专家分析
3. 架构专家调用 frontend-expert 修复
4. frontend-expert 使用 ralph-loop 完成修复
5. test-expert 进行 E2E 测试
6. 自动清理临时文件
7. 生成修复报告

### 示例2: API路由错误

```
/bug API error: 500 Internal Server Error on /api/users
```

**工作流程**：

1. 自动识别为后端错误（P0）
2. 调用架构专家分析
3. 架构专家调用 backend-expert 修复
4. backend-expert 使用 ralph-loop 完成修复
5. 生成 OpenAPI 文档
6. test-expert 进行 Swagger 测试 + E2E 测试
7. 自动清理临时文件
8. 生成修复报告

### 示例3: 构建错误

```
/bug Build error: Module not found: Can't resolve '@/components/Header'
```

**工作流程**：

1. 自动识别为构建错误（P0）
2. 调用架构专家分析
3. 架构专家调用对应专家（frontend/backend）修复
4. 验证构建成功
5. 自动清理临时文件
6. 生成修复报告

### 示例4: 功能异常（无错误信息）

```
/bug 点击取消按钮没有任何的响应，也没有取消成功
```

**工作流程**：

1. 调用架构专家分析
2. 架构专家识别问题根因和影响范围
3. 架构专家调用对应专家修复
4. test-expert 进行 E2E 测试
5. 生成修复报告

## 🧹 自动清理机制

### 清理的文件类型

- ✅ 临时脚本（`scripts/temp-*.ts`）
- ✅ 测试脚本（`scripts/test-*.ts`）
- ✅ 调试文件（`*.debug.log`）
- ✅ 工作流状态文件（完成后归档）

### 保留的文件类型

- 📄 修复报告（`.az/bug-fix-report-*.md`）
- 📄 测试报告（`.az/bug-test-report-*.md`）
- 📄 关键日志（`.az/bug-critical-logs-*.log`）

## 🔗 相关文档

- 📄 [WORKFLOW.md](../../commands/bug/WORKFLOW.md) - 工作流程详细配置
- 📄 [architecture-planning-expert.md](../../agents/architecture-planning-expert.md) - 架构专家配置
- 📄 [frontend-expert.md](../../agents/frontend-expert.md) - 前端专家配置
- 📄 [backend-expert.md](../../agents/backend-expert.md) - 后端专家配置

## 📝 注意事项

1. **工作流状态跟踪**：所有状态变化会自动记录到 `.az/bug-workflow-state.json`
2. **临时文件管理**：工作流过程中创建的临时文件会自动记录
3. **自动清理**：工作流完成后自动清理临时文件，保留重要报告
4. **专家协作**：通过架构专家协调不同领域的专家进行修复
5. **完整测试**：修复后自动进行 E2E 测试验证

---

**请提供具体的错误信息，我将为您提供完整的自动化修复流程。**
