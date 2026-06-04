---
description: 工作流管理指挥官，直接调用workflow-manager skill进行9阶段标准化开发流程（Plan → Clarify → Tasks → Dev → OpenAPI → Test → Verification → QA → Security Review）
---

## 用户输入

```text
$ARGUMENTS
```

你**必须**将用户输入作为业务需求传递给workflow-manager skill进行处理。

## 执行大纲

目标：作为工作流管理指挥官，调用workflow-manager skill为用户提供端到端的9阶段标准化开发流程体验。

执行步骤：

-1. **数据库环境变量检测与同步**（工作流前置检查）：

在启动工作流之前，确保数据库配置正确：

```bash
echo "🔍 数据库配置检测（工作流前置检查）..."

# 检测系统环境变量
SHENTONG_URI=$(env | grep SHENTONG_MIDDLEWARE_MONGO_URI | cut -d'=' -f2 2>/dev/null)

# 检测项目配置
if [ -f ".env" ]; then
  DATABASE_URI=$(grep DATABASE_URL .env | cut -d'=' -f2 | tr -d '"' 2>/dev/null)
else
  DATABASE_URI=""
fi

# 配置状态报告
echo ""
echo "📊 配置状态："
if [ -n "$SHENTONG_URI" ]; then
  echo "  ✅ SHENTONG_MIDDLEWARE_MONGO_URI: ${SHENTONG_URI:0:40}..."
else
  echo "  ⚪ SHENTONG_MIDDLEWARE_MONGO_URI: 未配置"
fi

if [ -n "$DATABASE_URI" ]; then
  echo "  ✅ .env DATABASE_URL: ${DATABASE_URI:0:40}..."
else
  echo "  ⚪ .env DATABASE_URL: 未配置"
fi

# 自动同步逻辑
if [ -n "$SHENTONG_URI" ] && [ "$SHENTONG_URI" != "$DATABASE_URI" ]; then
  echo ""
  echo "🔄 检测到配置不一致，正在自动同步..."

  # 读取并更新配置
  if [ -f ".env" ]; then
    ENV_CONTENT=$(cat .env)
    if echo "$ENV_CONTENT" | grep -q "DATABASE_URL="; then
      ENV_CONTENT=$(echo "$ENV_CONTENT" | sed "s|DATABASE_URL=.*|DATABASE_URL=\"$SHENTONG_URI\"|")
    else
      ENV_CONTENT="$ENV_CONTENT\n\n# MongoDB数据库连接（自动同步自系统环境变量）\nDATABASE_URL=\"$SHENTONG_URI\""
    fi
  else
    ENV_CONTENT="# MongoDB数据库连接（自动同步自系统环境变量）\nDATABASE_URL=\"$SHENTONG_URI\""
  fi

  echo -e "$ENV_CONTENT" > .env
  echo "✅ 已自动同步 .env 为系统环境变量"
  echo ""

elif [ -z "$SHENTONG_URI" ] && [ -z "$DATABASE_URI" ]; then
  echo ""
  echo "❌ 错误：数据库配置缺失"
  echo ""
  echo "请执行以下任一操作："
  echo "  1. 配置系统环境变量：export SHENTONG_MIDDLEWARE_MONGO_URI='your-connection-string'"
  echo "  2. 手动创建 .env 文件并添加 DATABASE_URL"
  echo ""
  echo "工作流无法继续，请先配置数据库连接。"
  exit 1

elif [ -z "$SHENTONG_URI" ] && [ -n "$DATABASE_URI" ]; then
  echo ""
  echo "⚠️  使用 .env 中的配置（未检测到系统环境变量）"
  echo ""
else
  echo ""
  echo "✅ 数据库配置一致，继续执行工作流"
  echo ""
fi
```

-0.5. **项目名称与表名前缀同步**（工作流前置检查）：

在启动工作流之前，确保项目名称与表名前缀一致：

```bash
# 执行同步脚本
node .claude/skills/az-init/scripts/sync-project-prefix.js
```

