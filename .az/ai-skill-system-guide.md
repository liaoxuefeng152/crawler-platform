# AI 技能体系基础概念与工具指南

> 本文档整合 SkillNet、SkillOpt、本体论、知识图谱等核心概念，为 AI Agent 技能开发提供系统性参考。

---

## 一、基础概念速览（4句话讲清楚）

1. **本体（Ontology）**：领域的「标准化框架」，定义概念分类、属性字段、关系类型、约束规则，让人和机器对领域理解统一。

2. **实体（Entity）**：本体框架下的「具体实例」，如「文本摘要技能 v1.0」是一个实体，遵循本体定义的字段结构。

3. **知识图谱（Knowledge Graph）**：基于本体填充的海量实体 + 实体间关联数据，是「骨架（本体）」填充出的「血肉（实例）」。

4. **核心关系**：本体是 Schema/规则，知识图谱是数据/实例，二者共同支撑 SkillNet 的技能检索、SkillOpt 的技能优化、Agent 的自动编排。

---

## 二、SkillNet 与 SkillOpt 对比总览

### 核心定位

| 维度 | SkillNet | SkillOpt |
|------|----------|-----------|
| **定位** | AI 技能「基础设施」— 创建、评估、组织、连接 | AI 技能「内容优化器」— 自动迭代优化技能文档 |
| **解决问题** | 技能缺乏系统性积累，Agent「重复造轮子」 | 手写 Skill 文档不够精准，大概率不是最优 |
| **核心思路** | 把技能当「资产」组织和管理（统一本体 + 5维评估） | 把技能当「神经网络权重」训练（Rollout→Reflection→Edit→Validation） |
| **粒度** | 系统级：50万+技能库、技能关联图谱 | 文档级：单个 Skill 内容精准化 |
| **开源** | ✅ GitHub + REST API + Python SDK + MCP | ✅ GitHub (MIT协议) |
| **成本模式** | 技能复用节省重复探索成本 | 训练成本一次性，部署零开销 |

### 官方入口

| 项目 | 官网/仓库 | API | SDK |
|------|----------|-----|-----|
| **SkillNet** | https://github.com/zjunlp/SkillNet | http://api-skillnet.openkg.cn/v1/search | `pip install skillnet-ai` |
| **SkillOpt** | https://github.com/microsoft/SkillOpt | 无公开API | 项目内 Python 脚本 |
| **Web平台** | http://skillnet.openkg.cn | — | — |

---

## 三、本体论详解

### 1. 词源与计算机定义

| 维度 | 说明 |
|------|------|
| **哲学本源** | Ontology = 本体论，研究「世界存在哪些实体、实体如何分类、实体间本质关系」 |
| **计算机定义** | 领域标准化概念模型 + 语义规则，是约束领域的「统一框架/语法/骨架」 |
| **一句话理解** | 给领域定「名词、分类、字段、关系、规矩」，让人和机器理解统一 |

### 2. 本体五要素（任何领域本体都包含）

| 要素 | 定义 | SkillNet 示例 |
|------|------|---------------|
| **概念/类（Class）** | 领域大类、抽象事物 | AI技能、插件、参数、运行环境、使用场景 |
| **层级/继承** | 类间父子、分类关系 | AI技能 → 文本处理技能 → 摘要技能/分词技能 |
| **属性（Property）** | 每个类的特征、字段 | ID、名称、版本、描述、输入参数、输出参数 |
| **语义关系（Relation）** | 类/实体间关联 | 依赖、包含、适用于、相似、组合 |
| **公理/约束（Axiom）** | 强制规则、校验逻辑 | 「技能必须有唯一ID」「技能不能循环依赖」 |

### 3. SkillNet 技能本体定义内容

| 内容 | 具体规定 |
|------|----------|
| **技能分类体系** | 基础工具、文本处理、图像能力、推理编排、第三方接口等顶层大类 |
| **元数据标准** | 名称、唯一标识、版本、标签、开发者、适用场景、运行环境 |
| **调用接口规范** | Input Schema、Output Schema、调用方式(HTTP/本地/CLI)、参数类型约束 |
| **技能间语义关系** | 依赖、前置、组合、相似、互补、上下游 |
| **运行约束规则** | 环境兼容、权限、超时规则、依赖校验、禁止循环调用 |

