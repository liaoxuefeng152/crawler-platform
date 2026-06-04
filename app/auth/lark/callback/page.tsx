'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useUserStore } from '@/stores/core/useUserStore';
import { PROJECT_NAME } from '@/lib/config/project';
import larkTokenService from '@/lib/services/larkTokenService';

// 禁用静态预渲染，因为使用了 useSearchParams
export const dynamic = 'force-dynamic';

/**
 * 飞书 OAuth2 回调处理页面
 * 读取 URL 中的 token 参数，存储到 localStorage 和 Zustand store
 */

function LarkCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useUserStore((state) => state.setUser);
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>(
    'processing'
  );
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 从 URL 参数读取飞书登录信息
        const accessToken = searchParams.get('lark_access_token');
        const refreshToken = searchParams.get('lark_refresh_token');
        const userId = searchParams.get('lark_user_id');
        const userName = searchParams.get('lark_user_name');
        const userUsername = searchParams.get('lark_user_username');
        const userEmail = searchParams.get('lark_user_email');
        const userRole = searchParams.get('lark_user_role');
        const larkUserAccessToken = searchParams.get('lark_user_access_token'); // 飞书 API token
        const larkUserRefreshToken = searchParams.get(
          'lark_user_refresh_token'
        );
        const redirect = searchParams.get('redirect') || '/dashboard';

        if (!accessToken || !userId) {
          setStatus('error');
          setErrorMessage('缺少登录信息');
          return;
        }

        // 存储 token 到 localStorage
        localStorage.setItem('token', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }

        // 使用 larkTokenService 存储飞书 Token（含过期时间）
        if (larkUserAccessToken && larkUserRefreshToken) {
          larkTokenService.saveTokens(
            larkUserAccessToken,
            larkUserRefreshToken,
            7200
          );

          // 持久化到数据库（解决每次重新打开项目需重新授权的问题）
          try {
            await fetch('/api/auth/lark/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: userId,
                username: userUsername || undefined,
                email: userEmail || undefined,
                accessToken: larkUserAccessToken,
                refreshToken: larkUserRefreshToken,
                expiresIn: 7200,
              }),
            });
            console.log('[LarkCallback] Token已持久化到数据库');
          } catch (e) {
            console.error('[LarkCallback] Token持久化失败:', e);
          }
        }

        // 更新 Zustand store
        setUser({
          id: userId,
          username: userUsername || '',
          displayName: userName || '',
          email: userEmail || '',
          role: userRole || 'user',
        });

        setStatus('success');

        // 等待一小段时间让用户看到成功状态
        await new Promise((resolve) => setTimeout(resolve, 500));

        // 获取最终重定向目标（去掉 lark_* 参数）
        const finalRedirect = redirect.split('?')[0];
        router.push(finalRedirect);
      } catch (error) {
        console.error('飞书登录回调处理失败:', error);
        setStatus('error');
        setErrorMessage('登录处理失败');
      }
    };

    handleCallback();
  }, [searchParams, setUser, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-[#070d1f] dark:via-[#0c1324] dark:to-[#151b2d]">
      <div className="text-center">
        {status === 'processing' && (
          <>
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">正在完成飞书登录...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-green-600 dark:text-green-400 font-medium">
              登录成功，正在跳转...
            </p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="text-red-600 dark:text-red-400 font-medium mb-4">
              {errorMessage}
            </p>
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 transition-colors"
            >
              返回登录页
            </button>
          </>
        )}
        <p className="text-sm text-muted-foreground mt-6">{PROJECT_NAME}</p>
      </div>
    </div>
  );
}

/**
 * 主页面组件 - 包裹 Suspense boundary
 */
export default function LarkCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-[#070d1f] dark:via-[#0c1324] dark:to-[#151b2d]">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">正在处理登录...</p>
            <p className="text-sm text-muted-foreground mt-6">{PROJECT_NAME}</p>
          </div>
        </div>
      }
    >
      <LarkCallbackContent />
    </Suspense>
  );
}
