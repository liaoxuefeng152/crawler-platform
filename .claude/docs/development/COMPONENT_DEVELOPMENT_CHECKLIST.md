# shadcn/ui 组件开发检查清单

## 📋 组件开发决策流程

### ✅ 阶段一：需求分析 (Requirement Analysis)

- [ ] **功能需求分解**
  - [ ] 明确组件的核心功能和交互需求
  - [ ] 识别所需的props接口和数据流
  - [ ] 评估可访问性(a11y)要求
  - [ ] 确定响应式设计需求

- [ ] **现有组件评估**
  - [ ] 查询项目现有组件库（使用 `npx shadcn@latest mcp`）
  - [ ] 评估现有组件的可复用性
  - [ ] 分析组件组合的可能性
  - [ ] 评估通过props扩展现有组件的可行性

### 📊 阶段二：技术方案决策 (Technical Decision)

#### 优先级评估矩阵

| 方案            | 可复用性 (权重:4) | 可扩展性 (权重:3) | shadcn可用性 (权重:2) | 特殊功能匹配度 (权重:1) | 总分 |
| --------------- | ----------------- | ----------------- | --------------------- | ----------------------- | ---- |
| 现有组件组合    |                   |                   |                       |                         |      |
| 扩展现有组件    |                   |                   |                       |                         |      |
| shadcn+Tailwind |                   |                   |                       |                         |      |
| 引入外部库      |                   |                   |                       |                         |      |

- [ ] **选择最优方案**（总分最高的方案）
- [ ] 确认技术栈兼容性
- [ ] 评估开发和维护成本

## 🔧 阶段三：实现方案 (Implementation)

### 方案A：现有组件组合利用

- [ ] 使用MCP工具查询组件定义：
  ```bash
  npx shadcn@latest mcp "查询 [组件名] 的API和变体配置"
  ```
- [ ] 确认正确的导入路径（`@/components/ui/xxx`）
- [ ] 通过props定制样式和行为
- [ ] 测试组件组合的交互效果
- [ ] 确保符合项目主题系统

### 方案B：shadcn + Tailwind 开发新组件

- [ ] 安装所需shadcn组件：
  ```bash
  npx shadcn@latest add [组件名]
  ```
- [ ] 应用项目主题色彩系统
- [ ] 实现responsive design
- [ ] 添加accessibility支持
- [ ] 集成现有设计系统

### 方案C：引入外部组件库评估

- [ ] 评估必要性和兼容性
- [ ] 检查包大小影响
- [ ] 确认与shadcn/ui无冲突
- [ ] 评估长期维护成本
- [ ] 获得架构师批准

---

## 📄 阶段四：组件skill文档自动化维护

### 🤖 为什么需要组件skill文档

- [ ] **知识资产沉淀**：将组件使用经验转化为可复用的skill文档
- [ ] **提升开发效率**：future AI agents可直接调用文档化的组件知识
- [ ] **保持文档同步**：组件更新时自动更新相关文档
- [ ] **降低维护成本**：减少重复性的文档编写工作

### 📝 组件skill文档创建检查清单

#### 文档生成前准备

- [ ] 确认组件已通过所有质量检查
- [ ] 整理组件的使用示例代码（至少2-3个典型场景）
- [ ] 提取组件的关键配置选项
- [ ] 收集组件的常见使用场景

#### 文档结构标准

- [ ] **基本描述**：组件功能概述（1-2句话）
- [ ] **核心特性**：列出3-5个关键特性
- [ ] **使用场景**：列举2-3个典型应用场景（带完整代码示例）
- [ ] **快速开始**：提供最简使用示例
- [ ] **Props API**：完整的Props接口说明（类型定义、默认值、必填项）
- [ ] **注意事项**：使用限制、常见问题
- [ ] **最佳实践**：使用建议和常见陷阱
- [ ] **相关组件**：相关组件的链接

#### Skill文档创建流程

