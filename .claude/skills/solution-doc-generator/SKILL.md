---
name: solution-doc-generator
description: Generate standardized solution documentation (architecture docs / integration specs) in Markdown format. Use this skill whenever the user needs to create system architecture documents, API integration specifications, technical design documents, or any structured solution documentation. Triggers on phrases like "架构文档", "接口交互方案", "系统架构", "技术方案", "接口文档", "方案文档", "生成文档", "write architecture", "system design doc", "integration spec", or when documenting system design and integration patterns. This skill works with user-story-mermaid skill for sequence diagram generation.
---

# Solution Document Generator

Generate standardized solution documentation with two modes: **architecture** (system design) and **integration** (API contracts).

## ⚠️ CRITICAL: Output Requirements

**This skill MUST generate a complete Markdown document file (.md)**, not just sequence diagrams or fragments.

**When triggered, you MUST:**

1. Create a `.md` file containing the full document structure
2. Follow the exact chapter structure defined in this skill
3. Write each chapter content completely (not just placeholders)
4. Save the output file to disk using the Write tool

**DO NOT:**

- Only generate sequence diagrams without the full document
- Only output fragments in chat without saving a .md file
- Skip any required chapters

## Output Format

All outputs are **Markdown (.md)** files with standardized structure, saved to disk.

---

## Mode Selection

| Mode           | Trigger Phrases                                | Use Case                                               |
| -------------- | ---------------------------------------------- | ------------------------------------------------------ |
| `architecture` | "架构文档", "系统架构", "system architecture"  | New system design, product review, architecture review |
| `integration`  | "接口交互方案", "接口文档", "integration spec" | System integration, API contracts, technical handoff   |

---

## Document Structure Comparison

### Architecture Mode (4+1 Chapters)

```
一、系统定位（必选）
├── 1.1 业务定位 ← bullet list（核心功能列表）
└── 1.2 系统角色 ← 角色对照表（角色 | 说明）

二、技术架构（必选）
├── 2.1 技术栈概览 ← ASCII 分层架构图
├── 2.2 核心技术栈 ← 表格（组件 | 技术选型 | 用途）
└── 2.3 目录结构 ← 项目文件树

三、用户故事（必选）
├── 3.1 用户故事清单 ← 汇总表（按角色分组，含优先级）
└── 3.x 每个用户故事：
    ├── 功能说明（1-2句）
    ├── 页面路径（可选）
    ├── 页面布局 ASCII 图（可选）
    └── Mermaid 时序图（调用 user-story-mermaid）

四、状态流转（必选）
├── 4.1 主实体状态 ← 状态定义表
├── 4.2 子状态（如有外部系统协作）
└── 4.3 状态流转图 ← ASCII 状态机图

五、存储架构（可选）
├── 仅当需求涉及文件存储/对象存储时生成
└── 5.1 存储配置 + 5.2 目录结构
```

### Integration Mode (5+3 Chapters)

```
一、MinIO存储结构（可选）
├── 1.1 目录结构 ← 文件树
├── 1.2 目录职责 ← 创建方/用途表
└── 1.3 路径规则 ← 命名规范

二、双方职责（必选）
├── 2.1 系统A职责 ← 职责表
└── 2.2 系统B职责 ← 职责表

三、业务流程（必选）
└── 交互时序图 ← 调用 user-story-mermaid

四、Kafka队列设计（可选）
├── 4.1 环境配置
└── 4.2 阂列定义 ← 阂列表（队列名 | 创建方 | 生产者 | 消费者 | 用途）

五、消息格式（必选）
├── 5.1 任务消息格式 ← JSON示例或引用
└── 5.2 结果消息格式 ← JSON示例或引用

六、REST API（必选）
└── 6.x 每个接口：URL + HTTP方法 + 说明（可引用外部文档）

七、任务状态设计（必选）
├── 7.1 主实体状态 ← 状态定义表
├── 7.2 子状态 ← 子状态表
├── 7.3 状态流转 ← ASCII 图
└── 7.4 进度追踪 ← 进度规则表

八、环境变量（必选）
└── 配置表（变量名 | 说明）
```

---

## Input Collection Workflow

### Architecture Mode: Step-by-Step Collection

**Step 1: Document Metadata**

- Project name, version
- Author, stakeholders
- Related documents (links)

**Step 2: System Positioning**

- Business positioning: Core features (3-8 items, bullet list)
- System roles: Role responsibilities table (2-4 roles)

**Step 3: Technical Architecture**

