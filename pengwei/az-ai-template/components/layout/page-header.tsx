import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'minimal' | 'card' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  badge?: string;
}

const variants = {
  default: {
    container:
      'p-6 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl',
    title: 'text-3xl font-semibold text-gray-900',
    description: 'text-base text-gray-600',
    icon: 'w-8 h-8 text-primary',
  },
  minimal: {
    container: 'pb-4 mb-6 border-b border-gray-200',
    title: 'text-2xl font-semibold text-gray-900',
    description: 'text-sm text-gray-600',
    icon: 'w-6 h-6 text-primary',
  },
  card: {
    container:
      'p-6 bg-gradient-to-br from-blue-50/90 via-blue-100/50 to-transparent backdrop-blur-sm border border-blue-200/50 rounded-xl shadow-sm',
    title: 'text-3xl font-semibold text-gray-900',
    description: 'text-base text-gray-600',
    icon: 'w-8 h-8 text-primary',
  },
  compact: {
    container:
      'px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg',
    title: 'text-xl font-semibold text-gray-900',
    description: 'text-sm text-gray-600 max-w-2xl',
    icon: 'w-5 h-5 text-primary',
  },
  inline: {
    container:
      'flex items-center justify-between px-0 py-2 border-b border-gray-200/80',
    title: 'text-lg font-semibold text-gray-900',
    description: 'text-sm text-gray-600 inline ml-2',
    icon: 'w-4 h-4 text-primary',
  },
  gradient: {
    container:
      'p-6 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl',
    title: 'text-3xl font-bold text-gray-900',
    description: 'text-base text-gray-700',
    icon: 'w-10 h-10 text-primary',
  },
};

const sizes = {
  sm: {
    container: 'p-4',
    title: 'text-xl font-semibold',
    description: 'text-sm',
    icon: 'w-5 h-5',
  },
  md: {
    container: 'p-6',
    title: 'text-2xl font-semibold',
    description: 'text-base',
    icon: 'w-6 h-6',
  },
  lg: {
    container: 'p-6',
    title: 'text-3xl font-semibold',
    description: 'text-base',
    icon: 'w-8 h-8',
  },
  xl: {
    container: 'p-8',
    title: 'text-4xl font-bold',
    description: 'text-lg',
    icon: 'w-10 h-10',
  },
};

export function PageHeader({
  title,
  description,
  icon: Icon,
  leftContent,
  rightContent,
  className = '',
  variant = 'card',
  size = 'lg',
  actions,
  breadcrumbs,
  badge,
}: PageHeaderProps) {
  const variantStyles = variants[variant];
  const sizeStyles = sizes[size];

  return (
    <div
      className={cn(variantStyles.container, sizeStyles.container, className)}
    >
      {/* Left Content (e.g., Return Button) - Above title */}
      {leftContent && (
        <div className="mb-4">
          {leftContent}
        </div>
      )}

      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span>/</span>}
              {item.href ? (
                <a
                  href={item.href}
                  className="hover:text-primary transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <span
                  className={
                    index === breadcrumbs.length - 1
                      ? 'text-gray-900 font-medium'
                      : ''
                  }
                >
                  {item.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {Icon && (
              <Icon className={cn(variantStyles.icon, sizeStyles.icon)} />
            )}
            <h1
              className={cn(
                variantStyles.title,
                sizeStyles.title,
                'flex items-center gap-3'
              )}
            >
              {title}
              {badge && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {badge}
                </span>
              )}
            </h1>
          </div>
          {description && (
            <p
              className={cn(
                variantStyles.description,
                sizeStyles.description,
                'max-w-3xl'
              )}
            >
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          {actions}
          {rightContent}
        </div>
      </div>
    </div>
  );
}
