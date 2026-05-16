'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/config';
import { Button } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Suspense } from 'react';

function SignInContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME || 'AURA';
  const redirect = searchParams.get('redirect') || '';

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      let auth;
      try {
        auth = getFirebaseAuth();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Firebase SDK not available';
        setError(msg);
        showToast(`Firebase 設定錯誤: ${msg}`, 'error');
        setLoading(false);
        return;
      }

      const provider = new GoogleAuthProvider();
      let result;
      try {
        result = await signInWithPopup(auth, provider);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Google sign-in failed';
        if (msg.includes('popup-closed-by-user') || msg.includes('cancelled')) {
          setLoading(false);
          return;
        }
        if (msg.includes('blocked')) {
          setError('彈出視窗被阻擋，請允許此網站開啟彈出視窗');
          showToast('請允許彈出視窗以使用 Google 登入', 'error');
          setLoading(false);
          return;
        }
        setError(msg);
        showToast(`登入失敗: ${msg}`, 'error');
        setLoading(false);
        return;
      }

      const user = result.user;
      let idToken: string;
      try {
        idToken = await user.getIdToken();
      } catch {
        setError('無法取得驗證令牌');
        showToast('無法取得驗證令牌', 'error');
        setLoading(false);
        return;
      }

      let data;
      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idToken,
            role: '',
            name: user.displayName || '',
            photoURL: user.photoURL || '',
          }),
        });
        data = await res.json();
        if (!res.ok) {
          throw new Error(data.detail || data.error || `HTTP ${res.status}`);
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : '伺服器錯誤';
        setError(msg);
        showToast(`登入失敗: ${msg}`, 'error');
        setLoading(false);
        return;
      }

      showToast('登入成功！', 'success');
      const role = data.role || 'customer';

      if (redirect) {
        router.push(redirect);
      } else if (data.existing) {
        switch (role) {
          case 'customer': router.push('/client/home'); break;
          case 'merchant': router.push('/merchant/dashboard'); break;
          case 'admin': router.push('/admin/dashboard'); break;
          default: router.push('/client/home');
        }
      } else {
        switch (role) {
          case 'merchant': router.push('/onboarding/merchant'); break;
          case 'admin': router.push('/onboarding/admin'); break;
          default: router.push('/onboarding/customer');
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '未知錯誤';
      setError(msg);
      showToast(`登入失敗: ${msg}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-600 to-pink-400 flex items-center justify-center"
            >
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">歡迎回來</h1>
            <p className="text-gray-500 text-sm">登入您的 {BRAND} 帳戶</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700 break-all">{error}</div>
            </motion.div>
          )}

          <Button
            variant="outline"
            size="lg"
            className="w-full mb-4 relative"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                登入中...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                使用 Google 帳戶登入
              </span>
            )}
          </Button>

          <p className="text-xs text-gray-400 text-center">
            登入即表示您同意 {BRAND} 的服務條款與隱私權政策
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">載入中...</div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