- [ ] **方式一：使用skill-creator创建**（推荐用于核心组件）
  1. 初始化skill：
     ```bash
     python3 .claude/skills/skill-creator/scripts/init_skill.py [component-name] \
       --path .claude/skills/component-library/[category]
     ```
  2. 编写SKILL.md内容（参考模板：`.claude/skills/component-library/SKILL_TEMPLATE.md`）
  3. 清理示例文件：
     ```bash
     rm -rf .claude/skills/component-library/[category]/[component-name]/scripts \
            .claude/skills/component-library/[category]/[component-name]/references \
            .claude/skills/component-library/[category]/[component-name]/assets
     ```
  4. 打包skill：
     ```bash
     python3 .claude/skills/skill-creator/scripts/package_skill.py \
       .claude/skills/component-library/[category]/[component-name]
     ```

- [ ] **方式二：使用模板复制创建**（推荐用于简单组件）
  1. 创建目录：
     ```bash
     mkdir -p .claude/skills/component-library/[category]/[component-name]
     ```
  2. 复制模板并编辑：
     ```bash
     cp .claude/skills/component-library/SKILL_TEMPLATE.md \
        .claude/skills/component-library/[category]/[component-name]/SKILL.md
     ```
  3. 填写组件文档内容
  4. 打包skill（如方式一第4步）

- [ ] **验证文档完整性**：
  ```bash
  npm run check:component-skills
  ```

#### 更新L1索引skill

- [ ] 更新 `.claude/skills/component-library-guide/SKILL.md`
  - 在"核心组件详解"中添加新组件的快速索引
  - 在"按功能快速查找"中添加新组件的条目
  - 在"按分类浏览"中添加新组件的分类

### 🔄 文档同步维护机制

#### 组件更新时的文档同步

- [ ] **组件功能变更时**：
  - [ ] 更新组件功能后，同步更新skill文档中的Props API
  - [ ] 更新使用场景示例
  - [ ] 在commit message中标记"docs: update [component-name] skill"
  - [ ] 重新打包skill

- [ ] **组件版本升级时**：
  - [ ] 更新文档中的版本号和更新日志
  - [ ] 标注破坏性变更（如有）
  - [ ] 更新迁移指南（如需要）

#### 定期文档审查

- [ ] **每月自动检查**：
  ```bash
  npm run audit:component-skills
  ```
- [ ] **每季度深度审查**：
  - [ ] 检查文档示例代码是否可运行
  - [ ] 移除过时的使用示例
  - [ ] 补充新的使用场景
  - [ ] 更新最佳实践建议

### 📚 文档使用方式

#### AI Agent调用

- [ ] **frontend-expert调用**：
  ```typescript
  // 在组件开发前调用
  /skill component-library-guide
  ```
- [ ] **architecture-planning-expert调用**：
  ```typescript
  // 在架构规划时调用
  /skill component-library-guide
  ```

#### 开发者查询

- [ ] **通过CLAUDE.md导航**：
  - 查看"组件开发指南"章节
  - 找到"component-library-guide"skill
  - 调用skill获取组件信息

- [ ] **快速参考命令**：
  ```bash
  # 查看组件索引
  cat .claude/skills/component-library-guide/SKILL.md

  # 查看具体组件文档
  cat .claude/skills/component-library/[category]/[component-name]/SKILL.md

  # 验证文档完整性
  npm run check:component-skills
  ```

### ✅ 组件文档完成标准

- [ ] ✅ 文档已创建在标准位置（`.claude/skills/component-library/[category]/[component-name]/SKILL.md`）
- [ ] ✅ 包含完整的Props API说明
- [ ] ✅ 包含至少2个使用场景示例（带完整代码）
- [ ] ✅ 已通过验证脚本检查（`npm run check:component-skills`）
- [ ] ✅ 已更新L1索引（`component-library-guide/SKILL.md`）
- [ ] ✅ 已打包为.skill文件
- [ ] ✅ 文档示例代码可运行且准确