- Auto-extract from project: `package.json`, `CLAUDE.md`, or user input
- Generate ASCII architecture diagram (Frontend → API → Data/Storage/Messaging layers)
- Generate tech stack table (Component | Selection | Purpose)
- Extract project directory structure

**Step 4: User Story List**

- Collect by role groups (Regular User / Admin)
- Each story: Name + Description + Priority (P0/P1/P2)

**Step 5: User Story Details (Per Story)**

For each user story, collect sequence diagram requirements:

```
Q1: 功能说明是什么？（1-2句话）

Q2: 用户角色是什么？
    → Options: User（普通用户）/ Admin（管理员）/ Manager（管理者）

Q3: 涉及哪些系统参与者？（最多5个）
    → Options: Platform / DB / MinIO / AI（外部系统）/ Kafka（消息队列）

Q4: 流程类型是什么？
    → Options: sync / async_with_polling / async_with_callback

Q5: 请描述 Step 划分（最多7个）：
    → Format: Step编号 + 标题 + 简要描述 + 关键API调用

Q6: 是否涉及异步处理？（仅当流程类型为async时）
    → Kafka: topic名称、生产者、消费者
    → Polling: 轮询频率、查询API、展示方式

Q7: 用户最终感知的结果是什么？（闭环验证）

Q8: 约束验证
    → Steps数量 ≤ 7, Participants数量 ≤ 5
```

After collection, call `Skill(user-story-mermaid)` to generate sequence diagram.

**Step 6: State Transitions**

- Main entity states: State table (Status | Chinese Name | Description | Trigger)
- Sub-states (if external system collaboration)
- State flow description → Generate ASCII state diagram

**Step 7: Storage Architecture (Optional)**

- Prompt: "是否涉及文件存储？"
- If yes: Storage config table + Directory structure tree

**Step 8: Output**

- Generate `{ProjectName}系统架构.md`

---

### Integration Mode: Step-by-Step Collection

**Step 1: Document Metadata**

- Project name, version
- System A name + owner, System B name + owner

**Step 2: Storage Structure (Optional)**

- Prompt: "是否涉及共享存储？"
- If yes: Directory tree + Directory responsibility table + Path rules

**Step 3: Dual Responsibilities**

- System A responsibilities table
- System B responsibilities table

**Step 4: Business Flow**

- Collect sequence diagram requirements (same format as Architecture Step 5)
- Call `Skill(user-story-mermaid)` to generate integration sequence diagram

**Step 5: Message Queue (Optional)**

- Prompt: "是否使用消息队列？"
- If yes: Environment config + Queue definition table

**Step 6: Message Formats**

- Task message format (JSON example or reference to external doc)
- Result message format (JSON example or reference)

**Step 7: REST API**

- Collect API list
- Each API: URL + HTTP method + Description (can reference external docs)

**Step 8: Task State Design**

- Main entity state table
- Sub-state table
- State flow description
- Progress tracking rules

**Step 9: Environment Variables**

- Config table (Variable Name | Description)

**Step 10: Output**

- Generate `{ProjectName}接口交互方案.md`

---

## Interaction with user-story-mermaid Skill

### Trigger Timing

Call `Skill(user-story-mermaid)` when:

- Architecture mode: Step 5 (User Story Details)
- Integration mode: Step 4 (Business Flow)

### Data Structure to Pass

```yaml
# User Story Sequence Diagram Request
userStorySequenceRequest:
  # Basic Info
  storyId: 'US-01'
  storyName: '我要AI分析资产包'
  storyDescription: '用户创建资产包、上传借款人列表、上传压缩包，系统异步分析并返回结果'

  # Participants (max 5)
  participants:
    - role: 'User'
      alias: '用户'
      type: 'user_role'
    - role: 'Platform'
      alias: '个贷处置平台'
      type: 'system_actor'
    - role: 'DB'
      alias: 'MongoDB'
      type: 'storage'
    - role: 'MinIO' # Optional: file storage
      alias: 'MinIO存储'
      type: 'file_storage'
    - role: 'AI' # Optional: external service
      alias: '个贷字段提取系统'
      type: 'external_service'

  # Flow Type
  flowType: 'async_with_polling' # sync | async_with_polling | async_with_callback

  # Step Breakdown (max 7)
  steps:
    - stepNumber: 1
      title: '创建资产包基本信息'
      purpose: '用户填写基本信息，系统创建记录'
      stepType: 'entry'
    - stepNumber: 2
      title: '上传借款人列表'
      purpose: '下载模板、填写上传、保存列表'
      stepType: 'action'
    - stepNumber: 3
      title: '上传资产包压缩包'
      purpose: '分片上传文件到存储'
      stepType: 'action'
    - stepNumber: 4
      title: '异步通知AI系统'
      purpose: '发送Kafka消息通知处理'
      stepType: 'async'
      kafkaTopics:
        - topic: 'dev_khc_loan_task_input'
          direction: 'send'
        - topic: 'dev_khc_loan_task_result'
          direction: 'receive'
    - stepNumber: 5
      title: '轮询查询解析结果'
      purpose: '用户实时查看进度'
      stepType: 'async'
      polling:
        frequency: '每10秒'
        api: 'GET /api/v1/tasks/{package_no}'
    - stepNumber: 6
      title: '消费解析结果'
      purpose: '同步数据、更新状态、展示结果'
      stepType: 'display'

  # Key API Calls
  apiCalls:
    - step: 1
      method: 'POST'
      path: '/api/asset-packages'
      response: '返回 packageId'
    - step: 2
      method: 'POST'
      path: '/api/asset-packages/{id}/debtors'
    - step: 5
      method: 'GET'
      path: '/api/v1/tasks/{package_no}'
      inLoop: true

  # Constraints Validation
  constraints:
    stepsCount: 6 # Must ≤ 7
    participantsCount: 5 # Must ≤ 5

  # Closure Verification
  closure:
    finalResult: "用户看到'已完成'状态和借款人列表"
    userPerceives: true
```

