# Next.js 错误快速参考手册 (Test Expert 专用)

**版本**: Next.js 16 (Turbopack)
**目的**: 帮助测试专家快速识别、分类和报告Next.js错误
**更新日期**: 2025-12-28

---

## 🚀 快速诊断流程

```
遇到Next.js错误？
    ↓
1. 点击"Copy Error Info"按钮 ← 🔥 优先操作
    ↓
2. 查看关键词匹配 ← 根据错误内容分类
    ↓
3. 确定优先级 (P0/P1/P2)
    ↓
4. 生成结构化报告
    ↓
5. 写入 active-bridge.md
    ↓
6. 触发返工流程
```

---

## 📚 错误分类快速索引

### P0 错误（阻塞性 - 立即返工）

#### 1. MODULE_RESOLUTION_ERROR（模块解析错误）

**关键词**:
- `Can't resolve`
- `Module not found`
- `Unable to locate`

**示例**:
```
Module not found: Can't resolve './styles/Profile.module.css'
./app/sports/profile/page.tsx:34:1
```

**识别特征**:
- 明确的文件路径
- "Can't resolve" 开头
- 包含行号和列号

**修复建议**:
```diff
- import styles from './styles/Profile.module.css';
+ import styles from '../styles/Profile.module.css';
```

**常见原因**:
1. 相对路径错误（子目录使用了 `./` 而非 `../`）
2. 文件不存在
3. 文件名大小写不匹配
4. 使用了未配置的路径别名（如 `@/`）

**返工目标**: Dev stage

---

#### 2. CSS_IMPORT_ERROR（CSS导入错误）

**关键词**:
- `.module.css`
- `.css`
- CSS syntax error
- Unknown word

**示例**:
```
CssSyntaxError: Unknown word min-height-screen
./app/sports/styles/Login.module.css:10:1
```

**识别特征**:
- CSS文件路径
- `CssSyntaxError`
- 具体的CSS属性名

**修复建议**:
```diff
- min-height-screen: 100vh;  /* ❌ 无效属性 */
+ min-height: 100vh;          /* ✅ 正确属性 */
```

**常见原因**:
1. CSS属性名拼写错误
2. CSS语法错误（缺少分号、括号等）
3. CSS Modules导入路径错误

**返工目标**: frontend-expert

---

#### 3. TYPESCRIPT_ERROR（TypeScript类型错误）

**关键词**:
- `Type error`
- `TS`
- `is not assignable`
- `Property does not exist`
- `TS2307`, `TS2345`

**示例**:
```
Type 'string' is not assignable to type 'number'.
Type 'User' is missing the following properties: id, email
```

**识别特征**:
- 类型不匹配提示
- TS错误代码（如TS2345）
- 明确的类型名称

**修复建议**:
```diff
- const count: number = getValue();  // ❌ 返回string
+ const count: number = Number(getValue());  // ✅ 类型转换
```

**常见原因**:
1. 类型定义与实际使用不匹配
2. 缺少类型注解
3. 接口定义不完整
4. any类型滥用

**返工目标**: Dev stage

---

#### 4. TURBOPACK_BUILD_ERROR（Turbopack构建错误）

**关键词**:
- `Turbopack`
- `Build error`
- `Compilation error`

**示例**:
```
Turbopack build error
Failed to compile
Error: Invalid JSX syntax
```

**识别特征**:
- 明确提到"Turbopack"
- 编译失败提示
- 构建阶段错误

**修复建议**:
1. 检查JSX语法
2. 验证import/export语句
3. 确认所有依赖已安装
4. 查看完整错误堆栈

**返工目标**: Dev stage

---

### P1 错误（严重性 - 测试失败并返工）

#### 5. HYDRATION_ERROR（React水合错误）

**关键词**:
- `Hydration failed`
- `Text content does not match`
- `There was an error while hydrating`

**示例**:
```
Error: Hydration failed because the initial UI doesn't match
Text content did not match. Server: "Loading..." Client: "Data"
```

**识别特征**:
- 明确提到"Hydration"
- 服务端和客户端内容不匹配
- 通常与SSR/SSG相关

**修复建议**:
```diff
- export default function ProfilePage() {
-   if (typeof window !== 'undefined') {  // ❌ 错误方式
-     // ...
-   }
+ }
+
+ export default function ProfilePage() {
+   const [isClient, setIsClient] = useState(false);
+
+   useEffect(() => {
+     setIsClient(true);
+   }, []);
+
+   if (!isClient) return null;  // ✅ 正确方式
+ }
```

**常见原因**:
1. 服务端和客户端渲染结果不一致
2. 在组件中使用 `typeof window`
3. 直接使用浏览器API（如 `localStorage`）
4. 第三方库不支持SSR

**返工目标**: frontend-expert

---

#### 6. COMPONENT_RUNTIME_ERROR（组件运行时错误）

