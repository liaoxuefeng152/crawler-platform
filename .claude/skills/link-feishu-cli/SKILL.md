---
name: link-feishu-cli
description: 飞书CLI (lark-cli) 安装配置助手。帮助用户完成飞书CLI的安装、应用创建、用户授权和功能测试。当用户说"连接飞书cli"、"飞书cli安装"、"配置飞书cli"、"安装lark-cli"或需要通过命令行访问飞书文档、消息、多维表格时触发此skill。
---

# link-feishu-cli

飞书CLI安装配置助手，帮助用户快速完成飞书CLI的安装和配置，使其能够通过命令行访问飞书的全部功能。

## 触发场景

当用户提到以下关键词时触发：

- "连接飞书cli" / "飞书cli安装" / "配置飞书cli"
- "lark-cli" / "安装飞书命令行"
- 需要通过CLI操作飞书文档、消息、表格等

## 前置要求

- Node.js >= 18
- npm 可用
- 飞书账号（需有飞书开放平台访问权限）

---

## 安装流程（5步骤）

### Step 1: 环境检查

首先检查环境是否满足要求：

```bash
# 检查 Node.js 版本
node --version  # 需要 >= 18

# 检查 npm
npm --version

# 检查是否已安装 lark-cli
lark-cli --version 2>/dev/null || echo "未安装"
```

**判断逻辑**：

- 若已安装且版本最新 → 跳过 Step 2
- 若已安装但版本旧 → 建议更新
- 若未安装 → 执行 Step 2

---

### Step 2: 安装飞书CLI

安装最新版本的飞书CLI：

```bash
npm install -g @larksuite/cli@latest
```

验证安装：

```bash
lark-cli --version
```

---

### Step 3: 创建飞书应用

使用设备流授权创建应用：

```bash
lark-cli config init --new --lang zh
```

**重要提示**：

1. 命令会输出一个验证URL和二维码
2. 用户需要在浏览器中打开URL，登录飞书账号完成应用创建
3. **关键步骤**：应用创建后，必须去飞书开放平台发布应用！

> ⚠️ **必须发布应用**：应用创建后状态为"待审批"，需要去开放平台发布到企业内部才能使用。否则后续授权会报错 "The app is pending approval"

**发布步骤**：

1. 打开 https://open.feishu.cn/app
2. 找到刚创建的应用（App ID 会显示在CLI输出中）
3. 进入「版本管理」→ 创建版本 → 发布到企业内部

---

### Step 4: 用户授权登录

应用发布后，进行用户授权：

**方式一：交互式登录（推荐）**

```bash
lark-cli auth login --domain all --recommend
```

**方式二：两步模式（处理超时）**

如果设备码容易过期，使用两步模式：

```bash
# 第一步：获取设备码（不等待）
lark-cli auth login --domain all --recommend --no-wait --json

# 输出包含：
# - device_code: 设备码
# - verification_url: 验证链接
# - expires_in: 有效期（通常600秒=10分钟）

# 第二步：用户完成授权后，用设备码完成登录
lark-cli auth login --device-code <device_code>
```

**验证登录状态**：

```bash
lark-cli auth status
lark-cli doctor
```

---

### Step 5: 功能测试

安装完成后，进行功能测试验证：

**获取用户 Open ID**：

```bash
lark-cli auth status  # 查看输出中的 userOpenId
```

**测试发送消息**：

```bash
lark-cli im +messages-send --user-id <your_open_id> --text "飞书CLI测试成功！" --as bot
```

**测试创建文档**：

```bash
lark-cli docs +create --title "飞书CLI测试文档" --markdown "# 测试成功\n\n这是通过飞书CLI创建的测试文档。"
```

**输出能力清单**：

```bash
lark-cli auth status  # 查看已授权的 scope
```

---

## 常见问题处理

| 错误信息                         | 原因         | 解决方案                                    |
| -------------------------------- | ------------ | ------------------------------------------- |
| `The app is pending approval`    | 应用未发布   | 去飞书开放平台发布应用到企业内部            |
| `device_code is invalid/expired` | 设备码过期   | 重新执行 `lark-cli auth login` 获取新设备码 |
| `missing required scope`         | 权限不足     | 添加额外scope重新授权                       |
| `not configured`                 | 未初始化配置 | 执行 `lark-cli config init --new`           |

**添加额外权限**：

```bash
lark-cli auth login --scope "im:message.send_as_user docx:document:create" --no-wait --json
```

---

## 常用命令速查

### 消息操作

```bash
# 发送消息
lark-cli im +messages-send --user-id <open_id> --text "内容" --as bot

# 搜索群聊
lark-cli im +chat-search --query "群名"

# 获取群消息列表
lark-cli im +chat-messages-list --chat-id <chat_id> --page-size 10 --sort desc
```

### 文档操作

```bash
# 创建文档
lark-cli docs +create --title "标题" --markdown "# 内容"

# 读取文档
lark-cli docs +fetch --doc <doc_token> --format pretty

# 搜索文档
lark-cli docs +search --query "关键词"

# 更新文档
lark-cli docs +update --doc <doc_token> --markdown "新内容"
```

### 多维表格操作

```bash
# 查询记录
lark-cli base +record-list --table-id <table_id>

# 创建/更新记录
lark-cli base +record-upsert --table-id <table_id> --data '{"字段名": "值"}'

# 数据查询分析
lark-cli base +data-query --table-id <table_id>
```

### 其他功能

```bash
# 日历事件
lark-cli calendar +agenda

# 任务管理
lark-cli task --help

# 云盘文件
lark-cli drive --help

# 知识库
lark-cli wiki --help
```

---

## 配置查看命令

```bash
# 查看当前配置
lark-cli config show

# 查看认证状态
lark-cli auth status

# 健康检查
lark-cli doctor

# 查看已登录用户
lark-cli auth list
```

---

## 参考链接

- 飞书开放平台: https://open.feishu.cn
- lark-cli GitHub: https://github.com/larksuite/cli
- 飞书API文档: https://open.feishu.cn/document/
- 应用管理: https://open.feishu.cn/app

---

## 清理和卸载

如果需要卸载飞书CLI：

```bash
# 移除配置
lark-cli config remove

# 卸载包
npm uninstall -g @larksuite/cli
```