---

## 四、本体 vs 知识图谱（核心区分）

### 核心比喻

```
本体（Ontology） = 数据表结构 / Schema / 模型骨架
    → 定义：有哪些表、有哪些字段、表之间关联、有什么约束
    → 特点：抽象、规则、稳定

知识图谱（KG） = 表里的真实数据 + 数据间关联记录
    → 内容：基于本体填充的实体实例
    → 特点：具象、海量、动态增长
```

### 详细对比

| 维度 | 本体（Ontology） | 知识图谱（Knowledge Graph） |
|------|-----------------|----------------------------|
| **核心定位** | 领域语义模型、规则、分类体系（元模型） | 基于本体的实体实例、关联数据 |
| **内容** | 类、层级、属性、关系、约束（纯抽象定义） | 实体、属性值、实体间具体关联（真实数据） |
| **变化频率** | 非常稳定，版本迭代慢 | 持续动态新增（不断上架新技能） |
| **核心作用** | 统一语义、制定标准、支撑逻辑推理 | 存储海量实体、提供检索、关联查询 |
| **角色** | 框架、语法、规则 | 内容、实例、数据 |

### SkillNet 实例说明

```
【技能本体（骨架）】
规定：
  - 存在「技能」和「参数」两个大类
  - 技能拥有「名称、版本」属性
  - 存在「依赖」「包含」两种关系
  - 约束：技能ID不可重复

【技能知识图谱（血肉/实例）】
填充真实数据：
  - 实体1：摘要技能 V1.0，名称=文本摘要，版本=1.0
  - 实体2：分词技能 V2.1
  - 具体关系：摘要技能 依赖 分词技能
  - 具体关系：摘要技能 包含 参数「原文文本」
```

### 二者依赖关系

- **知识图谱必须基于本体构建**：没有本体，知识图谱只是散乱「点和线」，机器不知道含义
- **本体是知识图谱的「语义大脑」**：赋予每个实体、每条关系业务含义和逻辑规则
- **SkillNet 采用「本体驱动的知识图谱」架构**

---

## 五、SkillNet 完整架构与技术栈

### 架构分层

```
┌─────────────────────────────────────────────────────────┐
│                    应用层                                │
│  API / 前端 / Next.js / Agent / OpenClaw                │
│  → 搜索：知识图谱语义检索（依托本体理解）                  │
│  → 编排：本体定义的依赖关系做逻辑推理                      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    数据层                                │
│  技能知识图谱（500,000+ 实体 + 关联数据）                 │
│  → 基于本体填充的海量技能实例                             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    框架层                                │
│  技能本体（Skill Ontology）                              │
│  → 定义标准、分类、关系、约束                             │
└─────────────────────────────────────────────────────────┘
```

### 核心能力

| 能力 | 说明 |
|------|------|
| **技能创建** | 从 GitHub仓库、PDF/PPT/Word文档、对话日志、自然语言提示 → 自动生成结构化技能包 |
| **技能搜索** | 关键词搜索 + 语义搜索（vector模式），支持分类过滤、星数过滤 |
| **5维评估** | Safety、Completeness、Executability、Maintainability、Cost-awareness |
| **技能关联** | similar_to、belong_to、compose_with、depend_on 关系自动发现 |
| **一键安装** | `skillnet download <url>` — 秒级获取任何 GitHub 技能 |

---

## 六、SkillOpt 训练循环详解

### 核心思路

**把 Skill 文档当成神经网络的「权重」，用训练神经网络的方式自动优化它。**

### 训练循环映射

| 深度学习概念 | SkillOpt 对应操作 |
|--------------|-------------------|
| **前向传播（forward pass）** | Rollout — Agent 带着当前 Skill 去做任务，收集结果 |
| **计算梯度（gradient）** | Reflection — 优化器模型分析失败原因，提炼改进方向 |
| **更新权重（weight update）** | Edit — 对 Skill 文档做 add/delete/replace 编辑 |
| **学习率（learning rate）** | Textual learning rate — 每轮最多改 4 条规则 + cosine decay |
| **Checkpoint/验证集** | Validation gating — 验证集分数没涨则拒绝本次修改 |

### 关键设计