0. **工作流状态检查**（防止重复启动和流程中断）：

   ```bash
   # 🚨 关键1：检查是否已有活跃的plan
   python3 .claude/skills/workflow-manager/scripts/plan_manager.py check

   # 如果退出码为1（检测到最近的plan），需要询问用户
   if [ $? -ne 0 ]; then
       echo "⚠️  检测到最近24小时内的活跃plan目录"
       echo ""
       echo "请确认："
       echo "  [1] 继续现有工作流（推荐）"
       echo "  [2] 创建新工作流"
       echo "  [3] 取消操作"
       read -p "选择 [1/2/3]: " CHOICE

       case $CHOICE in
           1)
               echo "✅ 继续现有工作流"
               # 加载工作流状态并自动继续
               SKIP_PLAN_CREATION=1
               ;;
           2)
               echo "🆕 创建新工作流"
               # 继续执行plan创建流程
               SKIP_PLAN_CREATION=0
               ;;
           3)
               echo "❌ 取消操作"
               exit 0
               ;;
           *)
               echo "❌ 无效选择，取消操作"
               exit 1
               ;;
       esac
   fi

   # 🚨 关键2：检查工作流协调器状态
   python3 .claude/skills/workflow-manager/scripts/workflow-coordinator.py --status

   # 🚨 关键3：启用自动继续模式（防止工作流中断）
   if [ -f .az/workflow-state.json ]; then
       echo "✅ 工作流状态文件存在"
       echo "🚀 已启用自动继续模式"
       # 设置autoContinue=true（如未设置）
   fi
   ```

1. **需求类型识别**：
   - 分析用户输入的复杂度
   - 判断是简单需求（≤4小时）还是复杂需求（>4小时）
   - 决定启动完整工作流还是简化流程

2. **调用workflow-manager skill**：
   - 将用户输入传递给workflow-manager skill
   - 启动9阶段工作流程：Plan → Clarify → Tasks → Dev → OpenAPI → Test → Verification → QA
   - 监控每个阶段的执行状态

3. **工作流跟踪和协调**：
   - 实时显示当前执行阶段和进度
   - 确保每个阶段的质量标准得到满足
   - 处理异常情况和错误恢复

4. **结果汇总**：
   - 展示完整的工作流执行结果
   - 提供项目交付物总结
   - 给出后续维护建议

## 工作流管理执行策略

### 🎯 工作流协调器集成（WorkflowCoordinator）

为了确保9阶段工作流能够完整执行而不会中途停止，系统集成了**WorkflowCoordinator**作为中央调度器：

**核心功能：**

- 📍 **状态跟踪**：通过 `.az/workflow-state.json` 实时跟踪工作流状态
- 🔄 **自动继续**：阶段完成后自动判断并进入下一阶段
- 🚧 **阻塞管理**：记录和解决阻塞问题
- 📊 **进度可视化**：随时查看工作流执行状态

**关键脚本：**

- `.claude/skills/workflow-manager/scripts/workflow-coordinator.py` - 中央协调器
- `.claude/skills/workflow-manager/scripts/auto-continue.sh` - 自动继续检查
- `.az/workflow-state.json` - 工作流状态存储

**使用示例：**

```bash
# 查看工作流状态
python3 .claude/skills/workflow-manager/scripts/workflow-coordinator.py --status

# 检查是否自动继续
python3 .claude/skills/workflow-manager/scripts/workflow-coordinator.py --auto-continue

# 标记阶段完成
python3 .claude/skills/workflow-manager/scripts/workflow-coordinator.py --complete Test
```

### 阶段1：Plan（需求规划）

- **执行者**：fullstack-requirement-expert（需求专家）
- workflow-manager skill调用**需求专家**进行深度需求分析
- **需求专家**创建2025标准项目目录结构 `.az/plan-年月日时分/`
  ```
  .az/plan-年月日时分/
  ├── communication/
  │   ├── context.md
  │   ├── spec-api.md
  │   └── active-bridge.md
  ├── plan.md
  ├── user-journeys.md  ⭐ 新增：包含时序图
  ├── tasks.md
  └── qa-report.md
  ```

