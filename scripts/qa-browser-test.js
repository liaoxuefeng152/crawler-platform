/**
 * QA Browser Testing Script
 *
 * This script performs comprehensive browser testing for the QA phase.
 * It verifies all critical user journeys and functionality.
 */

const { chromium } = require('playwright');
const path = require('path');

async function runQABrowserTests() {
  console.log('🚀 Starting QA Browser Testing...\n');

  const browser = await chromium.launch({
    headless: true, // 无头模式
    slowMo: 500, // 稍微慢速执行
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });

  const page = await context.newPage();

  const results = {
    passed: [],
    failed: [],
  };

  try {
    // 测试1：访问首页
    console.log('📍 测试1：访问首页');
    try {
      await page.goto('http://localhost:3006');
      await page.waitForLoadState('networkidle');

      const title = await page.title();
      console.log(`   ✅ 页面标题: ${title}`);

      // 验证关键元素存在
      const h1Text = await page.locator('h1').textContent();
      console.log(`   ✅ 主标题: ${h1Text}`);

      results.passed.push('访问首页');
    } catch (error) {
      console.log(`   ❌ 失败: ${error.message}`);
      results.failed.push({ test: '访问首页', error: error.message });
    }

    // 测试2：登录功能
    console.log('\n📍 测试2：登录功能');
    try {
      await page.goto('http://localhost:3006/login');
      await page.waitForLoadState('networkidle');

      // 等待登录表单出现
      await page.waitForSelector('input#username', { timeout: 10000 });

      // 填写用户名
      await page.fill('input#username', 'az');
      console.log('   ✅ 输入用户名: az');

      // 填写密码
      await page.fill('input#password', '888');
      console.log('   ✅ 输入密码: 888');

      // 点击"登录"按钮
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });
      console.log('   ✅ 登录成功，跳转到Dashboard');

      results.passed.push('登录功能');
    } catch (error) {
      console.log(`   ❌ 失败: ${error.message}`);
      results.failed.push({ test: '登录功能', error: error.message });
    }

    // 测试3：访问活动列表页
    console.log('\n📍 测试3：访问活动列表页');
    try {
      await page.goto('http://localhost:3006/activities');
      await page.waitForLoadState('networkidle');

      // 验证页面标题
      const pageTitle = await page.locator('h1').textContent();
      console.log(`   ✅ 页面标题: ${pageTitle}`);

      // 验证副标题
      const subtitle = await page.locator('p.text-lg').textContent();
      console.log(`   ✅ 页面副标题: ${subtitle}`);

      results.passed.push('访问活动列表页');
    } catch (error) {
      console.log(`   ❌ 失败: ${error.message}`);
      results.failed.push({ test: '访问活动列表页', error: error.message });
    }

    // 测试4：访问创建活动页
    console.log('\n📍 测试4：访问创建活动页');
    try {
      await page.click('a:has-text("发起拼团")');
      await page.waitForURL('http://localhost:3006/activities/create');
      await page.waitForLoadState('networkidle');

      const pageTitle = await page.locator('h1').textContent();
      console.log(`   ✅ 页面标题: ${pageTitle}`);

      // 验证表单存在
      const formExists = await page.locator('form').isVisible();
      console.log(`   ✅ 表单可见: ${formExists}`);

      results.passed.push('访问创建活动页');
    } catch (error) {
      console.log(`   ❌ 失败: ${error.message}`);
      results.failed.push({ test: '访问创建活动页', error: error.message });
    }

    // 测试5：访问我的报名
    console.log('\n📍 测试5：访问我的报名');
    try {
      await page.goto('http://localhost:3006/activities/my-joinings');
      await page.waitForLoadState('networkidle');

      const pageTitle = await page.locator('h1').textContent();
      console.log(`   ✅ 页面标题: ${pageTitle}`);

      results.passed.push('访问我的报名');
    } catch (error) {
      console.log(`   ❌ 失败: ${error.message}`);
      results.failed.push({ test: '访问我的报名', error: error.message });
    }

    // 测试6：访问我的发起
    console.log('\n📍 测试6：访问我的发起');
    try {
      await page.goto('http://localhost:3006/activities/my-creations');
      await page.waitForLoadState('networkidle');

      const pageTitle = await page.locator('h1').textContent();
      console.log(`   ✅ 页面标题: ${pageTitle}`);

      results.passed.push('访问我的发起');
    } catch (error) {
      console.log(`   ❌ 失败: ${error.message}`);
      results.failed.push({ test: '访问我的发起', error: error.message });
    }

    // 测试7：验证导航功能
    console.log('\n📍 测试7：验证导航功能');
    try {
      // 点击Logo返回首页
      await page.click('.flex.items-center.space-x-2');
      await page.waitForURL('http://localhost:3006/');
      console.log('   ✅ 点击Logo返回首页');

      // 点击导航栏的"运动拼团"链接
      const navLink = await page.locator('a:has-text("运动拼团")').first();
      if (await navLink.isVisible()) {
        await navLink.click();
        await page.waitForURL('http://localhost:3006/activities');
        console.log('   ✅ 点击导航链接跳转成功');
      }

      results.passed.push('验证导航功能');
    } catch (error) {
      console.log(`   ❌ 失败: ${error.message}`);
      results.failed.push({ test: '验证导航功能', error: error.message });
    }

  } catch (error) {
    console.error(`\n❌ 测试执行错误: ${error.message}`);
  } finally {
    await browser.close();
  }

  // 打印测试结果
  console.log('\n' + '='.repeat(60));
  console.log('📊 QA Browser Testing Results');
  console.log('='.repeat(60));
  console.log(`\n✅ 通过: ${results.passed.length}`);
  console.log(`❌ 失败: ${results.failed.length}`);
  console.log(`📈 通过率: ${((results.passed.length / (results.passed.length + results.failed.length)) * 100).toFixed(1)}%`);

  if (results.failed.length > 0) {
    console.log('\n❌ 失败的测试:');
    results.failed.forEach(({ test, error }) => {
      console.log(`   - ${test}: ${error}`);
    });
  }

  console.log('\n' + '='.repeat(60));

  // 返回退出码
  process.exit(results.failed.length > 0 ? 1 : 0);
}

runQABrowserTests().catch(error => {
  console.error('❌ QA测试执行失败:', error);
  process.exit(1);
});
