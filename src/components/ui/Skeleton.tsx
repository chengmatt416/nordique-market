import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded-[var(--radius-sm)]',
        variant === 'text' && 'h-4 rounded',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-[var(--radius-md)]',
        className
      )}
      style={{ width, height }}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-[var(--surface)] rounded-[var(--radius-md)] border border-[var(--border)] overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" variant="text" />
        <Skeleton className="h-4 w-1/2" variant="text" />
        <div className="flex items-center gap-2 pt-2">
          <Skeleton className="h-5 w-16" variant="text" />
          <Skeleton className="h-4 w-12" variant="text" />
        </div>
      </div>
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="bg-[var(--surface)] rounded-[var(--radius-md)] border border-[var(--border)] p-4 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-24" variant="text" />
        <Skeleton className="h-5 w-16" variant="text" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="w-16 h-16" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-full" variant="text" />
          <Skeleton className="h-4 w-2/3" variant="text" />
        </div>
      </div>
    </div>
  );
}