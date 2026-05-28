---
name: generate-e2e-tests
description: 根据plan.md和tasks.md自动生成Playwright E2E测试代码模板，减少test-expert编写测试代码的工作量
---

# Generate E2E Tests

## Overview

自动生成Playwright E2E测试代码模板，减少test-expert编写测试代码的工作量。此skill会根据plan.md中的用户故事和tasks.md中的前端任务，自动创建测试文件和基本的测试用例框架。

## 使用场景

- ✅ Test阶段开始前，架构专家调用此skill生成测试模板
- ✅ test-expert基于生成的模板进行测试代码编写
- ✅ 减少test-expert从零开始编写测试代码的工作量

## 使用方法

```bash
# 在Test阶段开始前，架构专家或test-expert调用此skill
"请调用generate-e2e-tests skill，根据plan.md和tasks.md生成E2E测试模板"
```

## 输入

- `plan.md`: 用户需求和用户故事
- `tasks.md`: 前端任务清单
- `public/openapi.json`: API契约（用于验证API调用）

## 输出

- `tests/e2e/$MODULE/*.spec.ts`: Playwright E2E测试文件
- 每个用户故事对应一个测试文件
- 每个测试文件包含基本的测试框架和示例测试用例

## 生成的测试文件结构

```
tests/e2e/
├── $MODULE/
│   ├── $USER_STORY_1.spec.ts
│   ├── $USER_STORY_2.spec.ts
│   ├── $USER_STORY_3.spec.ts
│   └── ...
```

## 生成的测试模板示例

### 用户故事1: 活动列表浏览

```typescript
import { test, expect } from '@playwright/test';

test.describe('用户故事1: 活动列表浏览', () => {
  test.beforeEach(async ({ page }) => {
    // 每个测试前的准备工作
    await page.goto('/activities');
  });

  test('成功加载活动列表', async ({ page }) => {
    // TODO: 验证活动列表页面加载成功
    // 1. 检查页面标题
    await expect(page).toHaveTitle(/活动列表/);

    // 2. 检查活动列表容器存在
    const activityList = page.locator('[data-testid="activity-list"]');
    await expect(activityList).toBeVisible();

    // 3. 检查至少有一个活动项
    const activityItems = page.locator('[data-testid="activity-item"]');
    await expect(activityItems.first()).toBeVisible();
  });

  test('支持关键词搜索活动', async ({ page }) => {
    // TODO: 实现搜索功能测试
    // 1. 输入搜索关键词
    const searchInput = page.locator('input[name="keyword"]');
    await searchInput.fill('测试活动');

    // 2. 点击搜索按钮
    const searchButton = page.locator('button[type="submit"]');
    await searchButton.click();

    // 3. 验证搜索结果
    // await expect(page.locator('[data-testid="activity-item"]')).toHaveCount(1);
  });

  test('支持分页浏览活动', async ({ page }) => {
    // TODO: 实现分页功能测试
    // 1. 检查分页组件存在
    const pagination = page.locator('[data-testid="pagination"]');
    // await expect(pagination).toBeVisible();

    // 2. 点击下一页
    // await pagination.locator('button:has-text("下一页")').click();

    // 3. 验证页面变化
    // await expect(page).toHaveURL(/page=2/);
  });
});
```

### 用户故事2: 活动详情查看

```typescript
import { test, expect } from '@playwright/test';

test.describe('用户故事2: 活动详情查看', () => {
  test.beforeEach(async ({ page }) => {
    // 每个测试前的准备工作
    // 假设活动ID为123
    await page.goto('/activities/123');
  });

  test('成功加载活动详情', async ({ page }) => {
    // TODO: 验证活动详情页面加载成功
    // 1. 检查页面标题
    await expect(page).toHaveTitle(/活动详情/);

    // 2. 检查活动详情容器存在
    const activityDetail = page.locator('[data-testid="activity-detail"]');
    await expect(activityDetail).toBeVisible();

    // 3. 检查活动基本信息显示
    const activityName = page.locator('[data-testid="activity-name"]');
    await expect(activityName).toBeVisible();
  });

  test('显示活动创建者信息', async ({ page }) => {
    // TODO: 验证创建者信息显示
    const creatorInfo = page.locator('[data-testid="creator-info"]');
    // await expect(creatorInfo).toBeVisible();
  });

  test('显示活动参与状态', async ({ page }) => {
    // TODO: 验证参与状态显示
    const joinStatus = page.locator('[data-testid="join-status"]');
    // await expect(joinStatus).toBeVisible();
  });
});
```

