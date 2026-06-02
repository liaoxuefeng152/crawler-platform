# 依赖管理与工具选型指南

**适用范围**: 所有Agent在自动工作流中进行依赖安装和工具选型
**更新频率**: 每次遇到新的依赖问题时更新
**维护责任**: 解决问题的Agent负责更新

---

## 📦 一、依赖版本稳定性管理

### 1.1 推荐稳定版本清单（强制使用）

| 依赖类型 | 依赖名称 | 推荐版本 | 禁止版本 | 说明 |
|---------|---------|---------|---------|------|
| **PDF处理** | pdfjs-dist | `^3.11.174` | `>=5.0.0` | v5.x与node-canvas不兼容 |
| **图像处理** | canvas | `2.11.2` | `>=3.0.0` | v3.x与PDF.js不兼容 |
| **前端框架** | react | `^19.0.0` | - | 与react-dom同步版本 |
| **前端框架** | react-dom | `^19.0.0` | - | 与react同步版本 |
| **Next.js** | next | `^16.0.0` | - | 项目使用Next.js 16 |
| **状态管理** | zustand | `^5.0.0` | - | React 19兼容版本 |

### 1.2 常见依赖问题速查

#### 问题1: "Image or Canvas expected"

```
错误: TypeError: Image or Canvas expected
场景: PDF转图片失败
原因: pdfjs-dist v5.x 与 canvas v3.x 不兼容
解决方案:
  npm install pdfjs-dist@3.11.174 canvas@2.11.2
```

#### 问题2: "document is not defined"

```
错误: ReferenceError: document is not defined
场景: Node.js环境使用PDF.js
原因: 使用了浏览器版本的PDF.js
解决方案:
  npm install pdfjs-dist@3.11.174
  // 使用 legacy build
  const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');
```

#### 问题3: React Hook错误

```
错误: Invalid hook call. Hooks can only be called inside of the body of a function component
原因: React版本不一致或多个React实例
解决方案:
  确保package.json中react和react-dom版本一致
  npm install react@^19.0.0 react-dom@^19.0.0
```

### 1.3 Agent安装依赖的标准流程

#### 步骤1: 检查是否在推荐版本清单中

```markdown
✅ 在清单中 → 直接使用推荐版本安装（无需确认）
⚠️ 不在清单中 → 先查阅官方文档确定稳定版本
```

#### 步骤2: 执行安装

```bash
# 清单中的依赖（直接安装）
npm install pdfjs-dist@3.11.174 canvas@2.11.2

# 不在清单中的依赖（先查阅文档后安装）
npm install [依赖名]@[确定的稳定版本]
```

#### 步骤3: 安装后验证

```bash
# 验证依赖安装成功
npm list [依赖名]

# 验证构建成功
npm run build
```

### 1.4 禁止行为

- ❌ **禁止绕过推荐版本**: 推荐版本清单中的依赖必须使用指定版本
- ❌ **禁止安装已知问题版本**: 严禁安装"禁止版本"列中的任何版本
- ❌ **禁止盲目试错**: 超过3次尝试必须停止，寻求帮助
- ❌ **禁止忽略兼容性**: 安装依赖后必须验证构建成功

---

## 🤖 二、MCP工具选型规范

### 2.1 核心原则

1. **优先选择有MCP集成的工具**
   - ✅ shadcn/ui - 有MCP支持，优先选择
   - ✅ 其他有MCP的工具
   - ⚠️ 没有MCP的工具需评估必要性

2. **测试前必须连接MCP**
   - ✅ 先连接MCP服务器
   - ✅ 确认MCP功能可用
   - ✅ 测试工具是否符合需求
   - ❌ 禁止在未连接MCP的情况下测试

3. **不使用时必须清理**
   - ✅ 卸载npm包
   - ✅ 删除MCP配置
   - ✅ 验证清理完成
   - ❌ 禁止MCP配置残留

### 2.2 MCP工具测试流程

#### 阶段1: 连接MCP

```bash
# 1. 添加MCP服务器配置
# 位置: ~/.claude/settings.json 或项目配置

# 2. 验证MCP连接
# 检查MCP服务器是否可用

# 3. 测试MCP功能
# 使用MCP工具的基本功能
```

#### 阶段2: 测试工具功能

```markdown
测试清单:
- [ ] MCP连接成功
- [ ] 可以调用MCP工具
- [ ] 工具功能符合需求
- [ ] 性能满足要求
```

#### 阶段3: 决策

```markdown
✅ 符合需求 → 保留使用
❌ 不符合需求 → 执行清理流程
```