### Calling Format (Simplified)

When calling the skill, use this simplified format:

```
用户故事：US-01 我要AI分析资产包

功能说明：用户创建资产包、上传借款人列表、上传压缩包，系统异步分析并返回结果

参与者：用户、个贷处置平台、MongoDB、MinIO存储、个贷字段提取系统

流程类型：异步+轮询

Step划分：
1. 创建资产包基本信息 - POST /api/asset-packages → 返回 packageId
2. 上传借款人列表 - GET模板 → POST /api/asset-packages/{id}/debtors → 保存成功
3. 上传资产包压缩包 - 分片上传流程 → 状态变更为"分析中"
4. 异步通知AI系统 - Kafka: dev_khc_loan_task_input发送任务
5. 轮询查询解析结果 - loop 每10秒，GET /api/v1/tasks/{package_no}，显示进度条
6. 消费解析结果 - 同步数据 → 状态"已完成" → 展示借款人列表

约束验证：Steps=6, Participants=5，符合规范

闭环验证：用户最终看到"已完成"状态和借款人列表
```

---

## Constraints

| Constraint             | Limit        | Reason                          |
| ---------------------- | ------------ | ------------------------------- |
| User stories           | ≤ 7 per role | Prevents document bloat         |
| Steps per story        | ≤ 7          | Prevents sequence diagram bloat |
| Participants per story | ≤ 5          | Prevents horizontal sprawl      |

If exceeded, **merge or simplify** before generating.

---

## Output Templates

Refer to bundled templates in `templates/` directory:

| Template         | File                              | Usage                                 |
| ---------------- | --------------------------------- | ------------------------------------- |
| Architecture     | `templates/architecture.md`       | System architecture documents         |
| Integration      | `templates/integration.md`        | API integration specifications        |
| Sequence Request | `templates/sequence-request.yaml` | Data structure for user-story-mermaid |

---

## Examples

Refer to bundled examples in `examples/` directory:

| Example                 | Description                             |
| ----------------------- | --------------------------------------- |
| 个贷处置平台系统架构.md | Architecture mode example (4 chapters)  |
| 个贷系统接口交互方案.md | Integration mode example (5+3 chapters) |

---

## Quick Reference

### Participant Naming

| Type       | Names                                     |
| ---------- | ----------------------------------------- |
| User roles | `User`, `Admin`, `Manager`                |
| Systems    | `Platform`, `Frontend`, `Backend`         |
| Storage    | `DB`, `MinIO`, `Redis`                    |
| External   | `AI`, `ExternalService`, `PaymentGateway` |
| Messaging  | `Kafka`, `MQ`                             |

### HTTP Methods

| Method   | Purpose         |
| -------- | --------------- |
| `GET`    | Retrieve data   |
| `POST`   | Create new      |
| `PUT`    | Update existing |
| `PATCH`  | Partial update  |
| `DELETE` | Remove          |

### Flow Types

| Type                  | Description                               |
| --------------------- | ----------------------------------------- |
| `sync`                | Simple CRUD, request → immediate response |
| `async_with_polling`  | Long task, user actively queries progress |
| `async_with_callback` | Long task, system notifies result         |

---

## Document Footer

Every generated document should end with:

```markdown
---

**文档维护者**: {Author}
**最后更新**: {Date}
**版本**: v{Version}
```
