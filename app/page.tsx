'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  Sparkles,
  Code,
  Workflow,
  Bug,
  Users,
  Shield,
  ArrowRight,
  TrendingUp,
  Award,
  ChevronRight,
  Bot,
  Terminal,
  Cpu,
  FileCode,
  BrainCircuit,
} from 'lucide-react';
import { PROJECT_NAME } from '@/lib/config/project';
import { useUserStore } from '@/stores/core/useUserStore';
import { ThemeToggle } from '@/components/theme-toggle';

// Feature icons for tech badges
const featureIcons = [BrainCircuit, Zap, Code, Bot];
const featureLabels = ['AI需求分析', '自动化开发', '代码审查', '智能协作'];

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useUserStore();

  const handleStartUse = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 tech-grid-bg opacity-[0.02] dark:opacity-[0.08]" />

      {/* Floating particles effect - only show in dark mode */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden dark:block">
        <div className="tech-particle particle-1" />
        <div className="tech-particle particle-2" />
        <div className="tech-particle particle-3" />
        <div className="tech-particle particle-4" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/60 dark:border-[#3e4850]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-600 dark:bg-[#89ceff] rounded-lg flex items-center justify-center shadow-sm dark:shadow-[0_0_14px_rgba(137,206,255,0.22)]">
                <Zap className="w-5 h-5 text-white dark:text-[#003751]" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary via-blue-400 to-primary dark:from-[#89ceff] dark:via-[#89ceff] dark:to-[#7bd0ff] bg-clip-text text-transparent dark:font-headline">
                {PROJECT_NAME}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                核心功能
              </a>
              <a
                href="#how-it-works"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                工作流程
              </a>
              <a
                href="#benefits"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                产品优势
              </a>
            </div>
            <div className="flex items-center gap-3">
              {/* Theme toggle */}
              <ThemeToggle />
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary/80 border-2 border-transparent hover:border-primary/30"
                    >
                      进入系统
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-primary"
                    >
                      仪表板
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary/80 border-2 border-transparent hover:border-primary/30"
                    >
                      登录
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-primary"
                    >
                      免费注册
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto transition-all duration-700 ease-out opacity-100 translate-y-0">
            {/* Brand badge */}
            <Badge className="bg-muted/50 dark:bg-muted/30 backdrop-blur-sm border border-border/50 dark:border-primary/30 text-primary hover:bg-muted/70 dark:hover:bg-muted/50">
              <Sparkles className="w-3 h-3 mr-1" />
              AI驱动的智能编码助手平台
            </Badge>

            {/* Title with gradient text */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mt-6">
              <span className="bg-gradient-to-r from-primary via-blue-400 to-primary dark:from-[#dce1fb] dark:via-[#89ceff] dark:to-[#7bd0ff] bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_auto]">
                {PROJECT_NAME}
              </span>
              <span className="block mt-2 text-foreground">
                效率提升 <span className="text-primary">80%</span>
              </span>
            </h1>

            {/* Animated separator */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <div className="h-px w-12 sm:w-16 bg-gradient-to-r from-transparent via-primary/60 to-primary animate-pulse-slow" />
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-primary/50 blur-sm animate-pulse" />
              </div>
              <div className="h-px w-12 sm:w-16 bg-gradient-to-l from-transparent via-primary/60 to-primary animate-pulse-slow" />
            </div>

            {/* Subtitle */}
            <p className="font-mono text-xs sm:text-sm text-muted-foreground/60 tracking-widest uppercase mt-4">
              Neural Interface // v2.0
            </p>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mt-4">
              基于Claude
              Code的智能AI编码助手，9阶段标准化开发流程，7位专家Agent协作，完整测试覆盖率保证
            </p>

            {/* CTA buttons with visible borders */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg gap-2 shadow-lg hover:shadow-xl transition-all border-2 border-primary"
                onClick={handleStartUse}
              >
                立即开始使用
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Link href="#features">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-lg border-2 border-primary/50 text-primary hover:bg-primary/5 hover:border-primary"
                >
                  了解更多
                </Button>
              </Link>
            </div>

            {/* Tech badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
              {featureLabels.map((feature, index) => {
                const Icon = featureIcons[index];
                return (
                  <div
                    key={feature}
                    className="tech-badge group/badge relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover/badge:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50/30 dark:bg-[#151b2d]/80 backdrop-blur-sm border border-primary/30 dark:border-[#3e4850]/70 text-sm font-medium text-muted-foreground dark:text-[#bec8d2] transition-all duration-300 group-hover/badge:border-primary/50 group-hover/badge:text-primary">
                      <Icon className="w-4 h-4 text-primary/70 group-hover/badge:text-primary transition-all duration-300 group-hover/badge:scale-110 group-hover/badge:rotate-12" />
                      <span>{feature}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
              {[
                { value: '1M+', label: '代码生成量' },
                { value: '50M+', label: 'Token消耗' },
                { value: '80%', label: '效率提升' },
                { value: '9阶段', label: '标准化流程' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-400 dark:to-[#89ceff] bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom tech accent */}
            <div className="pt-6 opacity-40">
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-muted-foreground/50">
                <span>●</span>
                <span>SYSTEM READY</span>
                <span className="animate-pulse">●</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-muted/50 dark:bg-muted/30 backdrop-blur-sm border border-border/50 dark:border-primary/30 text-primary">
              核心功能
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-4 mb-4">
              全流程智能化开发
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              从需求输入到代码交付，提供完整的AI辅助开发解决方案
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1: az-init */}
            <div
              className="group relative cursor-pointer"
              onClick={() => router.push('/dashboard')}
            >
              <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative rounded-xl bg-card/70 dark:bg-[#191f31]/80 backdrop-blur-xl border border-border/50 dark:border-[#3e4850]/60 p-6 transition-all duration-300 group-hover:border-primary/50">
                <div className="w-12 h-12 bg-muted/50 dark:bg-muted/30 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary transition-colors border border-border/50 dark:border-primary/30">
                  <Terminal className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  /az-init
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  一键初始化开发环境，自动检查依赖安装、配置开发工具
                </p>
                <div className="mt-4 flex items-center text-primary text-sm font-medium">
                  开始使用 <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>

            {/* Feature 2: az-coding */}
            <div
              className="group relative cursor-pointer"
              onClick={() => router.push('/dashboard')}
            >
              <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative rounded-xl bg-card/70 dark:bg-[#191f31]/80 backdrop-blur-xl border border-border/50 dark:border-[#3e4850]/60 p-6 transition-all duration-300 group-hover:border-primary/50">
                <div className="w-12 h-12 bg-muted/50 dark:bg-muted/30 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary transition-colors border border-border/50 dark:border-primary/30">
                  <Workflow className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  /az-coding
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  9阶段标准化开发流程，从需求规划到安全审查
                </p>
                <div className="mt-4 flex items-center text-primary text-sm font-medium">
                  查看流程 <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>

            {/* Feature 3: bug */}
            <div className="group relative cursor-pointer">
              <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative rounded-xl bg-card/70 dark:bg-[#191f31]/80 backdrop-blur-xl border border-border/50 dark:border-[#3e4850]/60 p-6 transition-all duration-300 group-hover:border-primary/50">
                <div className="w-12 h-12 bg-muted/50 dark:bg-muted/30 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary transition-colors border border-border/50 dark:border-primary/30">
                  <Bug className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  /bug
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  智能错误分析器，自动诊断问题根源，提供修复方案
                </p>
                <div className="mt-4 flex items-center text-primary text-sm font-medium">
                  了解更多 <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>

            {/* Feature 4: require */}
            <div className="group relative cursor-pointer">
              <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative rounded-xl bg-card/70 dark:bg-[#191f31]/80 backdrop-blur-xl border border-border/50 dark:border-[#3e4850]/60 p-6 transition-all duration-300 group-hover:border-primary/50">
                <div className="w-12 h-12 bg-muted/50 dark:bg-muted/30 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary transition-colors border border-border/50 dark:border-primary/30">
                  <Bot className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  /require
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  需求协调指挥官，自动分析并安排专家Agent完成任务
                </p>
                <div className="mt-4 flex items-center text-primary text-sm font-medium">
                  了解更多 <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-20 px-4 sm:px-6 lg:px-8 relative"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-muted/50 dark:bg-muted/30 backdrop-blur-sm border border-border/50 dark:border-primary/30 text-primary">
              工作流程
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-4 mb-4">
              简单四步，高效开发
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              输入需求后AI自动规划，7位专家协作开发，完整测试验证后交付
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="relative group">
              <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative rounded-xl bg-card/70 dark:bg-[#191f31]/80 backdrop-blur-xl border border-border/50 dark:border-[#3e4850]/60 p-8 text-center transition-all duration-300 group-hover:border-primary/50">
                <div className="w-16 h-16 bg-muted/50 dark:bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-primary/30 group-hover:border-primary transition-colors">
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 dark:to-[#89ceff] bg-clip-text text-transparent">
                    1
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  输入需求
                </h3>
                <p className="text-muted-foreground">
                  描述功能需求或问题，AI自动理解并分析业务场景
                </p>
              </div>
              <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-primary/20"></div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative rounded-xl bg-card/70 dark:bg-[#191f31]/80 backdrop-blur-xl border border-border/50 dark:border-[#3e4850]/60 p-8 text-center transition-all duration-300 group-hover:border-primary/50">
                <div className="w-16 h-16 bg-muted/50 dark:bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-primary/30 group-hover:border-primary transition-colors">
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 dark:to-[#89ceff] bg-clip-text text-transparent">
                    2
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  AI智能规划
                </h3>
                <p className="text-muted-foreground">
                  自动拆解任务、定义API契约、规划开发序列
                </p>
              </div>
              <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-primary/20"></div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative rounded-xl bg-card/70 dark:bg-[#191f31]/80 backdrop-blur-xl border border-border/50 dark:border-[#3e4850]/60 p-8 text-center transition-all duration-300 group-hover:border-primary/50">
                <div className="w-16 h-16 bg-muted/50 dark:bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-primary/30 group-hover:border-primary transition-colors">
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 dark:to-[#89ceff] bg-clip-text text-transparent">
                    3
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  专家协作开发
                </h3>
                <p className="text-muted-foreground">
                  7位专家Agent协同工作，前端/后端/架构/测试各司其职
                </p>
              </div>
              <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-primary/20"></div>
            </div>

            {/* Step 4 */}
            <div className="relative group">
              <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative rounded-xl bg-card/70 dark:bg-[#191f31]/80 backdrop-blur-xl border border-border/50 dark:border-[#3e4850]/60 p-8 text-center transition-all duration-300 group-hover:border-primary/50">
                <div className="w-16 h-16 bg-muted/50 dark:bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-primary/30 group-hover:border-primary transition-colors">
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 dark:to-[#89ceff] bg-clip-text text-transparent">
                    4
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  测试验证交付
                </h3>
                <p className="text-muted-foreground">
                  完整测试覆盖率保证，构建验证、功能验证、安全审查
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-muted/50 dark:bg-muted/30 backdrop-blur-sm border border-border/50 dark:border-primary/30 text-primary">
                产品优势
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-4 mb-6">
                为什么选择{PROJECT_NAME}？
              </h2>
              <div className="space-y-6">
                {[
                  {
                    icon: TrendingUp,
                    title: '效率提升80%以上',
                    desc: '将传统开发周期大幅缩短，AI自动生成代码、智能分析错误',
                    bgClass: 'bg-green-100 dark:bg-green-900/30',
                    iconClass: 'text-green-600 dark:text-green-400',
                  },
                  {
                    icon: Award,
                    title: '质量保证体系',
                    desc: '完整测试覆盖率保证，构建成功门槛验证，功能闭环检查',
                    bgClass: 'bg-muted/50 dark:bg-muted/30',
                    iconClass: 'text-primary',
                  },
                  {
                    icon: Shield,
                    title: '7位专家Agent协作',
                    desc: '前端专家、后端专家、架构专家、测试专家、QA专家各司其职',
                    bgClass: 'bg-blue-100 dark:bg-[#89ceff]/10',
                    iconClass: 'text-primary',
                  },
                  {
                    icon: Users,
                    title: '标准化开发流程',
                    desc: '9阶段质量驱动开发流程：Plan、Clarify、Tasks、Dev、Test、QA',
                    bgClass: 'bg-purple-100 dark:bg-purple-900/30',
                    iconClass: 'text-purple-600 dark:text-purple-400',
                  },
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${item.bgClass}`}
                    >
                      <item.icon className={`w-6 h-6 ${item.iconClass}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-border-flow" />
              <div className="relative rounded-xl bg-card/70 dark:bg-[#191f31]/80 backdrop-blur-xl border border-border/50 dark:border-[#3e4850]/60 p-8 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-32 bg-gradient-to-b from-primary/5 to-transparent blur-2xl" />
                <div className="relative space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <span className="text-sm font-medium text-muted-foreground">
                      开发效率对比
                    </span>
                    <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                      提升80%
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">
                          传统开发周期
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                          5工作日
                        </span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-muted-foreground/40 rounded-full"
                          style={{ width: '100%' }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-primary">
                          AI辅助开发
                        </span>
                        <span className="text-sm font-bold text-primary">
                          1工作日
                        </span>
                      </div>
                      <div className="h-3 bg-primary/10 rounded-full overflow-hidden border border-primary/30">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-1000"
                          style={{ width: '20%' }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border grid grid-cols-3 gap-4 text-center">
                    {[
                      { value: '7位', label: '专家Agent' },
                      { value: '9阶段', label: '标准流程' },
                      { value: '100%', label: '闭环保证' },
                    ].map((stat, index) => (
                      <div key={index}>
                        <div className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 dark:to-[#89ceff] bg-clip-text text-transparent">
                          {stat.value}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Users Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-muted/50 dark:bg-muted/30 backdrop-blur-sm border border-border/50 dark:border-primary/30 text-primary">
              适用场景
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-4 mb-4">
              为开发者量身打造
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              满足不同角色的开发需求，提升整体开发效率
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Code,
                title: '前端开发工程师',
                desc: 'React/Next.js组件开发，shadcn/ui组件库集成，页面布局设计',
              },
              {
                icon: Cpu,
                title: '后端开发工程师',
                desc: 'API设计与开发，数据库架构设计，Prisma ORM集成',
              },
              {
                icon: FileCode,
                title: '全栈开发工程师',
                desc: '完整功能开发，前后端集成，测试编写，质量保证',
              },
            ].map((user, index) => (
              <div key={index} className="relative group">
                <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative rounded-xl bg-card/70 dark:bg-[#191f31]/80 backdrop-blur-xl border border-border/50 dark:border-[#3e4850]/60 p-8 text-center transition-all duration-300 group-hover:border-primary/50">
                  <div className="w-16 h-16 bg-muted/50 dark:bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-border/50 dark:border-primary/30">
                    <user.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {user.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {user.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-100 animate-border-flow" />
            <div className="relative rounded-xl bg-primary/10 dark:bg-primary/5 backdrop-blur-xl border border-primary/30 p-8 sm:p-12 overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-32 bg-gradient-to-b from-primary/10 to-transparent blur-2xl" />
              <div className="relative text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                  准备好提升开发效率了吗？
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  立即开始使用{PROJECT_NAME}，体验AI带来的开发效率革命
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg shadow-xl border-2 border-primary"
                    onClick={handleStartUse}
                  >
                    免费开始使用
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Link href="/api-docs">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-2 border-primary/50 text-primary hover:bg-primary/10 hover:border-primary px-8 py-6 text-lg backdrop-blur-sm"
                    >
                      API文档
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background/80 backdrop-blur-xl text-muted-foreground py-12 px-4 sm:px-6 lg:px-8 border-t border-border/50 dark:border-[#3e4850]/60 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-brand-600 dark:bg-[#89ceff] rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white dark:text-[#003751]" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary via-blue-400 to-primary dark:from-[#89ceff] dark:via-[#89ceff] dark:to-[#7bd0ff] bg-clip-text text-transparent dark:font-headline">
                  {PROJECT_NAME}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI驱动的智能编码助手平台
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">核心命令</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#features"
                    className="hover:text-primary transition-colors"
                  >
                    /az-init
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="hover:text-primary transition-colors"
                  >
                    /az-coding
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="hover:text-primary transition-colors"
                  >
                    /bug
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="hover:text-primary transition-colors"
                  >
                    /require
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">开发流程</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#how-it-works"
                    className="hover:text-primary transition-colors"
                  >
                    工作流程
                  </a>
                </li>
                <li>
                  <a
                    href="#benefits"
                    className="hover:text-primary transition-colors"
                  >
                    产品优势
                  </a>
                </li>
                <li>
                  <Link
                    href="/api-docs"
                    className="hover:text-primary transition-colors"
                  >
                    API文档
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">专家Agent</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <span className="text-muted-foreground">frontend-expert</span>
                </li>
                <li>
                  <span className="text-muted-foreground">backend-expert</span>
                </li>
                <li>
                  <span className="text-muted-foreground">test-expert</span>
                </li>
                <li>
                  <span className="text-muted-foreground">qa-expert</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border text-sm text-muted-foreground text-center">
            <p>&copy; 2026 {PROJECT_NAME}. 保留所有权利.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
