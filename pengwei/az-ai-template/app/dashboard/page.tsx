'use client';

import DashboardLayout from '@/components/layout/dashboard-layout';
import { useEffect, useState } from 'react';
import { PROJECT_NAME } from '@/lib/config/project';

export default function Dashboard() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-white via-blue-50/30 to-white">
        {/* 居中容器 - 调整为上部1/3位置 */}
        <div className="flex min-h-[calc(100vh-4rem)] items-start justify-center px-4 pt-[20vh]">
          {/* 内容区域 - 淡入动画 */}
          <div
            className={`w-full max-w-3xl transition-all duration-700 ease-out ${
              isClient ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {/* 简洁卡片 - 移除边框 */}
            <div className="rounded-xl bg-white/90 backdrop-blur-sm shadow-lg p-8 sm:p-12">
              {/* 内容区域 */}
              <div className="space-y-8 text-center">
                {/* 品牌标题 */}
                <div className="space-y-3">
                  <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl">
                    {PROJECT_NAME}
                  </h1>

                  {/* 简洁分隔线 */}
                  <div className="flex items-center justify-center">
                    <div className="h-px w-16 bg-gradient-to-r from-transparent to-blue-400" />
                    <div className="mx-3 h-2 w-2 rounded-full bg-blue-500" />
                    <div className="h-px w-16 bg-gradient-to-l from-transparent to-blue-400" />
                  </div>
                </div>

                {/* 副标题和描述 */}
                <div className="space-y-3">
                  <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 sm:text-2xl">
                    欢迎使用智能AI编码助手
                  </p>
                  <p className="text-base text-gray-600 dark:text-gray-400 sm:text-lg">
                    让我们开始今天的开发之旅
                  </p>
                </div>

                {/* 特性标签 */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                  {['AI需求分析', '自动化开发', '代码审查', '自动化测试'].map(
                    (feature) => (
                      <span
                        key={feature}
                        className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/50"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {feature}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
