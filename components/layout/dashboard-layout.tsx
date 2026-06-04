'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import MainLayout from './main-layout';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function DashboardLayout({
  children,
  title,
}: DashboardLayoutProps) {
  const pathname = usePathname();

  // Get the active menu item title based on pathname
  const getActiveTitle = () => {
    if (title) return title;

    if (!pathname) return '概览';

    const pathSegments = pathname.split('/');
    const currentPath = pathSegments[pathSegments.length - 1];

    const titles: Record<string, string> = {
      dashboard: '概览',
      'ai-editor-demo': 'AI编辑器 - 基础演示',
      'simple-ai-editor': 'AI编辑器 - 简洁版',
      'notion-editor': 'AI编辑器 - Notion-like',
      components: '组件管理',
      automation: '自动化工作流',
      'user-management': '用户管理',
      settings: '设置',
    };

    return titles[currentPath] || '概览';
  };

  // 组件管理页面 - 已实现，直接渲染children
  if (pathname === '/dashboard/components') {
    return (
      <MainLayout showSidebar title={getActiveTitle()}>
        <div className="p-4 md:p-4">{children}</div>
      </MainLayout>
    );
  }

  // 仪表板概览页面 - 已实现，直接渲染children
  if (pathname === '/dashboard') {
    return (
      <MainLayout showSidebar title={getActiveTitle()}>
        <div className="p-4 md:p-4">{children}</div>
      </MainLayout>
    );
  }

  // AI编辑器页面（完整版、简洁版和 Notion-like）
  if (
    pathname === '/dashboard/ai-editor-demo' ||
    pathname === '/dashboard/simple-ai-editor' ||
    pathname === '/dashboard/notion-editor'
  ) {
    return (
      <MainLayout showSidebar title={getActiveTitle()}>
        <div className="p-4 md:p-4 h-full">{children}</div>
      </MainLayout>
    );
  }

  // 用户管理页面 - 已实现，直接渲染children
  if (pathname === '/dashboard/user-management') {
    return (
      <MainLayout showSidebar title={getActiveTitle()}>
        <div className="p-4 md:p-4">{children}</div>
      </MainLayout>
    );
  }

  // 其他页面 - 重定向到概览页面
  return (
    <MainLayout showSidebar title="页面不存在">
      <div className="p-4 md:p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">页面未找到</h2>
        <p className="text-muted-foreground mb-6">
          您访问的页面不存在或尚未开发。
        </p>
        <div className="space-x-4">
          <button
            onClick={() => (window.location.href = '/dashboard')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            返回概览
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
