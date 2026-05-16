'use client';

import { motion } from 'framer-motion';
import { Home, Search, ShoppingCart, FileText, User } from 'lucide-react';
import Link from 'next/link';
import { ClientNav } from './ClientNav';
import { useAuth } from '@/lib/auth-context';

const bottomNavItems = [
  { href: '/client/home', icon: Home, label: '首頁' },
  { href: '/search', icon: Search, label: '搜尋' },
  { href: '/client/cart', icon: ShoppingCart, label: '購物車' },
  { href: '/client/orders', icon: FileText, label: '訂單' },
  { href: '/client/profile', icon: User, label: '我的' },
];

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientNav />

      <main className="pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-5 h-16">
          {bottomNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}