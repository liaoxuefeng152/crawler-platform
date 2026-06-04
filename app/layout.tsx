import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import BrowserExtensionHandler from '@/components/browser-extension-handler';
import { ToastProvider } from '@/components/ui/toast';
import { DefaultUserInitializer } from '@/components/default-user-initializer';
import { GlobalErrorHandler } from '@/components/global-error-handler';
import { PROJECT_NAME, PROJECT_DESCRIPTION } from '@/lib/config/project';
import { ThemeProvider } from '@/components/providers/theme-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: PROJECT_DESCRIPTION,
  description: '体验我们前沿的AI编码助手，让AI助力您的开发之旅',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <ToastProvider>
            <GlobalErrorHandler />
            <DefaultUserInitializer />
            <BrowserExtensionHandler />
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