---

## 🎯 MCP工具使用检查

### 必须使用的MCP查询命令：

- [ ] **组件定义查询**：

  ```bash
  npx shadcn@latest mcp "查询项目中已有的 [组件名] 组件定义、API 和导入路径"
  ```

- [ ] **变体配置分析**：

  ```bash
  npx shadcn@latest mcp "分析现有 [组件名] 的变体、尺寸和配置选项"
  ```

- [ ] **依赖管理检查**：

  ```bash
  npx shadcn@latest mcp "确认 [组件名] 所需的 Radix UI 依赖和包管理"
  ```

- [ ] **主题集成验证**：
  ```bash
  npx shadcn@latest mcp "确保新组件符合项目主题系统"
  ```

## 📏 质量检查清单

### TypeScript类型安全

- [ ] 完整的TypeScript类型定义
- [ ] 避免`any`类型，优先使用`unknown`
- [ ] 正确的props接口定义
- [ ] 泛型类型使用（如需要）

### 设计系统一致性

- [ ] 符合项目主题色彩规范
- [ ] 使用统一的spacing和typography
- [ ] 遵循现有的border-radius和shadow规范
- [ ] 保持与现有组件的视觉一致性

### 可访问性(a11y)

- [ ] 支持键盘导航
- [ ] 适当的ARIA标签
- [ ] 屏幕阅读器支持
- [ ] 色彩对比度符合WCAG标准

### 性能优化

- [ ] 合理的渲染性能
- [ ] 避免不必要的重渲染
- [ ] 优化包大小影响
- [ ] 适当的懒加载（如需要）

### 代码质量

- [ ] 清晰的API接口设计
- [ ] 完整的props文档注释
- [ ] 可测试的组件逻辑
- [ ] 遵循项目代码规范

## 🧪 测试验证

### 功能测试

- [ ] 基本功能正常工作
- [ ] 边缘情况处理
- [ ] 错误状态处理
- [ ] 加载状态表现

### 兼容性测试

- [ ] 多浏览器兼容性
- [ ] 响应式设计测试
- [ ] 与现有组件无冲突
- [ ] 主题切换正常工作

### 用户体验测试

- [ ] 交互流畅性
- [ ] 视觉效果一致性
- [ ] 加载性能感知
- [ ] 错误提示友好性

## 📚 文档要求

- [ ] 组件使用文档
- [ ] Props接口说明
- [ ] 使用示例代码
- [ ] 设计原则说明

## ⚠️ 常见错误避免

### ❌ 不要做的事情：

- [ ] 不使用MCP工具直接编写组件导入路径
- [ ] 使用硬编码颜色而非主题变量
- [ ] 忽略现有组件直接开发新组件
- [ ] 引入外部组件库前未做评估
- [ ] 不考虑可访问性要求

### ✅ 必须做的事情：

- [ ] 优先使用现有组件组合
- [ ] 每次都使用MCP工具查询组件信息
- [ ] 保持与设计系统的一致性
- [ ] 编写类型安全的代码
- [ ] 测试组件的兼容性和性能

---

## 🚀 快速参考

### MCP查询模板

```bash
# 查询组件
npx shadcn@latest mcp "查询 [组件名] 组件"

# 分析变体
npx shadcn@latest mcp "分析 [组件名] 变体配置"

# 添加组件
npx shadcn@latest add [组件名]

# 检查依赖
npx shadcn@latest mcp "检查 [组件名] 依赖"
```

### 优先决策流程

1. **现有组件** → 2. **组件组合** → 3. **shadcn+Tailwind** → 4. **外部库**

### 导入路径规范

```typescript
// 正确 ✅
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 错误 ❌
import { Button } from '@/lib/ui/button';
import Button from '../button';
```

---

_此检查清单确保所有组件开发都遵循项目标准，最大化现有组件利用率，并保持代码质量和设计系统一致性。_
