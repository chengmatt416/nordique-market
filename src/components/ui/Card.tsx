'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLMotionProps<'div'> {
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingSizes = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const Card = ({
  className,
  hover = false,
  padding = 'md',
  children,
  ...props
}: CardProps) => {
  return (
    <motion.div
      className={cn(
        'bg-[var(--surface)] rounded-[var(--radius-md)] border border-[var(--border)] shadow-sm',
        paddingSizes[padding],
        hover && 'cursor-pointer',
        className
      )}
      whileHover={hover ? { y: -2, boxShadow: '0 8px 30px -12px rgba(0,0,0,0.15)' } : undefined}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

Card.displayName = 'Card';

export { Card };