**⭐ 新增流程（时序图生成）**：

1. 需求专家分析需求，拆解功能模块（如：登录、查询、上传等）
2. **需求专家为每个功能模块调用 `Skill(user-story-mermaid)`**
3. 生成Mermaid时序图并嵌入 `user-journeys.md`
4. 时序图包含完整API路径标注（`GET/POST/PUT/DELETE /api/path`）

**⭐ 新增验证环节（用户确认）**：

生成时序图后，展示给用户确认需求理解是否准确：

```
📊 时序图已生成，请确认需求理解是否准确：

模块1：{模块名称}
[展示Mermaid渲染结果]

模块2：{模块名称}
[展示Mermaid渲染结果]

...

⚠️ 请确认：
[1] 时序图准确，继续进入Clarify阶段
[2] 需要调整，请说明具体问题
```

用户确认后，进入Clarify阶段。

### 阶段2：Clarify（需求澄清）

- **执行者**：fullstack-requirement-expert（需求专家）
- **需求专家**直接主导需求澄清过程（最多5轮问答）

**⭐ 时序图反馈处理（新增）**：

1. 基于用户对时序图的反馈进行澄清
2. 如用户要求调整时序图：
   - 更新需求理解
   - **重新调用 `Skill(user-story-mermaid)` 更新时序图**
   - 再次展示确认

**⭐ 最终确认环节（新增）**：

澄清完成后，再次展示完整时序图清单：

```
📋 最终需求确认

模块数量：X个
时序图数量：X个

时序图清单：
- 模块1-{名称} ✅ 用户已确认
- 模块2-{名称} ✅ 用户已确认
- 模块3-{名称} ✅ 用户已确认

API路径总数：X个（架构专家将基于此定义spec-api.md）

⚠️ 请最终确认：
[1] 确认无误，进入Tasks阶段
[2] 还有疑问，继续澄清
```

用户最终确认后，进入Tasks阶段。

### 阶段3：Tasks（任务拆解）

- **执行者**：architecture-planning-expert（架构专家）
- **架构专家**接收**需求专家**产出的完整需求文档
- **⭐ 读取 `user-journeys.md` 中的时序图**（新增）：
  - 提取每个模块时序图中的API路径
  - 基于时序图API路径定义 `spec-api.md`
  - 确保spec-api.md覆盖所有时序图中的API
- 在 `communication/spec-api.md` 中定义API契约
- 分析需求的技术实现方案和复杂度
- 生成详细的 `tasks.md` 任务拆解文档
- 确定任务优先级和依赖关系
- 识别可并行开发的任务
- 制定技术实现方案和资源分配

### 阶段4：Dev（开发执行）

- **执行者**：frontend-expert + backend-expert（开发专家）
- **架构专家**作为技术总监调度前端/后端专家进行开发
- 按优先级和依赖关系执行任务
- 严格遵守 `spec-api.md` 契约进行开发
- 完成后在 `active-bridge.md` 标记 `[STATUS]: READY`
- 提供完整的TypeScript类型定义
- 每个任务完成后更新状态和进度

### 阶段5：OpenAPI（文档生成）⭐ 新增

- **执行者**：backend-expert（后端专家）
- **后端专家**在开发完成后自动生成OpenAPI文档
- 使用 `generate-openapi-doc` skill 生成 openapi.json
- 启动 Swagger UI（http://localhost:3000/api-docs）进行可视化验证
- 产出符合 OpenAPI 3.1 规范的文档
- 确保文档与代码实现完全同步

### 阶段6：Test（测试执行）

- **执行者**：test-expert（测试专家）
- 分为两个子阶段：
  - **6-1: 后端Swagger测试**（对照spec-api.md）
  - **6-2: 前端E2E测试**（基于openapi.json）
