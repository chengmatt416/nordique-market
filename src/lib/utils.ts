import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  if (typeof price !== 'number' || isNaN(price)) return 'NT$0';
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(date: Date | string | undefined | null): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

export function formatRelativeTime(date: Date | string | undefined | null): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 30) return formatDate(d);
  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小時前`;
  if (minutes > 0) return `${minutes}分鐘前`;
  return '剛剛';
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function getImageUrl(path: string | null): string {
  if (!path) return '/placeholder.png';
  if (path.startsWith('http')) return path;
  return `https://picsum.photos/seed/${path}/400/400`;
}

export function productImageUrl(product: { images?: string[]; image?: string; id?: string }, size = 400): string {
  if (product.images?.length && product.images[0]) return product.images[0];
  if (product.image) return product.image;
  return `https://picsum.photos/seed/${product.id || 'default'}/${size}/${size}`;
}

export function calculateDiscount(original: number, current: number): number {
  if (!original || !current || isNaN(original) || isNaN(current) || original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}