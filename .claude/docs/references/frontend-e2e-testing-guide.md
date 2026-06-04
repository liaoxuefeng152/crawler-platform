# 前端E2E测试指南（Playwright）

> **测试框架**: Playwright
> **测试位置**: tests/e2e/
> **测试类型**: 端到端自动化测试

---

## 📋 Playwright测试核心步骤

### Step 1: 创建测试文件
```bash
# 测试文件位置
tests/e2e/$MODULE/
└── $MODULE-app.spec.ts
```

### Step 2: 编写测试代码
```typescript
import { test, expect } from '@playwright/test';

test.describe('模块名称', () => {
  test('测试用例名称', async ({ page }) => {
    // 1. 访问页面
    await page.goto('/path');

    // 2. 查找元素
    const element = page.locator('selector');

    // 3. 执行操作
    await element.click();

    // 4. 验证结果
    await expect(element).toBeVisible();
  });
});
```

### Step 3: 运行测试
```bash
# 启动开发服务器
npm run dev &

# 运行所有E2E测试
npx playwright test

# 运行特定文件
npx playwright test tests/e2e/module/module-app.spec.ts

# 以headed模式运行（查看浏览器）
npx playwright test --headed
```

### Step 4: 查看测试报告
```bash
# 生成HTML报告
npx playwright show-report
```

---

## ✅ 测试通过标准

**必须满足**：
- ✅ 所有用户故事的E2E测试通过
- ✅ playwright测试报告显示passed=total且无failed
- ✅ 测试通过率=100%

**禁止跳过测试**：
- ❌ "时间限制"不是理由
- ❌ "GLM_API_KEY缺失"不是理由（可用Mock响应）
- ❌ "后续手动验证"不是理由

---

## 🚨 真实测试 vs 虚假测试

### ❌ 虚假测试特征
- 只在active-bridge.md中"描述"测试用例
- 标记"50+测试已编写"但文件不存在
- 标记"测试完成"但从未运行`npx playwright test`
- 记录"测试覆盖率100%"但无真实执行
- 发现问题: 0个（虚假测试永远不会发现问题）

### ✅ 真实测试特征
- 创建真实的.spec.ts文件
- 运行`npx playwright test`
- 真实点击、填写表单
- 发现真实UI问题
- 生成截图和报告

---

## 📚 参考文档

- **测试策略**: [testing-strategy.md](../../.claude/skills/workflow-manager/references/testing-strategy.md)
- **测试专家**: [test-expert.md](../../.claude/agents/test-expert.md)
- **Playwright文档**: https://playwright.dev
