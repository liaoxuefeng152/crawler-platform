'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
} from 'lucide-react';
import { PROJECT_NAME } from '@/lib/config/project';
import { useUserStore } from '@/stores/core/useUserStore';

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
    <div className="min-h-screen bg-gradient-to-b from-white to-primary/5">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                {PROJECT_NAME}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm text-gray-600 hover:text-primary transition-colors"
              >
                核心功能
              </a>
              <a
                href="#how-it-works"
                className="text-sm text-gray-600 hover:text-primary transition-colors"
              >
                工作流程
              </a>
              <a
                href="#benefits"
                className="text-sm text-gray-600 hover:text-primary transition-colors"
              >
                产品优势
              </a>
            </div>
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary/80"
                    >
                      进入系统
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
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
                      className="text-primary hover:text-primary/80"
                    >
                      登录
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
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
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
              <Sparkles className="w-3 h-3 mr-1" />
              AI驱动的智能编码助手平台
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {PROJECT_NAME}
              <span className="text-primary">效率提升 80%</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              基于Claude Code的智能AI编码助手，9阶段标准化开发流程，7位专家Agent协作，完整测试覆盖率保证，让AI助力您的开发之旅
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg gap-2 shadow-lg hover:shadow-xl transition-all"
                onClick={handleStartUse}
              >
                立即开始使用
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Link href="#features">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-lg border-primary/20 text-primary hover:bg-primary/5"
                >
                  了解更多
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-8 border-t border-gray-200">
              <div>
                <div className="text-3xl font-bold text-primary">1M+</div>
                <div className="text-sm text-gray-600 mt-1">代码生成量</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">50M+</div>
                <div className="text-sm text-gray-600 mt-1">Token消耗</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">80%</div>
                <div className="text-sm text-gray-600 mt-1">效率提升</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">9阶段</div>
                <div className="text-sm text-gray-600 mt-1">标准化流程</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary">核心功能</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              全流程智能化开发
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              从需求输入到代码交付，提供完整的AI辅助开发解决方案
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1: az-init */}
            <Card
              className="group hover:shadow-lg transition-all duration-300 border-primary/10 hover:border-primary/20 cursor-pointer"
              onClick={() => router.push('/dashboard')}
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                  <Terminal className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  /az-init
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  一键初始化开发环境，自动检查依赖安装、配置开发工具和插件
                </p>
                <div className="mt-4 flex items-center text-primary text-sm font-medium">
                  开始使用 <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>

            {/* Feature 2: az-coding */}
            <Card
              className="group hover:shadow-lg transition-all duration-300 border-primary/10 hover:border-primary/20 cursor-pointer"
              onClick={() => router.push('/dashboard')}
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                  <Workflow className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  /az-coding
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  9阶段标准化开发流程，从需求规划到安全审查，确保100%用户旅途闭环
                </p>
                <div className="mt-4 flex items-center text-primary text-sm font-medium">
                  查看流程 <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>

            {/* Feature 3: bug */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-primary/10 hover:border-primary/20 cursor-pointer">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                  <Bug className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  /bug
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  智能错误分析器，自动诊断问题根源，提供详细修复方案和代码建议
                </p>
                <div className="mt-4 flex items-center text-primary text-sm font-medium">
                  了解更多 <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>

            {/* Feature 4: require */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-primary/10 hover:border-primary/20 cursor-pointer">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                  <Bot className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  /require
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  需求协调指挥官，自动分析需求并安排对应专家Agent完成开发任务
                </p>
                <div className="mt-4 flex items-center text-primary text-sm font-medium">
                  了解更多 <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-white"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary">工作流程</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              简单四步，高效开发
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              输入需求后AI自动规划，7位专家协作开发，完整测试验证后交付
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  输入需求
                </h3>
                <p className="text-gray-600">
                  描述功能需求或问题，AI自动理解并分析业务场景
                </p>
              </div>
              <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-primary/20"></div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  AI智能规划
                </h3>
                <p className="text-gray-600">
                  自动拆解任务、定义API契约、规划开发序列和里程碑
                </p>
              </div>
              <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-primary/20"></div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  专家协作开发
                </h3>
                <p className="text-gray-600">
                  7位专家Agent协同工作，前端/后端/架构/测试/QA/安全各司其职
                </p>
              </div>
              <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-primary/20"></div>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-white">4</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                测试验证交付
              </h3>
              <p className="text-gray-600">
                完整测试覆盖率保证，构建验证、功能验证、安全审查全流程保障
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-primary/10 text-primary">
                产品优势
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                为什么选择{PROJECT_NAME}？
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      效率提升80%以上
                    </h3>
                    <p className="text-gray-600">
                      将传统开发周期大幅缩短，AI自动生成代码、智能分析错误，让您专注于更有价值的创造性工作
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      质量保证体系
                    </h3>
                    <p className="text-gray-600">
                      完整测试覆盖率保证，构建成功门槛验证，功能闭环检查，确保交付代码质量可靠
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      7位专家Agent协作
                    </h3>
                    <p className="text-gray-600">
                      前端专家、后端专家、架构专家、测试专家、QA专家、安全专家各司其职，协同完成复杂开发任务
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      标准化开发流程
                    </h3>
                    <p className="text-gray-600">
                      9阶段质量驱动开发流程：Plan、Clarify、Tasks、Dev、OpenAPI、Test、Verification、QA、Security Review
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-2xl transform rotate-3"></div>
              <Card className="relative bg-white border-0 shadow-2xl">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">
                        开发效率对比
                      </span>
                      <Badge className="bg-green-100 text-green-700">
                        提升80%
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-gray-600">
                            传统开发周期
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            5工作日
                          </span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gray-400 rounded-full"
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
                        <div className="h-3 bg-primary/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-1000"
                            style={{ width: '20%' }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          7位
                        </div>
                        <div className="text-xs text-gray-600 mt-1">专家Agent</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          9阶段
                        </div>
                        <div className="text-xs text-gray-600 mt-1">标准流程</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          100%
                        </div>
                        <div className="text-xs text-gray-600 mt-1">闭环保证</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Target Users Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-primary/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary">适用场景</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              为开发者量身打造
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              满足不同角色的开发需求，提升整体开发效率
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* User Type 1 */}
            <Card className="border-primary/10 hover:shadow-lg transition-all">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Code className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  前端开发工程师
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  React/Next.js组件开发，shadcn/ui组件库集成，页面布局设计，状态管理，响应式适配
                </p>
              </CardContent>
            </Card>

            {/* User Type 2 */}
            <Card className="border-primary/10 hover:shadow-lg transition-all">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Cpu className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  后端开发工程师
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  API设计与开发，数据库架构设计，Prisma ORM集成，数据验证，安全审查
                </p>
              </CardContent>
            </Card>

            {/* User Type 3 */}
            <Card className="border-primary/10 hover:shadow-lg transition-all">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileCode className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  全栈开发工程师
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  完整功能开发，前后端集成，测试编写，质量保证，端到端交付
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            准备好提升开发效率了吗？
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            立即开始使用{PROJECT_NAME}，体验AI带来的开发效率革命
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg shadow-xl"
              onClick={handleStartUse}
            >
              免费开始使用
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Link href="/api-docs">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm px-8 py-6 text-lg"
              >
                API文档
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">
                  {PROJECT_NAME}
                </span>
              </div>
              <p className="text-sm text-gray-400">
                AI驱动的智能编码助手平台
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">核心命令</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    /az-init
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    /az-coding
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    /bug
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    /require
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">开发流程</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#how-it-works"
                    className="hover:text-white transition-colors"
                  >
                    工作流程
                  </a>
                </li>
                <li>
                  <a
                    href="#benefits"
                    className="hover:text-white transition-colors"
                  >
                    产品优势
                  </a>
                </li>
                <li>
                  <Link
                    href="/api-docs"
                    className="hover:text-white transition-colors"
                  >
                    API文档
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">专家Agent</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <span className="text-gray-400">frontend-expert</span>
                </li>
                <li>
                  <span className="text-gray-400">backend-expert</span>
                </li>
                <li>
                  <span className="text-gray-400">test-expert</span>
                </li>
                <li>
                  <span className="text-gray-400">qa-expert</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 text-sm text-gray-400 text-center">
            <p>&copy; 2026 {PROJECT_NAME}. 保留所有权利.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}