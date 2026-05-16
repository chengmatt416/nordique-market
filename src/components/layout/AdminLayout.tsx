'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AdminSidebar } from './AdminSidebar';
import { useAuth } from '@/lib/auth-context';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminLayout({ children, className }: AdminLayoutProps) {
  const { user, role, loading, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initialized && !loading && (!user || role !== 'admin')) {
      router.push('/auth/signin');
    }
  }, [initialized, loading, user, role, router]);

  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
        <span className="ml-3 text-gray-600">驗證中...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">請先登入</h2>
          <p className="text-gray-600">您需要登入管理員帳戶</p>
        </div>
      </div>
    );
  }

  if (role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">存取被拒</h2>
          <p className="text-gray-600">您沒有權限存取管理後台</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className={cn('transition-all duration-300 ml-64 pt-16 min-h-screen', className)}>
        <div className="p-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
