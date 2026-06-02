# Agent 协作编排

深瞳AI Coding 采用**分层协作模式**，根据任务复杂度选择不同的协作方式。

## 🔄 协作模式选择

### 模式1: 直接协作（推荐用于简单任务）

- **适用场景**: 日常开发、简单问题、快速决策
- **协作方式**: Agent 间直接沟通，无需复杂流程
- **优势**: 高效、灵活、低开销
- **示例**: 前端需要 API 接口 → 直接找 backend-expert

### 模式2: Workflow 协作（用于复杂项目）

- **适用场景**: 新功能开发、多专家协作、需要完整文档管理
- **协作方式**: 使用 workflow-manager 的 9 阶段流程（Plan → Clarify → Tasks → Dev → OpenAPI → Test → Verification → QA → Security Review）
- **优势**: 结构化、可追踪、质量保证、自动继续
- **入口**: workflow-manager 技能 + WorkflowCoordinator → 启动完整工作流
- **关键特性**: 🔄 **自动继续机制** - 工作流不会中途停止，确保完整执行

## 📊 协作方式对比

| 特性 | 直接协作 | Workflow 协作 |
|------|---------|---------------|
| **启动成本** | 低 | 高 |
| **适用场景** | 简单任务 (<4小时) | 复杂项目 (>4小时) |
| **文档要求** | 最小化 | 完整文档 |
| **协作规范** | 灵活 | 结构化 |
| **质量保证** | 事后检查 | 全程 QA |

## 🎯 选择建议

- ✅ **优先使用直接协作**：除非确需复杂管理
- ✅ **Workflow 仅用于**: 真正复杂的多专家协作项目
- ✅ **避免过度管理**: 不要为了用流程而用流程

## 🔄 工作流协调器（WorkflowCoordinator）

**WorkflowCoordinator** 是确保 9 阶段工作流完整执行的核心组件：

### 核心功能

- 📍 **状态跟踪**: 通过 `.az/workflow-state.json` 实时跟踪工作流状态
- 🔄 **自动继续**: 阶段完成后自动判断并进入下一阶段，防止工作流中断
- 🚧 **阻塞管理**: 记录和解决阻塞问题
- 📊 **进度可视化**: 随时查看工作流执行状态

### 关键脚本

- `.claude/skills/workflow-manager/scripts/workflow-coordinator.py` - 中央协调器
- `.claude/skills/workflow-manager/scripts/auto-continue.sh` - 自动继续检查
- `.az/workflow-state.json` - 工作流状态存储

### 使用示例

```bash
# 查看工作流状态
python3 .claude/skills/workflow-manager/scripts/workflow-coordinator.py --status

# 检查是否自动继续
python3 .claude/skills/workflow-manager/scripts/workflow-coordinator.py --auto-continue

# 标记阶段完成
python3 .claude/skills/workflow-manager/scripts/workflow-coordinator.py --complete Test
```

### 状态文件结构

```json
{
  "workflow": "项目名称",
  "version": "2.0",
  "currentStage": "Test",
  "currentSubstage": "frontend-development",
  "stagesCompleted": ["Plan", "Clarify", "Tasks", "Dev", "OpenAPI", "Security Review"],
  "stageStatus": { ... },
  "reworkHistory": [ ... ],
  "autoContinue": true,
  "qualityMetrics": { ... }
}
```

## 📂 权限系统

完整权限管理标准请参考：
📋 **[Workflow Manager 完整权限管理标准](./.claude/skills/workflow-manager/DIRECTORY_STRUCTURE_STANDARD.md)**

## 🎯 Agent 调用规则（强制）

当 prompt 提及以下关键词时，**必须**调用对应的 Agent：

| 关键词 | 必须调用的 Agent | 说明 |
|--------|----------------|------|
| "测试专家"、"测试代码"、"E2E测试"、"单元测试"、"编写测试" | **test-expert** | 专门负责测试代码编写，不是 qa-expert |
| "质量检查"、"QA"、"代码质量"、"构建验证"、"功能验证" | **qa-expert** | 负责质量检查和验证，不是编写测试代码 |
| "前端开发"、"React组件"、"Next.js页面"、"UI开发" | **frontend-expert** | 前端开发专家 |
| "后端开发"、"API开发"、"数据库"、"服务端" | **backend-expert** | 后端开发专家 |
| "架构"、"规划"、"需求分析"、"设计" | **architecture-planning-expert** | 架构规划和设计 |

### ⚠️ 重要区分

- **test-expert（测试专家）**：编写测试代码（E2E、单元测试）
- **qa-expert（质量保证）**：质量检查、构建验证、功能验证

### 调用示例

```
❌ 错误：帮我编写单元测试 → 使用 qa-expert
✅ 正确：帮我编写单元测试 → 使用 test-expert

❌ 错误：检查代码质量 → 使用 test-expert
✅ 正确：检查代码质量 → 使用 qa-expert
```

> 💡 详细指南：[Agent协作详细流程](./.claude/docs/development/agent-collaboration-guide.md)
