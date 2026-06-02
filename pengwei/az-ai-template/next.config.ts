import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 移除 webpack 配置，依赖 tsconfig.json 中的路径别名配置
  // Turbopack 会自动使用 tsconfig.json 中的 baseUrl 和 paths 配置
  // 如果需要 Turbopack 特定配置，可以在这里添加
  // experimental: {
  //   turbo: {
  //     resolveAlias: {
  //       '@': '.',
  //     },
  //   },
  // },
};

export default nextConfig;