| 设计 | 作用 |
|------|------|
| **克制编辑** | 每轮最多改 4 条规则（比不限制效果更好，避免震荡） |
| **Rejected-edit buffer** | 被拒绝的修改存入缓冲区，避免重复犯错 |
| **Slow/Meta update** | 跨 epoch 纵向更新，类似 momentum（去掉此项效果暴跌22.5分） |

### 两个模型分工

- **Target model（目标模型）**：实际干活的 Agent，模型参数冻结
- **Optimizer model（优化器模型）**：观察分析表现，提出 Skill 修改建议

### 效果数据

| 指标 | 数据 |
|------|------|
| **测试覆盖** | 52/52 全部最优或并列最优 |
| **平均提升** | +23.5 分 |
| **跨模型迁移** | 有效（GPT-4 → mini） |
| **跨环境迁移** | 有效（Codex → Claude Code） |

---

## 七、SkillNet + SkillOpt 协同关系

### 互补定位

```
┌─────────────────────────────────────────────────────────┐
│           AI Agent 技能体系                              │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
        ▼                                   ▼
┌───────────────┐                   ┌───────────────┐
│   SkillNet    │                   │   SkillOpt    │
│   (基础设施)   │                   │   (优化工具)   │
└───────────────┘                   └───────────────┘
        │                                   │
        │                                   │
┌───────┴───────────────────┐     ┌─────────┴─────────┐
│  • 50万+技能库            │     │  • 单个Skill优化   │
│  • 统一本体               │     │  • 内容精准化      │
│  • 5维度评估              │     │  • 训练循环        │
│  • 技能关联/可组合        │     │  • 验证集 gating   │
└───────────────────────────┘     └───────────────────┘
        │                                   │
        └───────────────────────────────────┘
                          │
                          ▼
                  ┌───────────────────┐
                  │   协同应用场景     │
                  └───────────────────┘
                  │
                  ▼
      SkillNet 提供「技能库和基础设施」
              +
      SkillOpt 对库中每个 Skill 进行「内容优化」
              =
      「从基础设施到内容质量」的完整解决方案
```

### 协同流程

```
1. SkillNet 搜索 → 找到相关技能库（基于本体语义理解）
2. SkillNet 下载 → 获取技能实体（遵循本体字段结构）
3. SkillNet 评估 → 5维度质量评分
4. SkillOpt 优化 → 对下载的技能进行内容精准化（训练循环）
5. 验证 → 在典型任务上测试效果
6. 上传 → 将优化后的技能贡献回 SkillNet（更新知识图谱）
```

---

## 八、应用场景示例

### 场景1：开发新功能时发现技能

```bash
# 搜索前端相关技能
curl "http://api-skillnet.openkg.cn/v1/search?q=frontend%20react&limit=10&sort_by=stars&min_stars=50000"

# 下载需要的技能
skillnet download https://github.com/facebook/react/blob/xxx/.claude/skills/test -d .claude/skills-external
```

### 场景2：优化现有 Skill 文档

```bash
# 使用 SkillOpt 手动流程
# 1. 选择 5 个典型任务
# 2. Agent 执行 → 记录失败模式
# 3. Reflection → 分析规则覆盖
# 4. 每轮最多改 4 条规则
# 5. Validation → 重新执行验证效果
```

### 场景3：从对话日志创建技能

```python
from skillnet_ai import SkillNetClient

client = SkillNetClient(api_key="sk-...")

# 将 Agent 执行轨迹转换为技能
client.create(
    trajectory_content="User: 开发表格页面\nAgent: 使用 DataTable + gap-4...",
    output_dir=".claude/skills-custom"
)

# 评估新技能
result = client.evaluate(target=".claude/skills-custom/new-skill")
```

---

## 九、常见误区总结

| 误区 | 正解 |
|------|------|
| ❌ 本体 = 知识图谱 | ✅ 本体是 Schema/规则，知识图谱是基于该模型的实例数据 |
| ❌ 本体是知识图谱里的一张图 | ✅ 本体是「画图的规则」，图谱是「画出来的图」 |
| ❌ SkillNet 和 SkillOpt 是竞争关系 | ✅ 是互补关系：SkillNet 解决「存和组织」，SkillOpt 解决「写得好不好」 |
| ❌ 技能本体只是文档结构 | ✅ 是完整语义体系：分类、属性、关系、约束、逻辑推理规则 |

---

## 十、极简记忆版（快速复盘）

