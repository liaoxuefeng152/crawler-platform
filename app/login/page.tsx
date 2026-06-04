'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowRight,
  Zap,
  HeartPulse,
  CheckCircle,
  XCircle,
  Loader2,
  BrainCircuit,
  Code2,
  TestTube2,
  Database,
  KeyRound,
  Settings2,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { InputWithIcon } from '@/components/ui/input-with-icon';
import { User, Lock } from 'lucide-react';
import MainLayout from '@/components/layout/main-layout';
import { userApi } from '@/lib/api';
import { handleApiError } from '@/lib/api';
import { useUserStore } from '@/stores/core/useUserStore';
import { useLoginCredentialsStore } from '@/stores/core/useLoginCredentialsStore';
import { useToast } from '@/components/ui/toast';
import { getSafeRedirect } from '@/lib/security';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { PROJECT_NAME } from '@/lib/config/project';

// 健康检测响应类型
interface HealthCheckResponse {
  success: boolean;
  data: {
    overallStatus: 'healthy' | 'partial' | 'error';
    checks: {
      database: {
        status: 'connected' | 'disconnected' | 'error';
        type: string;
        host: string;
        latency?: string;
        error?: string;
      };
      larkOAuth: {
        status: 'configured' | 'partial' | 'missing';
        hasAppId: boolean;
        hasAppSecret: boolean;
        hasRedirectUri: boolean;
      };
      projectConfig: {
        status: 'configured' | 'missing';
        hasTablePrefix: boolean;
        hasProjectName: boolean;
      };
    };
    environment: {
      nodeEnv: string;
      timestamp: string;
    };
  };
}

// Feature icons for tech badges
const featureIcons = [BrainCircuit, Zap, Code2, TestTube2];
const featureLabels = ['AI需求分析', '自动化开发', '代码审查', '自动化测试'];

function LarkLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/icons/lark.png"
      alt="飞书"
      className={className}
      width={24}
      height={24}
    />
  );
}

// ========== 飞书授权登录错误码映射 ==========
const LARK_REDIRECT_URL_MESSAGE =
  '请联系深瞳科技添加冲定向URL，即可成功飞书登录';

const LARK_ERROR_MAP: Record<string, { code: string; message: string }> = {
  lark_no_code: {
    code: 'LARK_AUTH_001',
    message: LARK_REDIRECT_URL_MESSAGE,
  },
  lark_app_token_failed: {
    code: 'LARK_AUTH_002',
    message: '飞书应用凭证获取失败，请联系管理员',
  },
  lark_token_failed: {
    code: 'LARK_AUTH_003',
    message: LARK_REDIRECT_URL_MESSAGE,
  },
  lark_user_failed: {
    code: 'LARK_AUTH_004',
    message: '飞书用户信息获取失败，请重试',
  },
  lark_create_failed: {
    code: 'LARK_AUTH_005',
    message: '用户创建失败，请联系管理员',
  },
  user_inactive: {
    code: 'LARK_AUTH_006',
    message: '账户已被禁用，请联系管理员',
  },
  lark_auth_failed: {
    code: 'LARK_AUTH_007',
    message: LARK_REDIRECT_URL_MESSAGE,
  },
};

