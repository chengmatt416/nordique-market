"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AdminSidebar } from "./AdminSidebar";
import { Loader2, AlertTriangle } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminLayout({ children, className }: AdminLayoutProps) {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const { getAuth, onAuthStateChanged } = await import('firebase/auth');
        const { getFirebaseAuth } = await import('@/lib/firebase/config');
        const auth = getFirebaseAuth();

        onAuthStateChanged(auth, async (user) => {
          if (!user) {
            setAuthorized(false);
            router.push('/auth/signin');
            return;
          }

          const idToken = await user.getIdToken();
          const res = await fetch('/api/auth', {
            headers: { Authorization: `Bearer ${idToken}` },
          });

          if (res.ok) {
            const data = await res.json();
            if (data.role === 'admin') {
              setAuthorized(true);
            } else {
              setAuthorized(false);
              router.push('/client/home');
            }
          } else {
            setAuthorized(false);
            router.push('/auth/signin');
          }
        });
      } catch {
        setAuthorized(false);
      }
    }
    checkAuth();
  }, [router]);

  if (authorized === null) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          <span className="text-gray-600">驗證中...</span>
        </div>
      </div>
    );
  }

  if (!authorized) {
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

      <main
        className={cn(
          "transition-all duration-300 ml-64 pt-16 min-h-screen",
          className
        )}
      >
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}