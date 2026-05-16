'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';

export default function SignOutPage() {
  const { signOut, user } = useAuth();
  const router = useRouter();
  const [done, setDone] = useState(false);

  useEffect(() => {
    async function doSignOut() {
      await signOut();
      setDone(true);
      setTimeout(() => router.push('/'), 500);
    }
    if (!done) doSignOut();
  }, [signOut, done, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">{done ? '已登出，正在返回首頁...' : '登出中...'}</p>
      </div>
    </div>
  );
}