- 将测试结果写入 `active-bridge.md`
- **关键约束**：禁止跨层读取实现代码，只读spec-api.md、plan.md和openapi.json

### 阶段7：Verification（功能验证）

- **执行者**：architecture-planning-expert（架构专家）
- **架构专家**执行功能验证流程
- 确认测试覆盖率达标（核心代码≥60%，整体≥80%）
- 验证侧边栏入口可访问
- 确认功能闭环完整
- 生成功能验证报告，确认功能实现符合需求规格
- 验证通过则进入QA阶段，否则返回Test或Dev阶段

### 阶段8：QA（质量审计）⭐ 最终关卡

- **执行者**：qa-expert（QA专家）
- **QA专家**审计测试覆盖率是否满足plan.md需求
- 检查POC原则合规性
- **🚨 关键检查**：执行 `npm run build` 验证构建成功
- **🚨 关键检查**：执行 `npm run dev` 验证启动成功
- **🚨 关键检查**：验证浏览器访问和功能可访问性
- 编写 `qa-report.md` 质量检查报告
- **拥有任务关闭的最终否决权**
- 发现问题则回退到Dev阶段并反馈给**架构专家**协调修复

## Workflow Manager 集成机制

### 调用方式

由于系统限制，az-coding命令通过以下方式调用workflow-manager skill：

1. **创建工作流请求**：

   ```bash
   # 将用户输入写入工作流请求文件
   echo "$ARGUMENTS" > .az/workflow-requests/current-request.json
   ```

2. **触发workflow-manager skill**：
   - workflow-manager skill会自动检测到新的请求
   - 开始执行7阶段标准化流程
   - 在 `communication/.timestamps.json` 中记录状态和进度

3. **监控执行进度**：
   - 通过 `communication/.timestamps.json` 跟踪工作流进度
   - 实时向用户反馈当前阶段和状态
   - 处理异常情况和错误恢复

### 错误处理机制

1. **workflow-manager skill调用失败**：

   ```
   ❌ 工作流管理技能调用失败
   错误信息：{{具体错误}}

   🔄 建议操作：
   - 检查workflow-manager skill是否正确安装
   - 确认.az目录权限设置
   - 尝试手动调用skill: workflow-manager
   ```

2. **某个工作流阶段失败**：

   ```
   ⚠️ 工作流执行遇到问题

   📁 当前状态：{{当前阶段}} ({{进度}})
   🔄 可以手动继续：调用workflow-manager skill继续执行
   💾 工作流状态已保存，可随时恢复
   ```

3. **用户中断工作流**：

   ```
   ✅ 工作流已暂停

   📁 当前进度：{{当前阶段}}
   🔄 随时可以继续：使用 /az-coding 继续执行
   📋 工作状态已保存，不会丢失进度
   ```

4. **🚨 QA构建验证失败**：

   ```
   ❌ QA阶段验证失败：构建或启动异常

   🚨 关键阻塞项：
   - npm run build 失败：{{错误信息}}
   - npm run dev 启动失败：{{错误信息}}
   - 浏览器访问异常：{{错误信息}}

   🔄 必须修复步骤：
   1. 运行 npm run type-check 检查类型错误
   2. 运行 npm run lint 检查代码规范
   3. 修复所有类型和规范错误
   4. 重新运行 npm run build 验证构建
   5. 重新运行 npm run dev 验证启动
   6. 验证通过后可继续QA流程
   ```

### 进度反馈

