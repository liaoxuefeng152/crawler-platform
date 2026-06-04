# 配置管理规则

**强制级别**: CRITICAL

---

## 核心原则

敏感配置和必需配置禁止 `process.env.XXX || '默认值'` 模式。配置缺失必须快速暴露，不得静默降级。

公开展示配置可以使用明确白名单内的默认值，例如项目名称、文档标题等不涉及安全和运行拓扑的 `NEXT_PUBLIC_` 展示项。

---

## 强制要求

1. **禁止敏感配置兜底默认值** - 密钥、凭证、连接串、权限配置不得使用 `process.env.XXX || 'fallback'`
2. **必需配置用 requireEnv** - 缺失时启动即报错，错误信息包含变量名
3. **可选配置用 optionalEnv** - 返回 `string | undefined`，调用方自行处理缺失
4. **敏感信息走 env** - 密钥、凭证不入配置文件
5. **约定优于配置** - 遵循命名规范的配置用基础变量自动构建

## 允许默认值的公开配置

仅以下类型允许 fallback，且默认值不得包含密钥、账号、连接地址或业务敏感信息：

- `NEXT_PUBLIC_PROJECT_NAME` - 项目展示名称
- OpenAPI/页面展示标题等由项目名称派生的纯展示文案
- 本地开发脚本中的非敏感展示名称

---

## 检查命令

```bash
# 检测违规的兜底模式
grep -rn "process\.env\.\w\+ ||" --include="*.ts" --include="*.tsx" . | grep -v node_modules
```

有输出时必须逐项判断；敏感配置命中即违规，公开展示配置需确认是否在白名单内。

---

## Agent 职责

| Agent           | 职责                |
| --------------- | ------------------- |
| backend-expert  | 中间件配置、API配置 |
| frontend-expert | NEXT*PUBLIC* 配置   |
| qa-expert       | 检查违规兜底模式    |
