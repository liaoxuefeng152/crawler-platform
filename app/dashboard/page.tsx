'use client';

import DashboardLayout from '@/components/layout/dashboard-layout';
import { PROJECT_NAME } from '@/lib/config/project';
import { Zap, Code2, TestTube2, BrainCircuit } from 'lucide-react';

// Feature icons mapping for visual variety
const featureIcons = [BrainCircuit, Zap, Code2, TestTube2];
const featureLabels = ['AI需求分析', '自动化开发', '代码审查', '自动化测试'];

export default function Dashboard() {
  return (
    <DashboardLayout>
      {/* Deep tech background with animated grid */}
      <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden">
        {/* Animated grid background */}
        <div className="absolute inset-0 tech-grid-bg opacity-[0.03] dark:opacity-[0.08]" />

        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="tech-particle particle-1" />
          <div className="tech-particle particle-2" />
          <div className="tech-particle particle-3" />
          <div className="tech-particle particle-4" />
        </div>

        {/* Main content container - positioned in upper third */}
        <div className="flex min-h-[calc(100vh-4rem)] items-start justify-center px-4 pt-[18vh]">
          {/* Content card with glassmorphism + animated border */}
          <div className="w-full max-w-3xl transition-all duration-700 ease-out opacity-100 translate-y-0">
            {/* Glassmorphism card with glowing border */}
            <div className="relative group">
              {/* Animated gradient border glow */}
              <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-border-flow" />

              {/* Scan line effect overlay */}
              <div className="absolute inset-0 rounded-xl overflow-hidden">
                <div className="scan-line-effect" />
              </div>

              {/* Card content - dark glass */}
              <div className="relative rounded-xl bg-card/70 dark:bg-[#191f31]/80 backdrop-blur-xl border border-border/50 dark:border-[#3e4850]/60 shadow-[0_8px_32px_rgba(7,13,31,0.35)] p-8 sm:p-12 overflow-hidden">
                {/* Inner glow effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-32 bg-gradient-to-b from-primary/5 to-transparent blur-2xl" />

                {/* Content area */}
                <div className="relative space-y-8 text-center">
                  {/* Brand title with gradient effect */}
                  <div className="space-y-4">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
                      {/* Gradient text for tech feel */}
                      <span className="bg-gradient-to-r from-primary via-blue-400 to-primary dark:from-[#dce1fb] dark:via-[#89ceff] dark:to-[#7bd0ff] bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_auto]">
                        {PROJECT_NAME}
                      </span>
                    </h1>

                    {/* Animated separator line */}
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-px w-12 sm:w-16 bg-gradient-to-r from-transparent via-primary/60 to-primary animate-pulse-slow" />
                      {/* Central glowing orb */}
                      <div className="relative">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <div className="absolute inset-0 w-2 h-2 rounded-full bg-primary/50 blur-sm animate-pulse" />
                      </div>
                      <div className="h-px w-12 sm:w-16 bg-gradient-to-l from-transparent via-primary/60 to-primary animate-pulse-slow" />
                    </div>

                    {/* Tech subtitle - monospace font */}
                    <p className="font-mono text-xs sm:text-sm text-muted-foreground/60 tracking-widest uppercase">
                      Neural Interface // v2.0
                    </p>
                  </div>

                  {/* Welcome message - high contrast */}
                  <div className="space-y-3">
                    <p className="text-xl sm:text-2xl font-semibold text-foreground">
                      欢迎使用智能AI编码助手
                    </p>
                    <p className="text-base sm:text-lg text-muted-foreground">
                      让我们开始今天的开发之旅
                    </p>
                  </div>

                  {/* Feature badges - tech pill design */}
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
                    {featureLabels.map((feature, index) => {
                      const Icon = featureIcons[index];
                      return (
                        <div
                          key={feature}
                          className="tech-badge group/badge relative overflow-hidden"
                        >
                          {/* Badge glow effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover/badge:opacity-100 transition-opacity duration-300" />

                          {/* Badge content */}
                          <div className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 dark:bg-[#151b2d] backdrop-blur-sm border border-border/50 dark:border-[#3e4850]/60 text-sm font-medium text-muted-foreground dark:text-[#bec8d2] transition-all duration-300 group-hover/badge:border-primary/50 group-hover/badge:text-primary">
                            {/* Animated icon */}
                            <Icon className="w-4 h-4 text-primary/70 group-hover/badge:text-primary transition-all duration-300 group-hover/badge:scale-110 group-hover/badge:rotate-12" />
                            <span>{feature}</span>

                            {/* Corner accent */}
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary/30 rounded-full blur-sm opacity-0 group-hover/badge:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      );
                    })}
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
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
