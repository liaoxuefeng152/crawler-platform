'use client';

import { useEffect } from 'react';
import { useToast } from '@/components/ui/toast';

/**
 * 全局错误处理组件
 * 监听 Axios 拦截器发出的 global-error 事件，自动展示错误 Toast
 */
export function GlobalErrorHandler() {
  const { showToast } = useToast();

  useEffect(() => {
    const handleGlobalError = (event: Event) => {
      const msg = (event as CustomEvent<string>).detail;
      if (msg) {
        showToast(msg, 'error', 2000);
      }
    };

    window.addEventListener('global-error', handleGlobalError as EventListener);
    return () => {
      window.removeEventListener('global-error', handleGlobalError as EventListener);
    };
  }, [showToast]);

  return null;
}
