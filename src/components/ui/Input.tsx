'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-[var(--text-primary)]">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white',
              'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
              'transition-all duration-150',
              'focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20',
              'disabled:opacity-50 disabled:bg-[var(--secondary)]',
              icon && 'pl-10',
              error && 'border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error)]/20',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <span className="text-sm text-[var(--error)]">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };