import { defineConfig } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

const eslintConfig = defineConfig([
  {
    ignores: [
      // Dependency directories
      'node_modules/',
      '.next/',
      'out/',
      'build/',
      'dist/',

      // Production build files
      '*.tsbuildinfo',
      'next-env.d.ts',

      // Development templates and scripts
      '.az/dev/**',
      '.claude/**',
      'scripts/',

      // Configuration files
      '*.config.js',
      '*.config.mjs',
      '*.config.ts',
      'prettier.config.js',
      '.prettierrc.*',
    ],
  },
  ...nextVitals,
  ...nextTs,
  prettierConfig,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
]);

export default eslintConfig;
