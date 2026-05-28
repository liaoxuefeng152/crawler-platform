import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.spec.ts',
  timeout: 60000, // 增加到60秒
  expect: {
    timeout: 15000, // 增加expect超时到15秒
  },
  fullyParallel: false, // 禁用并行执行，使用共享storage state
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // 增加重试次数
  workers: 1, // 只使用一个worker
  reporter: 'html',
  // globalSetup: 'tests/global-setup.ts', // 暂时禁用，使用手动创建的storage state
  use: {
    baseURL: 'http://localhost:3001',
    storageState: 'tests/storage-state.json', // 使用手动创建的登录状态
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000, // 增加操作超时
    navigationTimeout: 30000, // 增加导航超时
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // 禁用自动启动服务器（使用已存在的服务器）
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3001',
  //   reuseExistingServer: true,
  //   timeout: 120000,
  // },
});
