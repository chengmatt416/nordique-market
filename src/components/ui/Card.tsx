'use client';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'none' | 'md' | 'lg';
}

export function Card({ className, children, hover, padding = 'md', ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white border border-gray-200 rounded-xl',
        padding === 'none' ? '' : padding === 'lg' ? 'p-6' : 'p-4',
        hover && 'cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}