function LoginForm() {
  // ========== 获取URL参数 ==========
  const searchParams = useSearchParams();
  const redirectParam = searchParams?.get('redirect');

  // ========== 凭证存储 Store ==========
  const { saveCredentials, setRememberMe } = useLoginCredentialsStore();

  // ========== 用户名密码登录 ==========
  // 初始值设为空，避免被 store 默认值覆盖
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMeLocal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 标记是否已经处理过凭证（避免 hydration 导致的重复执行）
  const hasInitializedCredentials = useRef(false);

  // ========== 凭证初始化（只执行一次）==========
  useEffect(() => {
    // 防止重复执行
    if (hasInitializedCredentials.current) return;
    hasInitializedCredentials.current = true;

    // 优先使用注册成功的临时凭证（一次性）
    const tempCreds = useLoginCredentialsStore
      .getState()
      .consumeTempCredentials();
    if (tempCreds && tempCreds.fromRegister) {
      console.log('[Login] 检测到注册临时凭证，自动填充:', tempCreds.username);
      setUsername(tempCreds.username);
      setPassword(tempCreds.password);
      setRememberMeLocal(true);
      setRememberMe(true);
      return;
    }

    // 否则使用存储的记住凭证（从 store 获取最新值）
    const { credentials: storedCreds } = useLoginCredentialsStore.getState();
    if (storedCreds.username) {
      console.log('[Login] 使用记住的凭证:', storedCreds.username);
      setUsername(storedCreds.username);
    }
    if (storedCreds.password) {
      setPassword(storedCreds.password);
    }
    setRememberMeLocal(storedCreds.rememberMe);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 空依赖数组，只在组件挂载时执行一次

  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);
  const { showToast } = useToast();

  // ========== 飞书授权登录错误提示 ==========
  useEffect(() => {
    const errorParam = searchParams?.get('error');
    if (errorParam) {
      const errorInfo = LARK_ERROR_MAP[errorParam];
      if (errorInfo) {
        showToast(`[${errorInfo.code}] ${errorInfo.message}`, 'error', 5000);
      } else {
        showToast(
          '[LARK_AUTH_UNKNOWN] 飞书授权登录失败，请重试',
          'error',
          5000
        );
      }
      // 清除 URL 中的 error 参数（避免刷新页面时重复提示）
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams, showToast]);

  // ========== 手机号验证码登录 ==========
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [phoneError, setPhoneError] = useState('');

  // ========== 环境健康检测 ==========
  const [isHealthCheckLoading, setIsHealthCheckLoading] = useState(false);
  const [isHealthCheckDialogOpen, setIsHealthCheckDialogOpen] = useState(false);
  const [healthCheckResult, setHealthCheckResult] =
    useState<HealthCheckResponse | null>(null);

  // 检测环境健康状态
  const handleCheckHealthStatus = async () => {
    setIsHealthCheckLoading(true);
    try {
      const response = await fetch('/api/system/db-status');
      const data: HealthCheckResponse = await response.json();
      setHealthCheckResult(data);
      setIsHealthCheckDialogOpen(true);
    } catch {
      setHealthCheckResult({
        success: false,
        data: {
          overallStatus: 'error',
          checks: {
            database: {
              status: 'error',
              type: 'Unknown',
              host: 'Unknown',
              error: '无法连接到服务器',
            },
            larkOAuth: {
              status: 'missing',
              hasAppId: false,
              hasAppSecret: false,
              hasRedirectUri: false,
            },
            projectConfig: {
              status: 'missing',
              hasTablePrefix: false,
              hasProjectName: false,
            },
          },
          environment: {
            nodeEnv: 'unknown',
            timestamp: new Date().toISOString(),
          },
        },
      });
      setIsHealthCheckDialogOpen(true);
    } finally {
      setIsHealthCheckLoading(false);
    }
  };

  // 处理用户名密码登录
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 使用axios调用登录API
      const response = await userApi.login(username, password);

      // 登录成功
      if (response.data && response.data.user && response.data.accessToken) {
        // 更新zustand store
        setUser(response.data.user);

        // 保存token到localStorage（用于axios拦截器）
        if (rememberMe) {
          localStorage.setItem('token', response.data.accessToken);
          // 登录成功且勾选记住我时，保存凭证到 store
          saveCredentials(username, password);
        }

        showToast('登录成功', 'success');
        // 使用安全的重定向逻辑
        const redirectTarget = getSafeRedirect(
          redirectParam ?? null,
          '/dashboard'
        );
        router.push(redirectTarget);
      } else {
        // 登录失败
        setError('登录失败，请检查用户名和密码');
      }
    } catch {
      // 使用统一的错误处理
      const errorMessage = handleApiError(error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理记住我复选框变化
  const handleRememberMeChange = (checked: boolean) => {
    setRememberMeLocal(checked);
    setRememberMe(checked);
  };
  const handleSendCode = async () => {
    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setPhoneError('请输入正确的手机号');
      return;
    }
    setPhoneError('');

    try {
      setIsSendingCode(true);
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (data.success) {
        showToast(`验证码已发送：${data.code}`, 'success');
        // 开始倒计时
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        showToast('发送失败，请稍后重试', 'error');
      }
    } catch {
      showToast('发送失败，请稍后重试', 'error');
    } finally {
      setIsSendingCode(false);
    }
  };

  // 验证码登录
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证手机号和验证码
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setPhoneError('请输入正确的手机号');
      return;
    }
    if (!code || code.length !== 4) {
      showToast('请输入4位验证码', 'error');
      return;
    }
    setPhoneError('');

    try {
      setIsVerifying(true);
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });

      const data = await response.json();

      if (data.success) {
        // 保存用户信息和token
        setUser(data.user);
        if (data.token) {
          localStorage.setItem('token', data.token);
        }

        showToast('登录成功', 'success');
        // 使用安全的重定向逻辑
        const redirectTarget = getSafeRedirect(
          redirectParam ?? null,
          '/dashboard'
        );
        router.push(redirectTarget);
      } else {
        showToast('验证码错误或已过期', 'error');
      }
    } catch {
      showToast('登录失败，请稍后重试', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLarkQuickLogin = () => {
    const redirect = redirectParam || '/dashboard';
    window.location.href = `/api/auth/lark?redirect=${encodeURIComponent(redirect)}`;
  };

  const quickLoginProviders = [
    {
      id: 'lark',
      label: '飞书',
      icon: LarkLogo,
      onClick: handleLarkQuickLogin,
    },
  ];

  return (
    <MainLayout
      headerActions={
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleCheckHealthStatus}
          disabled={isHealthCheckLoading}
          className="h-9 w-9 border-2 border-transparent hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-all"
          aria-label={isHealthCheckLoading ? '正在健康监测' : '健康监测'}
          title={isHealthCheckLoading ? '正在健康监测' : '健康监测'}
        >
          {isHealthCheckLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <HeartPulse className="h-4 w-4" />
          )}
        </Button>
      }
    >
      <main className="flex-1 flex items-center justify-center p-4 relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Animated grid background */}
          <div className="absolute inset-0 tech-grid-bg opacity-[0.03] dark:opacity-[0.08]" />

          {/* Floating particles effect */}
          <div className="tech-particle particle-1" />
          <div className="tech-particle particle-2" />
          <div className="tech-particle particle-3" />
          <div className="tech-particle particle-4" />

          {/* Gradient orbs */}
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-40 dark:opacity-30"
            animate={{
              scale: [1, 1.1, 1],
              x: [0, 20, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400/10 dark:bg-[#89ceff]/10 rounded-full mix-blend-multiply filter blur-xl opacity-40 dark:opacity-30"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, -30, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          />
        </div>

        <div className="relative z-10 w-full max-w-5xl">
          {/* 浅色：明显边框 + 深色阴影 | 深色：明显边框 + 蓝色阴影 */}
          <motion.div
            className="rounded-2xl shadow-2xl overflow-hidden border-2 border-border/80 dark:border-2 dark:border-[#89ceff]/25 dark:shadow-[0_0_40px_rgba(137,206,255,0.12)]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="grid md:grid-cols-2">
              {/* Left side - Branding with glassmorphism */}
              <motion.div
                className="relative p-8 md:p-12 flex flex-col justify-between overflow-hidden"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-brand-800 dark:from-[#0c1324] dark:via-[#151b2d] dark:to-[#070d1f]" />
                <div className="absolute inset-0 tech-grid-bg opacity-0 dark:opacity-[0.18]" />
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500/30 via-cyan-400/20 to-transparent dark:from-[#89ceff] dark:via-[#89ceff]/30" />

                {/* Inner glow effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-32 bg-gradient-to-b from-primary/10 dark:from-[#89ceff]/12 to-transparent blur-2xl" />

                {/* Animated gradient border glow - 左右分隔线 */}
                <div className="absolute inset-0 border-r-2 border-primary/30 dark:border-[#89ceff]/30" />

                {/* Content */}
                <div className="relative z-10">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <div className="flex items-center gap-3 mb-8">
                      <motion.div
                        className="w-10 h-10 bg-white/20 dark:bg-[#89ceff] backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30 dark:border-[#89ceff]/60 shadow-lg dark:shadow-[0_0_16px_rgba(137,206,255,0.24)]"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <Zap className="w-6 h-6 text-white dark:text-[#003751]" />
                      </motion.div>
                      <span className="text-2xl font-bold text-white dark:font-headline dark:text-[#89ceff]">
                        {PROJECT_NAME}
                      </span>
                    </div>
                  </motion.div>

                  <motion.div
                    className="space-y-3"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <motion.h1
                      className="text-4xl md:text-5xl font-bold leading-tight text-white dark:text-foreground"
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                    >
                      欢迎回来
                    </motion.h1>
                    <motion.p
                      className="text-white/80 dark:text-muted-foreground text-lg leading-relaxed"
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.7 }}
                    >
                      登录您的账户，继续您的AI编码之旅。让智能技术助力您的开发工作。
                    </motion.p>
                  </motion.div>

                  {/* Tech badges */}
                  <motion.div
                    className="mt-8 flex flex-wrap gap-2"
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                  >
                    {featureLabels.map((feature, index) => {
                      const Icon = featureIcons[index];
                      return (
                        <div
                          key={feature}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 dark:bg-[#89ceff]/10 backdrop-blur-sm border border-white/30 dark:border-[#89ceff]/25 text-xs font-medium text-white/90 dark:text-[#bec8d2]"
                        >
                          <Icon className="w-3 h-3 text-white/70 dark:text-[#89ceff]" />
                          <span>{feature}</span>
                        </div>
                      );
                    })}
                  </motion.div>

                  {/* Stats */}
                  <motion.div
                    className="mt-12 grid grid-cols-3 gap-3"
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.1 }}
                  >
                    {[
                      { value: '1M+', label: '代码生成' },
                      { value: '50M+', label: 'Token消耗' },
                      { value: '80%', label: '提效比' },
                    ].map((stat, index) => (
                      <motion.div
                        key={index}
                        className="text-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          duration: 0.5,
                          delay: 1.3 + index * 0.1,
                          type: 'spring',
                          stiffness: 200,
                        }}
                      >
                        <div className="text-2xl font-bold text-white dark:text-[#89ceff]">
                          {stat.value}
                        </div>
                        <div className="text-white/70 dark:text-muted-foreground text-sm">
                          {stat.label}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                {/* Bottom tech accent */}
                <motion.div
                  className="relative z-10 mt-8 opacity-40"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  transition={{ duration: 0.6, delay: 1.5 }}
                >
                  <div className="flex items-center justify-center gap-2 text-xs font-mono text-muted-foreground/50">
                    <span>●</span>
                    <span>SYSTEM READY</span>
                    <span className="animate-pulse">●</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right side - Login Form with glassmorphism */}
              <motion.div
                className="relative p-8 md:p-12 overflow-hidden"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
              >
                {/* 右侧表单区背景 - 浅色纯白/深色深蓝灰 */}
                <div className="absolute inset-0 bg-white dark:bg-[#0a1628]" />
                {/* 右侧表单区左边框 - 与左侧品牌区的分隔线 */}
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-border via-border to-border dark:from-[#89ceff]/40 dark:via-[#89ceff]/20 dark:to-[#89ceff]/40" />

                {/* Content */}
                <div className="relative z-10">
                  <motion.div
                    className="mb-8"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    <h2 className="text-3xl font-bold text-foreground mb-2">
                      登录账户
                    </h2>
                    <p className="text-muted-foreground">
                      输入您的凭证以访问系统
                    </p>
                  </motion.div>

                  {/* Tab切换 */}
                  <Tabs defaultValue="username" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 dark:bg-[#151b2d] backdrop-blur-sm border border-border/50 dark:border-[#3e4850]/60">
                      <TabsTrigger
                        value="username"
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        用户名登录
                      </TabsTrigger>
                      <TabsTrigger
                        value="phone"
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        手机号登录
                      </TabsTrigger>
                    </TabsList>

                    {/* 用户名密码登录 */}
                    <TabsContent value="username">
                      <form onSubmit={handleSubmit} className="space-y-3">
                        {error && (
                          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
                            {error}
                          </div>
                        )}

                        <div className="space-y-4">
                          <motion.div
                            className="space-y-2"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                          >
                            <Label
                              htmlFor="username"
                              className="text-sm font-medium text-foreground"
                            >
                              用户名
                            </Label>
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileFocus={{ scale: 1.02 }}
                            >
                              <InputWithIcon
                                id="username"
                                type="text"
                                value={username}
                                onChange={setUsername}
                                placeholder="输入您的用户名"
                                icon={User}
                                className="h-12 bg-muted/30 dark:bg-[#151b2d] backdrop-blur-sm border-border/50 dark:border-[#3e4850]/60 rounded-lg focus:border-primary focus:ring-primary/20"
                                required
                              />
                            </motion.div>
                          </motion.div>

                          <motion.div
                            className="space-y-2"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.7 }}
                          >
                            <Label
                              htmlFor="password"
                              className="text-sm font-medium text-foreground"
                            >
                              密码
                            </Label>
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileFocus={{ scale: 1.02 }}
                            >
                              <InputWithIcon
                                id="password"
                                type="password"
                                value={password}
                                onChange={setPassword}
                                placeholder="输入您的密码"
                                icon={Lock}
                                className="h-12 bg-muted/30 dark:bg-[#151b2d] backdrop-blur-sm border-border/50 dark:border-[#3e4850]/60 rounded-lg focus:border-primary focus:ring-primary/20"
                                required
                              />
                            </motion.div>
                          </motion.div>
                        </div>

                        <motion.div
                          className="flex items-center justify-between"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.8 }}
                        >
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="remember"
                              checked={rememberMe}
                              onCheckedChange={handleRememberMeChange}
                              className="border-border/50 dark:border-[#3e4850]/70 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary"
                            />
                            <Label
                              htmlFor="remember"
                              className="text-sm text-muted-foreground cursor-pointer"
                            >
                              记住我
                            </Label>
                          </div>
                          <Link
                            href="/forgot-password"
                            className="text-sm text-primary hover:text-primary/80 transition-colors"
                          >
                            忘记密码？
                          </Link>
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.9 }}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-primary"
                          >
                            <AnimatePresence mode="wait">
                              {isLoading ? (
                                <motion.div
                                  key="loading"
                                  className="flex items-center space-x-2"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                  <span>正在登录...</span>
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="login"
                                  className="flex items-center justify-center space-x-2"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <span>登录</span>
                                  <ArrowRight className="w-5 h-5" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </Button>
                        </motion.div>
                      </form>
                    </TabsContent>

                    {/* 手机号验证码登录 */}
                    <TabsContent value="phone">
                      <form onSubmit={handleVerifyCode} className="space-y-3">
                        <div className="space-y-4">
                          <motion.div className="space-y-2">
                            <Label
                              htmlFor="phone"
                              className="text-sm font-medium text-foreground"
                            >
                              手机号
                            </Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="请输入11位手机号"
                              className="h-12 bg-muted/30 dark:bg-[#151b2d] backdrop-blur-sm border-border/50 dark:border-[#3e4850]/60"
                              maxLength={11}
                            />
                            {phoneError && (
                              <p className="text-sm text-destructive">
                                {phoneError}
                              </p>
                            )}
                          </motion.div>

                          <motion.div className="space-y-2">
                            <Label
                              htmlFor="code"
                              className="text-sm font-medium text-foreground"
                            >
                              验证码
                            </Label>
                            <div className="flex gap-2">
                              <Input
                                id="code"
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="请输入4位验证码"
                                className="h-12 flex-1 bg-muted/30 dark:bg-[#151b2d] backdrop-blur-sm border-border/50 dark:border-[#3e4850]/60"
                                maxLength={4}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleSendCode}
                                disabled={countdown > 0 || isSendingCode}
                                className="h-12 px-4 whitespace-nowrap border-2 border-primary/50 text-primary hover:bg-primary/5 hover:border-primary"
                              >
                                {isSendingCode
                                  ? '发送中...'
                                  : countdown > 0
                                    ? `${countdown}秒`
                                    : '获取验证码'}
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              测试环境验证码固定为：1234
                            </p>
                          </motion.div>
                        </div>

                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <Button
                            type="submit"
                            disabled={isVerifying}
                            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-primary"
                          >
                            <AnimatePresence mode="wait">
                              {isVerifying ? (
                                <motion.div
                                  key="loading"
                                  className="flex items-center space-x-2"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                  <span>正在登录...</span>
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="login"
                                  className="flex items-center justify-center space-x-2"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <span>登录</span>
                                  <ArrowRight className="w-5 h-5" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </Button>
                        </motion.div>
                      </form>
                    </TabsContent>
                  </Tabs>

                  <motion.div
                    className="mt-8 text-center"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.0 }}
                  >
                    <p className="text-muted-foreground">
                      还没有账户？{' '}
                      <Link
                        href="/signup"
                        className="text-primary hover:text-primary/80 font-medium transition-colors"
                      >
                        立即注册
                      </Link>
                    </p>
                  </motion.div>

                  {/* 快捷登录入口 */}
                  <motion.div
                    className="mt-6"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                  >
                    <Separator className="my-4 bg-border/50 dark:border-[#3e4850]/60" />
                    <div className="text-center mb-4">
                      <span className="text-sm text-muted-foreground">
                        快捷登录
                      </span>
                    </div>
                    <TooltipProvider delayDuration={120}>
                      <div className="flex items-center justify-center gap-3">
                        {quickLoginProviders.map((provider) => {
                          const Icon = provider.icon;

                          return (
                            <Tooltip key={provider.id}>
                              <TooltipTrigger asChild>
                                <motion.div
                                  whileHover={{ y: -2, scale: 1.04 }}
                                  whileTap={{ scale: 0.96 }}
                                >
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={provider.onClick}
                                    aria-label={`使用${provider.label}登录`}
                                    title={`使用${provider.label}登录`}
                                    className="h-11 w-11 rounded-full border-border/70 bg-background/80 hover:border-primary/50 hover:bg-primary/5 dark:border-[#3e4850]/70 dark:bg-[#151b2d]/80 dark:hover:border-[#89ceff]/50 dark:hover:bg-[#89ceff]/10"
                                  >
                                    <Icon className="h-6 w-6" />
                                    <span className="sr-only">
                                      使用{provider.label}登录
                                    </span>
                                  </Button>
                                </motion.div>
                              </TooltipTrigger>
                              <TooltipContent>
                                使用{provider.label}登录
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>
                    </TooltipProvider>
                    <p className="text-center text-xs text-muted-foreground mt-3">
                      登录即表示同意服务条款和隐私政策
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* 环境健康状态对话框 */}
        <Dialog
          open={isHealthCheckDialogOpen}
          onOpenChange={setIsHealthCheckDialogOpen}
        >
          <DialogContent className="sm:max-w-lg bg-card/90 dark:bg-[#191f31]/90 backdrop-blur-xl border border-border/50 dark:border-[#3e4850]/60">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-primary" />
                环境健康状态
              </DialogTitle>
              <DialogDescription>
                检测系统的各项配置和环境状态
              </DialogDescription>
            </DialogHeader>
            {healthCheckResult && (
              <div className="space-y-4 mt-4">
                {/* 整体状态提示 */}
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg backdrop-blur-sm border ${
                    healthCheckResult.data.overallStatus === 'healthy'
                      ? 'bg-green-50/80 dark:bg-green-900/30 border-green-200 dark:border-green-800'
                      : healthCheckResult.data.overallStatus === 'partial'
                        ? 'bg-yellow-50/80 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800'
                        : 'bg-red-50/80 dark:bg-red-900/30 border-red-200 dark:border-red-800'
                  }`}
                >
                  {healthCheckResult.data.overallStatus === 'healthy' ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="font-medium text-green-700 dark:text-green-400">
                        所有配置正常
                      </span>
                    </>
                  ) : healthCheckResult.data.overallStatus === 'partial' ? (
                    <>
                      <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      <span className="font-medium text-yellow-700 dark:text-yellow-400">
                        部分配置缺失
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <span className="font-medium text-red-700 dark:text-red-400">
                        关键配置错误
                      </span>
                    </>
                  )}
                </div>

                {/* 数据库状态卡片 */}
                <div className="p-4 rounded-lg bg-muted/50 dark:bg-[#151b2d] backdrop-blur-sm border border-border/50 dark:border-[#3e4850]/60">
                  <div className="flex items-center gap-2 mb-3">
                    <Database className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">
                      MongoDB数据库
                    </span>
                    {healthCheckResult.data.checks.database.status ===
                    'connected' ? (
                      <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive ml-auto" />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">类型</span>
                      <span className="font-medium text-foreground">
                        {healthCheckResult.data.checks.database.type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">主机</span>
                      <span className="font-medium font-mono text-xs text-foreground">
                        {healthCheckResult.data.checks.database.host}
                      </span>
                    </div>
                    {healthCheckResult.data.checks.database.latency && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">延迟</span>
                        <span className="font-medium text-foreground">
                          {healthCheckResult.data.checks.database.latency}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">状态</span>
                      <span
                        className={`font-medium ${healthCheckResult.data.checks.database.status === 'connected' ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}
                      >
                        {healthCheckResult.data.checks.database.status ===
                        'connected'
                          ? '已连接'
                          : '连接失败'}
                      </span>
                    </div>
                  </div>
                  {healthCheckResult.data.checks.database.error && (
                    <div className="mt-3 p-2 bg-destructive/10 rounded text-xs text-destructive">
                      {healthCheckResult.data.checks.database.error}
                    </div>
                  )}
                </div>

                {/* 飞书OAuth配置卡片 */}
                <div className="p-4 rounded-lg bg-muted/50 dark:bg-[#151b2d] backdrop-blur-sm border border-border/50 dark:border-[#3e4850]/60">
                  <div className="flex items-center gap-2 mb-3">
                    <KeyRound className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">
                      飞书OAuth配置
                    </span>
                    {healthCheckResult.data.checks.larkOAuth.status ===
                    'configured' ? (
                      <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                    ) : healthCheckResult.data.checks.larkOAuth.status ===
                      'partial' ? (
                      <AlertTriangle className="w-4 h-4 text-yellow-500 ml-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive ml-auto" />
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">AppID</span>
                      {healthCheckResult.data.checks.larkOAuth.hasAppId ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Secret</span>
                      {healthCheckResult.data.checks.larkOAuth.hasAppSecret ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">RedirectURI</span>
                      {healthCheckResult.data.checks.larkOAuth
                        .hasRedirectUri ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>

                {/* 项目配置卡片 */}
                <div className="p-4 rounded-lg bg-muted/50 dark:bg-[#151b2d] backdrop-blur-sm border border-border/50 dark:border-[#3e4850]/60">
                  <div className="flex items-center gap-2 mb-3">
                    <Settings2 className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">
                      项目配置
                    </span>
                    {healthCheckResult.data.checks.projectConfig.status ===
                    'configured' ? (
                      <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive ml-auto" />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">表名前缀</span>
                      {healthCheckResult.data.checks.projectConfig
                        .hasTablePrefix ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">项目名</span>
                      {healthCheckResult.data.checks.projectConfig
                        .hasProjectName ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>

                {/* 环境信息 */}
                <div className="flex justify-between items-center text-sm pt-2 border-t border-border/50 dark:border-[#3e4850]/60">
                  <span className="text-muted-foreground">运行环境</span>
                  <span className="font-medium text-foreground">
                    {healthCheckResult.data.environment.nodeEnv}
                  </span>
                </div>

                {/* 时间戳 */}
                <div className="text-xs text-muted-foreground text-right">
                  检测时间:{' '}
                  {new Date(
                    healthCheckResult.data.environment.timestamp
                  ).toLocaleString('zh-CN')}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </MainLayout>
  );
}

// 使用Suspense包裹以支持useSearchParams
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <MainLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-muted-foreground">加载中...</div>
          </div>
        </MainLayout>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