```
🚀 启动9阶段标准化工作流...

📝 阶段1：需求规划 (Plan)
   ✅ 调用workflow-manager skill
   ⏳ 正在分析需求并拆解功能模块...
   ⏳ 正在生成时序图... ⭐ 新增
   ⏳ 正在展示时序图给用户确认... ⭐ 新增
   ✅ 用户确认时序图准确

🔍 阶段2：需求澄清 (Clarify)
   ✅ 计划文档已创建：plan-xxxx
   ✅ 时序图已嵌入：user-journeys.md ⭐ 新增
   🔍 启动需求澄清流程...
   ✅ 基于时序图反馈完善需求 ⭐ 新增
   ✅ 最终时序图确认完成 ⭐ 新增

📋 阶段3：任务拆解 (Tasks)
   ✅ 需求澄清完成，时序图已确认 ⭐ 更新
   ✅ 读取时序图提取API路径... ⭐ 新增
   📋 正在进行任务拆解和API契约定义...
   ✅ spec-api.md基于时序图API定义完成 ⭐ 新增

💻 阶段4：开发执行 (Dev)
   ✅ 任务拆解完成，spec-api.md已定义
   💻 正在调度专家进行开发...
   ✅ 后端串行开发（Backend → OpenAPI → Frontend）

📄 阶段5：OpenAPI文档生成
   ✅ 后端开发完成
   📄 正在生成OpenAPI文档...
   ✅ openapi.json已生成
   ✅ Swagger UI可访问：http://localhost:3000/api-docs

🧪 阶段6：测试执行 (Test)
   ✅ OpenAPI文档已生成
   🧪 正在执行测试...
   ✅ 后端Swagger测试通过（100%符合spec-api.md）
   ✅ 前端E2E测试通过（基于openapi.json）

✅ 阶段7：功能验证 (Verification)
   ✅ 测试覆盖率达标（82%）
   ✅ 正在执行功能验证流程...

🔬 阶段8：质量审计 (QA)
   ✅ 功能验证通过
   🔬 正在执行质量审计...
   🔬 正在验证构建和启动...
   🚨 npm run build 成功
   🚨 npm run dev 启动成功

🎉 项目完成！
   ✅ 质量审计通过
   🎉 项目完成，正在生成最终报告...
```

## 用户体验设计

### 无缝集成体验

- 用户只需使用熟悉的 `/az-coding` 命令
- 内部透明地调用workflow-manager skill
- 保持与原az-coding相同的命令接口

### 可视化进度

- 实时显示当前执行阶段
- 明确的进度指示器
- 详细的阶段完成状态

### 灵活性和可控性

- 支持中断后继续执行
- 提供手动操作选项
- 保留所有中间结果和状态

## 输出格式

### 成功完成所有阶段

```
🎉 9阶段标准化工作流执行完成！

📋 项目概述：
- 原始需求：{{用户输入的简要描述}}
- 工作流阶段：8个阶段全部完成
- 执行时长：{{开始时间}} - {{结束时间}}

📁 交付文档：
- 需求文档：`.az/{{plan-folder}}/plan.md`
- 用户旅途：`.az/{{plan-folder}}/user-journeys.md` ⭐ 新增：含时序图
- 任务文档：`.az/{{plan-folder}}/tasks.md`
- API契约：`.az/{{plan-folder}}/communication/spec-api.md`
- 协同记录：`.az/{{plan-folder}}/communication/active-bridge.md`
- 质量报告：`.az/{{plan-folder}}/qa-report.md`

📊 执行成果：
✅ 需求边界已明确
✅ 功能模块时序图已生成并确认 ⭐ 新增
✅ API契约已基于时序图定义 ⭐ 新增
✅ 任务拆解已完成
✅ 开发工作已完成
✅ 测试覆盖已完成（核心代码覆盖率：{{覆盖率}}%）
✅ 质量审计已通过
✅ 项目已成功交付

🧪 测试成果：
✅ Vitest单元测试：{{用例数}}个测试通过
✅ Playwright E2E测试：{{流程数}}个流程通过
✅ 测试覆盖率：{{覆盖率}}%

🚀 后续建议：
1. 基于交付物进行部署和上线
2. 定期更新和维护项目功能
3. 收集用户反馈持续改进
4. 为后续功能扩展做好准备
```

### 部分完成或中断