**关键词**:
- `TypeError`
- `ReferenceError`
- `Cannot read property`
- `undefined is not a function`

**示例**:
```
TypeError: Cannot read property 'map' of undefined
ReferenceError: userData is not defined
```

**识别特征**:
- JavaScript原生错误类型
- 运行时抛出
- 包含具体的变量名或属性名

**修复建议**:
```diff
- userData.map(user => ...)  // ❌ userData可能为undefined
+ (userData || []).map(user => ...)  // ✅ 添加默认值
```

**常见原因**:
1. 访问undefined/null的属性
2. 函数调用时参数错误
3. 异步数据未加载完成就使用
4. 状态管理错误

**返工目标**: frontend-expert

---

#### 7. API_ROUTE_ERROR（API路由错误）

**关键词**:
- `/api/`
- `API route`
- `500`
- `Internal Server Error`
- `Failed to fetch`

**示例**:
```
Error: API route failed with status 500
POST /api/auth/login failed
TypeError: Cannot destructure property 'email' of 'req.body' as it is undefined
```

**识别特征**:
- 包含API路径（`/api/...`）
- HTTP状态码
- 服务端错误提示

**修复建议**:
```diff
export async function POST(request: Request) {
-  const { email, password } = request.body;  // ❌ 错误
+  const body = await request.json();
+  const { email, password } = body;  // ✅ 正确

  if (!email || !password) {
    return Response.json({ error: 'Missing fields' }, { status: 400 });
  }

  // ...
}
```

**常见原因**:
1. 请求体解析错误
2. 参数验证缺失
3. 数据库连接失败
4. 业务逻辑错误

**返工目标**: backend-expert

---

### P2 错误（一般性 - 记录但不阻断）

#### 8. NETWORK_TIMEOUT_ERROR（网络超时错误）

**关键词**:
- `timeout`
- `ETIMEDOUT`
- `Request timeout`
- `Network timeout`

**示例**:
```
Error: Request timeout after 30000ms
ETIMEDOUT: Connection timed out
```

**识别特征**:
- 提到"timeout"
- 通常与fetch/axios相关
- 可能间歇性出现

**修复建议**:
1. 检查网络连接
2. 增加超时时间
3. 添加重试机制
4. 检查服务器负载

**返工目标**: Dev/Infra

---

#### 9. NETWORK_CONNECTION_ERROR（网络连接错误）

**关键词**:
- `ECONNREFUSED`
- `fetch failed`
- `Connection refused`
- `Network error`

**示例**:
```
Error: connect ECONNREFUSED 127.0.0.1:3000
TypeError: fetch failed
```

**识别特征**:
- 连接被拒绝
- 服务器未响应
- 端口错误

**修复建议**:
1. 确认开发服务器正在运行
2. 检查端口配置
3. 验证API URL
4. 检查防火墙设置

**返工目标**: Dev/Infra

---

## 🔍 错误模式识别技巧

### 技巧1: 查看错误堆栈的第一行

```
✅ 正确做法:
Module not found: Can't resolve './styles/Profile.module.css'
                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                 ↑ 这是关键信息

❌ 错误做法:
直接看最后几行堆栈跟踪，那通常是框架内部代码
```

### 技巧2: 识别错误发生阶段

| 阶段 | 特征 | 优先级 |
|------|------|--------|
| **编译时** | Build failed, Turbopack error | P0 |
| **运行时** | TypeError, ReferenceError | P1 |
| **网络** | Timeout, Connection refused | P2 |

### 技巧3: 定位错误源文件

```
错误格式: 文件路径:行号:列号
示例: ./app/sports/profile/page.tsx:34:1
       ↑ 文件路径            ↑ 行号 ↑ 列号

操作:
1. 使用 Cmd+L (Mac) 或 Ctrl+L (Windows) 跳转
2. 查看该行代码
3. 分析上下文
```

### 技巧4: 区分Next.js版本

| 版本 | 错误覆盖层元素 | 复制按钮特征 |
|------|---------------|-------------|
| **Next.js 16** | `<dialog role="dialog">` | "Copy Error Info" |
| **Next.js 15** | `<next-dev-overlay>` | "Copy" |
| **Next.js 14** | `<div class="next-error-overlay">` | "Copy error" |

---

## 📝 快速报告模板

### P0错误报告模板

```markdown
## 🚨 Next.js 错误报告

### 错误元数据
- **错误类型**: MODULE_RESOLUTION_ERROR
- **错误优先级**: P0
- **Next.js版本**: 16.0.10 (Turbopack)
- **测试场景**: E2E测试 - 个人中心页面加载

### 完整错误信息
```
[粘贴从"Copy Error Info"按钮获取的完整错误]
```

### 错误来源
- **文件**: ./app/sports/profile/page.tsx:34:1
- **错误行**: `import styles from './styles/Profile.module.css';`
- **问题**: 相对路径错误

### 修复建议
- [ ] 修改导入路径为 `../styles/Profile.module.css`
- [ ] 验证CSS文件存在于 `/app/sports/styles/`

### 返工决策
- **返回给**: Dev stage
- **修复任务**: [R1] 修复导入路径
- **验证方法**: 重新运行 `npm run build` 和 E2E测试

---
*报告生成时间: 2025-12-28T12:48:00.000Z*
```