### 2.3 MCP工具清理流程

当决定不使用某个MCP工具时，必须执行完整清理：

#### 步骤1: 卸载npm包

```bash
# 卸载工具包
npm uninstall [package-name]

# 示例: 卸载shadcn相关包
npm uninstall @shadcn/ui
```

#### 步骤2: 清理MCP配置

```bash
# 1. 编辑MCP配置文件
# 位置: ~/.claude/settings.json

# 2. 删除该工具的MCP服务器配置

# 3. 验证配置已清理
```

#### 步骤3: 清理相关文件

```bash
# 删除工具生成的文件
# 删除工具的配置文件
# 恢复被工具修改的文件
```

#### 步骤4: 验证清理完成

```bash
# 验证工具已完全移除
npm run build

# 验证项目正常运行
npm run dev
```

### 2.4 常见MCP工具清单

#### shadcn/ui MCP

**MCP服务器**: `@modelcontextprotocol/server-shadcn`

**连接配置**:
```json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-shadcn"]
    }
  }
}
```

**测试流程**:
1. 连接MCP服务器
2. 测试查询组件: `list components`
3. 测试添加组件: `add button`
4. 确认功能可用

**清理流程**:
```bash
# 1. 卸载shadcn包
npm uninstall @shadcn/ui

# 2. 删除components.json配置
rm components.json

# 3. 删除MCP配置
# 编辑 ~/.claude/settings.json，删除shadcn配置

# 4. 验证清理
npm run build
```

#### 其他MCP工具

根据项目需要添加其他MCP工具的配置和清理流程。

---

## 📋 三、维护规则

### 3.1 更新频率

- **依赖问题**: 每次遇到新的依赖问题时更新本文档
- **MCP工具**: 每次添加或移除MCP工具时更新

### 3.2 更新责任

- **解决问题的人**: 负责更新本文档
- **更新内容**:
  - 添加新问题到"常见依赖问题速查"
  - 更新"推荐稳定版本清单"
  - 添加新MCP工具的配置和清理流程

### 3.3 更新模板

当遇到新的依赖问题时，按以下模板更新：

#### 模板1: 添加新问题

```markdown
#### 问题N: "[错误信息]"

```
错误: [完整错误信息]
场景: [使用场景]
原因: [根本原因]
解决方案:
  [具体的安装命令或代码]
```
```

#### 模板2: 添加新依赖

```markdown
| **[依赖类型]** | [依赖名称] | `[推荐版本]` | `[禁止版本]` | [说明] |
```

#### 模板3: 添加新MCP工具

```markdown
#### [工具名称] MCP

**MCP服务器**: `[服务器名称]`

**连接配置**:
\`\`\`json
{...配置...}
\`\`\`

**测试流程**:
1. [步骤1]
2. [步骤2]

**清理流程**:
\```bash
# [清理命令]
\`\`\`
```

---

## 🎯 四、快速参考

### 4.1 依赖安装决策树

```
需要安装依赖
  │
  ├─ 在推荐版本清单中?
  │   ├─ 是 → 直接安装推荐版本 ✅
  │   └─ 否 → 查阅官方文档 → 确定稳定版本 → 安装 ⚠️
  │
  ├─ 安装后验证
  │   ├─ npm list [依赖名]
  │   └─ npm run build
  │
  └─ 遇到错误?
      ├─ 查阅"常见依赖问题速查"
      └─ 最多3次尝试，超过则寻求帮助
```

### 4.2 MCP工具选型决策树

```
需要使用新工具
  │
  ├─ 有MCP集成?
  │   ├─ 是 → 连接MCP → 测试功能
  │   │   ├─ 符合需求 → 保留 ✅
  │   │   └─ 不符合 → 清理MCP和包 ❌
  │   └─ 否 → 评估必要性 → 谨慎使用 ⚠️
  │
  └─ 不使用时?
      └─ 必须清理MCP配置和包
```

---

## 📝 五、总结

### 核心价值

1. **依赖稳定**: 通过推荐版本清单确保依赖稳定
2. **快速解决**: 通过速查表快速定位解决方案
3. **MCP优先**: 优先选择有MCP集成的工具
4. **完整清理**: 确保不使用的工具和配置被完全移除

### 关键原则

- ✅ 稳定版本优先于最新版本
- ✅ MCP工具必须先连接再测试
- ✅ 不使用的工具必须完整清理
- ❌ 禁止盲目试错（最多3次）

---

**文档版本**: 1.0
**创建时间**: 2026-01-09
**维护位置**: `.claude/docs/development/dependency-management.md`