| 概念 | 一句话定义 |
|------|-----------|
| **本体** | 给领域定概念、分类、字段、关系、规则的标准框架 |
| **实体** | 本体框架下的具体实例（如「摘要技能 v1.0」） |
| **知识图谱** | 基于本体填充的海量实体 + 关联数据 |
| **SkillNet** | AI 技能基础设施：统一本体 + 50万技能库 + 5维评估 + 技能关联 |
| **SkillOpt** | AI 技能内容优化：训练循环 → 自动迭代优化 Skill 文档 |
| **协同关系** | SkillNet 提供原料库（存），SkillOpt 精准优化内容（优） |

---

## 附录：关键链接

| 资源 | 链接 |
|------|------|
| SkillNet GitHub | https://github.com/zjunlp/SkillNet |
| SkillNet API | http://api-skillnet.openkg.cn/v1/search |
| SkillNet Web | http://skillnet.openkg.cn |
| SkillOpt GitHub | https://github.com/microsoft/SkillOpt |
| SkillNet 论文 | https://arxiv.org/abs/2603.04448 |
| SkillOpt 论文 | https://arxiv.org/abs/2605.23904 |
| OpenClaw 集成 | https://github.com/openclaw/openclaw |

---

## 附录一：关键链接

| 资源 | 链接 |
|------|------|
| SkillNet GitHub | https://github.com/zjunlp/SkillNet |
| SkillNet API | http://api-skillnet.openkg.cn/v1/search |
| SkillNet Web | http://skillnet.openkg.cn |
| SkillOpt GitHub | https://github.com/microsoft/SkillOpt |
| SkillNet 论文 | https://arxiv.org/abs/2603.04448 |
| SkillOpt 论文 | https://arxiv.org/abs/2605.23904 |
| OpenClaw 集成 | https://github.com/openclaw/openclaw |

---

## 附录二：SkillOpt 安装与使用指南

### 1. 安装

```bash
# 克隆项目（本地路径：/home/wangzhenke/wzk-workspace/SkillOpt-main）
git clone https://github.com/microsoft/SkillOpt.git
cd SkillOpt

# 安装核心依赖（Python 3.10+）
pip install -e .

# 可选：安装特定 benchmark 支持
pip install -e ".[alfworld]"  # ALFWorld
pip install -e ".[claude]"    # Claude backend
pip install -e ".[qwen]"      # Qwen/vLLM
pip install -e ".[webui]"     # Gradio 监控面板
pip install -e ".[alfworld,claude,qwen,webui,dev]"  # 全部安装
```

### 2. 环境变量配置（必须）

复制 `.env.example` 到 `.env` 并配置：

```bash
# Azure OpenAI（必须配置 endpoint）
export AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com/"
export AZURE_OPENAI_API_KEY="your-key"

# 或使用 OpenAI 直接
export OPENAI_API_KEY="sk-..."

# 或使用 Anthropic Claude
export ANTHROPIC_API_KEY="sk-ant-..."

# 或使用本地 Qwen/vLLM
export QWEN_CHAT_BASE_URL="http://localhost:8000/v1"
export QWEN_CHAT_MODEL="Qwen/Qwen2.5-4B"
```

**注意**：`AZURE_OPENAI_ENDPOINT` 必须配置，否则所有 LLM 调用会失败。

### 3. 运行训练

```bash
# 基础训练命令
python scripts/train.py \
    --config configs/searchqa/default.yaml \
    --split_dir /path/to/your/data_split \
    --azure_openai_endpoint https://your-resource.openai.azure.com/ \
    --optimizer_model gpt-4o \
    --target_model gpt-4o \
    --num_epochs 4 \
    --batch_size 40

# 或使用快捷脚本
bash scripts/run_searchqa.sh
bash scripts/run_alfworld.sh
bash scripts/run_spreadsheetbench.sh --split_dir /path/to/split
```

### 4. 核心配置参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--optimizer_model` | 分析失败的优化器模型 | gpt-4o |
| `--target_model` | 执行任务的 Agent 模型 | gpt-4o |
| `--num_epochs` | 训练轮数 | 4 |
| `--batch_size` | 每轮任务数 | 40 |
| `--learning_rate` | 每轮最多修改规则数 | 4 |
| `--lr_scheduler` | 学习率调度器 | cosine |
| `--use_slow_update` | 跨 epoch momentum | true |
| `--use_meta_skill` | 跨 epoch 策略记忆 | true |
| `--use_gate` | 验证集 gating（必须开启） | true |