### P1错误报告模板

```markdown
## ⚠️ Next.js 运行时错误

### 错误元数据
- **错误类型**: COMPONENT_RUNTIME_ERROR
- **错误优先级**: P1
- **Next.js版本**: 16.0.10

### 完整错误信息
```
[粘贴错误信息]
```

### 发生场景
- **页面URL**: http://localhost:3000/sports/profile
- **用户操作**: 导航到个人中心页面
- **复现步骤**: 1. 登录 2. 点击个人中心

### 修复建议
- [ ] 检查组件是否正确导入
- [ ] 验证props传递是否正确
- [ ] 添加数据加载状态检查

### 返工决策
- **返回给**: frontend-expert
- **修复任务**: [R1] 修复组件运行时错误
- **验证方法**: 重新运行 E2E 测试

---
*报告生成时间: 2025-12-28T12:48:00.000Z*
```

---

## 🎯 常见错误场景速查

### 场景1: 页面加载后显示错误覆盖层

**可能原因**:
- ✅ Module not found (P0) - 导入路径错误
- ✅ TypeScript error (P0) - 类型错误
- ✅ Build error (P0) - 构建失败

**处理流程**:
1. 点击"Copy Error Info"按钮
2. 检查关键词（Module not found / Type error）
3. 按错误类型分类
4. 生成报告并触发返工

---

### 场景2: 页面正常加载但控制台有错误

**可能原因**:
- ⚠️ Runtime error (P1) - 组件崩溃
- ⚠️ Hydration error (P1) - SSR不匹配
- ⚠️ Network error (P2) - API超时

**处理流程**:
1. 打开浏览器控制台
2. 查看错误堆栈
3. 截图并记录
4. 根据错误类型决定是否返工

---

### 场景3: E2E测试超时

**可能原因**:
- ⚠️ Network timeout (P2) - 服务器未响应
- ⚠️ Infinite loading (P1) - 数据加载卡住

**处理流程**:
1. 检查开发服务器是否运行
2. 查看网络请求
3. 验证API端点
4. 生成网络错误报告

---

## 📊 错误优先级决策树

```
遇到错误
    ↓
是否阻止构建？
    ├─ 是 → P0 (MODULE_RESOLUTION_ERROR / CSS_IMPORT_ERROR)
    │        ↓
    │     返回给: Dev stage / frontend-expert
    │        ↓
    │     立即失败测试
    │
    └─ 否 → 是否影响功能？
             ├─ 是 → P1 (HYDRATION_ERROR / COMPONENT_RUNTIME_ERROR)
             │        ↓
             │     返回给: frontend-expert / backend-expert
             │        ↓
             │     失败当前测试
             │
             └─ 否 → P2 (NETWORK_TIMEOUT / CONNECTION_ERROR)
                      ↓
                   返回给: Dev/Infra
                      ↓
                   记录错误，继续测试
```

---

## ✅ 测试专家行动清单

### 遇到Next.js错误时，按顺序执行：

- [ ] **1. 点击"Copy Error Info"按钮**（最重要！）
- [ ] **2. 检查Next.js版本**（package.json或错误信息）
- [ ] **3. 识别错误阶段**（编译时 vs 运行时）
- [ ] **4. 查看关键词**（使用本手册的快速索引）
- [ ] **5. 确定错误类型**（9种主要类型）
- [ ] **6. 判断优先级**（P0/P1/P2）
- [ ] **7. 生成结构化报告**（使用模板）
- [ ] **8. 写入active-bridge.md**
- [ ] **9. 截图保存辅助证据**
- [ ] **10. 触发返工流程**（P0/P1）或记录（P2）

---

## 🔗 相关资源

### 内部文档
- `.claude/agents/test-expert.md` - 测试专家完整指南
- `.claude/docs/testing/test-expert-error-handling-workflow.md` - 错误处理工作流
- `.claude/docs/testing/nextjs-error-capture-enhancement.md` - 增强实施文档

### Next.js官方文档
- [Next.js Error Reference](https://nextjs.org/docs/messages)
- [Turbopack Documentation](https://turbo.build/pack/docs)
- [App Router Architecture](https://nextjs.org/docs/app)

### 工具文档
- [Playwright Documentation](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/react)

---

**维护说明**:
- 本手册应随着Next.js版本更新而更新
- 发现新的错误模式时，请及时添加
- 定期review错误分类的准确性

**最后更新**: 2025-12-28
**维护者**: test-expert
**版本**: 1.0.0
