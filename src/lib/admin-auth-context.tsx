'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AdminAuth {
  token: string | null;
  email: string | null;
  loading: boolean;
  authorized: boolean;
}

const AdminAuthContext = createContext<AdminAuth>({
  token: null,
  email: null,
  loading: true,
  authorized: false,
});

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AdminAuth>({
    token: null,
    email: null,
    loading: true,
    authorized: false,
  });

  useEffect(() => {
    async function init() {
      try {
        const { getAuth, onAuthStateChanged } = await import('firebase/auth');
        const { getFirebaseAuth } = await import('@/lib/firebase/config');
        const fbAuth = getFirebaseAuth();

        onAuthStateChanged(fbAuth, async (user) => {
          if (!user) {
            setAuth({ token: null, email: null, loading: false, authorized: false });
            return;
          }

          const idToken = await user.getIdToken();
          const res = await fetch('/api/auth', {
            headers: { Authorization: `Bearer ${idToken}` },
          });

          if (res.ok) {
            const data = await res.json();
            setAuth({
              token: idToken,
              email: user.email,
              loading: false,
              authorized: data.role === 'admin',
            });
          } else {
            setAuth({ token: null, email: null, loading: false, authorized: false });
          }
        });
      } catch {
        setAuth({ token: null, email: null, loading: false, authorized: false });
      }
    }
    init();
  }, []);

  return (
    <AdminAuthContext.Provider value={auth}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