### 5. 6 阶段训练循环

```
1. Rollout → Agent 带着 Skill 执行任务，收集结果
2. Reflect → 优化器分析失败原因，生成修改建议
3. Aggregate → 合并相似的修改建议
4. Select → 按 learning_rate 筛选修改（最多4条）
5. Update → 应用修改到 Skill 文档
6. Gate → 验证集测试，分数没涨则拒绝本次修改
```

### 6. 支持的 Benchmark

| Benchmark | 类型 | Config | 特点 |
|-----------|------|--------|------|
| SearchQA | QA 搜索 | `configs/searchqa/` | batch_size=40, max_turns=1 |
| ALFWorld | 具身 Agent | `configs/alfworld/` | 需要 alfworld 包 |
| DocVQA | 文档理解 | `configs/docvqa/` | image_detail=auto |
| SpreadsheetBench | Excel 代码生成 | `configs/spreadsheetbench/` | mode=multi, exec_timeout |
| LiveMathBench | 数学推理 | `configs/livemathematicianbench/` | shuffle=true |
| OfficeQA | Office 操作 | `configs/officeqa/` | search_mode=offline |

### 7. 使用自定义数据

**数据格式**：

```
data/my_split/
├── train/items.json
├── val/items.json
└── test/items.json
```

**items.json 结构**：

```json
[
  {
    "id": "unique_item_id",
    "question": "任务描述",
    "context": "上下文信息",
    "answers": ["预期答案"]
  }
]
```

**运行**：

```bash
python scripts/train.py \
    --config configs/searchqa/default.yaml \
    --split_dir data/my_split \
    --target_model gpt-4o
```

### 8. 仅评估（不训练）

```bash
python scripts/eval_only.py \
    --config configs/searchqa/default.yaml \
    --skill outputs/my_run/best_skill.md \
    --split valid_unseen \
    --split_dir /path/to/split
```

### 9. 输出结构

```
outputs/<run_name>/
├── config.json              # 运行配置
├── history.json             # 训练历史
├── runtime_state.json       # 断点续训 checkpoint
├── best_skill.md            # 最优 Skill 文档（最终产物）
├── skills/skill_vXXXX.md    # 每步 Skill 快照
├── steps/step_XXXX/         # 每步详细记录
├── slow_update/epoch_XX/    # 慢更新记录
└── meta_skill/epoch_XX/     # 元技能记录
```

### 10. WebUI 监控面板

```bash
pip install -e ".[webui]"
python -m skillopt_webui.app --port 7860
# 访问 http://localhost:7860 实时查看训练进度
```

### 11. 断点续训

如果训练中断，重新运行相同命令即可自动从上次 checkpoint 继续。

---

## 附录三：本地 SkillOpt 项目路径

项目已克隆到本地：`/home/wangzhenke/wzk-workspace/SkillOpt-main`

关键文件位置：

| 文件 | 路径 | 用途 |
|------|------|------|
| 主文档 | `README.md` | 项目概述 |
| 安装指南 | `docs/guide/installation.md` | 详细安装步骤 |
| 训练循环 | `docs/guide/training-loop.md` | 6阶段详解 |
| 新 Benchmark | `docs/guide/new-benchmark.md` | 自定义 benchmark |
| 配置详解 | `docs/guide/config.md` | 参数说明 |
| 训练脚本 | `scripts/train.py` | 主入口 |
| 评估脚本 | `scripts/eval_only.py` | 仅评估 |
| 核心引擎 | `skillopt/engine/trainer.py` | ReflActTrainer |
| 模型后端 | `skillopt/model/` | Azure/Claude/Qwen 支持 |
| 优化器 | `skillopt/optimizer/` | Edit/Clip/Scheduler |
| 评估 Gate | `skillopt/evaluation/gate.py` | 验证集 gating |
| Benchmark 模板 | `skillopt/envs/_template/` | 新 benchmark 模板 |

---

**文档生成时间**: 2026-05-28
**来源**: SkillNet/SkillOpt 官方文档 + API实测 + 本地项目探索 + 豆包本体论解读