```
⚠️ 工作流部分完成

📁 项目文档：`.az/{{plan-folder}}/`
✅ 已完成阶段：{{已完成阶段列表}}
🔄 当前状态：{{当前阶段}} - {{阶段描述}}

💡 继续选项：
- 使用 `/az-coding` 继续执行工作流
- 或手动检查阶段文档进行后续操作
```

## 与Workflow Manager Skill的接口

### 请求格式

```json
{
  "request_id": "req-{{timestamp}}",
  "user_input": "$ARGUMENTS",
  "request_type": "workflow_start",
  "timestamp": "2025-12-25T11:00:00Z",
  "parameters": {
    "mode": "full",
    "priority": "P1",
    "expert_assignment": "auto"
  }
}
```

### 状态同步

- workflow-manager skill通过 `communication/.timestamps.json` 同步状态
- az-coding命令读取 `.timestamps.json` 获取当前进度
- 双向状态更新确保信息一致性

### 结果获取

- 工作流完成后，az-coding从 `.az/{{plan-folder}}/` 读取结果
- 汇总所有阶段的关键信息
- 生成最终的项目交付报告

## 上下文管理

### 状态保持

- 记录原始用户输入和需求
- 跟踪所有7个阶段的执行状态
- 保存每个阶段的中间结果和输出
- 维护工作流的完整执行历史

### 变量传递

```
USER_INPUT = "$ARGUMENTS"
WORKFLOW_ID = "workflow-{{timestamp}}"
PLAN_FOLDER = "{{workflow-manager生成的plan文件夹}}"
CURRENT_STAGE = "{{communication/.timestamps.json中的当前状态}}"
```

## 行为规则

- **透明性**：用户感知不到内部的skill调用细节，体验如同单一命令
- **可靠性**：任何阶段失败都提供明确的错误信息和恢复建议
- **可中断性**：用户可以在任何阶段中断，后续可继续执行
- **一致性**：输出格式与原az-coding保持一致，但增加9阶段工作流信息
- **可追溯性**：保留所有阶段的完整执行记录和中间结果

## 使用示例

### 典型使用流程

```bash
/az-coding 我想要开发一个学生管理系统，包含学生信息的增删改查功能
```

### 内部执行流程

```bash
# 步骤1：调用workflow-manager skill
workflow-manager skill接收用户输入："我想要开发一个学生管理系统..."

# 步骤2：执行9阶段工作流
workflow-manager执行：Plan → Clarify → Tasks → Dev → OpenAPI → Test → Verification → QA

# 步骤3：监控进度并反馈
az-coding实时显示进度并处理异常

# 步骤4：汇总结果
显示完整的9阶段工作流执行报告和交付物
```

## 上下文分析

用户正在使用az-coding命令进行9阶段标准化工作流开发。作为工作流管理指挥官，我需要：

1. **透明地调用workflow-manager skill**，保持用户体验的一致性
2. **实时监控和反馈**8个阶段的执行进度
3. **可靠的错误处理**，确保任何阶段失败都有明确的恢复路径
4. **完整的状态跟踪**，利用workflow-manager的时间戳跟踪机制
5. **专业的结果汇总**，展示完整的工作流价值和交付成果

## 9阶段工作流核心要点

1. ⭐ **spec-api.md是API契约的唯一权威来源**
2. ⭐ **user-journeys.md中的时序图是API路径的唯一来源**（新增）
3. 🚫 **禁止跨层读取实现代码**
4. ✅ **测试代码与实现代码同级目录**
5. 🚨 **QA专家拥有任务关闭的最终否决权**
6. ✅ **所有前后端交互必须先修改spec-api.md**
7. ✅ **Dev完成后必须在active-bridge.md标记状态**
8. ✅ **Test完成后必须在active-bridge.md记录测试结果**
9. 🚨 **npm run build必须成功才能通过QA**

这个设计成功地将az-coding命令与workflow-manager skill集成，实现了完整的9阶段标准化开发流程（包含OpenAPI文档生成和测试专家机制），同时保持了用户熟悉的单一命令体验。