### 用户故事3: 创建活动

```typescript
import { test, expect } from '@playwright/test';

test.describe('用户故事3: 创建活动', () => {
  test.beforeEach(async ({ page }) => {
    // 每个测试前的准备工作
    await page.goto('/activities/new');
  });

  test('成功创建活动', async ({ page }) => {
    // TODO: 实现创建活动测试
    // 1. 填写活动名称
    const nameInput = page.locator('input[name="name"]');
    await nameInput.fill('测试活动');

    // 2. 填写活动描述
    const descTextarea = page.locator('textarea[name="description"]');
    await descTextarea.fill('这是一个测试活动');

    // 3. 选择活动时间
    const timeInput = page.locator('input[name="activityTime"]');
    await timeInput.fill('2025-12-31T10:00');

    // 4. 点击创建按钮
    const createButton = page.locator('button[type="submit"]');
    await createButton.click();

    // 5. 验证跳转到活动详情页
    // await expect(page).toHaveURL(/\/activities\/\d+/);
  });

  test('表单验证：必填字段为空时显示错误', async ({ page }) => {
    // TODO: 实现表单验证测试
    // 1. 不填写任何字段，直接点击创建
    const createButton = page.locator('button[type="submit"]');
    await createButton.click();

    // 2. 验证错误提示显示
    // const errorMsg = page.locator('[data-testid="error-message"]');
    // await expect(errorMsg).toBeVisible();
  });
});
```

## 测试文件命名规范

- 使用用户故事的英文描述作为文件名
- 文件名使用小写字母和连字符
- 示例：`activity-list-browsing.spec.ts`、`activity-detail-viewing.spec.ts`、`activity-creation.spec.ts`

## 测试用例设计原则

1. **基于用户故事**: 每个测试用例对应一个具体的用户操作
2. **独立性**: 每个测试用例独立运行，不依赖其他测试用例
3. **可读性**: 测试用例名称清晰描述测试内容
4. **TODO标记**: 生成的测试用例使用`// TODO:`标记需要test-expert补充的部分

## 生成的测试报告

测试模板生成后，会生成一个测试模板报告：

```markdown
# E2E测试模板生成报告

生成时间：2025-12-30 18:00

生成的测试文件：
- ✅ tests/e2e/activities/activity-list-browsing.spec.ts (3个测试用例)
- ✅ tests/e2e/activities/activity-detail-viewing.spec.ts (3个测试用例)
- ✅ tests/e2e/activities/activity-creation.spec.ts (2个测试用例)

总计：3个测试文件，8个测试用例

test-expert需要补充的内容：
- ✍️ 补充TODO标记的测试步骤
- ✍️ 添加更多的边界条件测试
- ✍️ 添加错误处理测试
- ✍️ 添加API mock数据（如需要）

下一步：
1. test-expert基于生成的模板补充测试代码
2. 运行测试：npx playwright test
3. 生成测试报告：playwright-test-report.md
```

## 完成标准

- ✅ 所有用户故事都有对应的测试文件
- ✅ 测试文件包含基本的测试框架
- ✅ 测试文件包含示例测试用例（使用TODO标记需要补充的部分）
- ✅ 测试文件命名符合规范
- ✅ 生成了测试模板报告

## 限制和注意事项

⚠️ **此skill只生成测试模板，test-expert仍需要**：
- 补充TODO标记的测试步骤
- 添加更多的边界条件测试
- 添加错误处理测试
- 运行测试并验证结果

✅ **此skill的优势**：
- 减少test-expert从零开始编写测试框架的工作量
- 确保测试文件结构一致
- 提供标准的测试用例模板
- 加快测试开发速度

## 参考文档

- 📄 [Playwright官方文档](https://playwright.dev/docs/intro)
- 📄 [test-templates.md](../../.claude/docs/test-templates.md): 测试模板和最佳实践
- 📄 [test-expert.md](../../agents/test-expert.md): 测试专家配置
