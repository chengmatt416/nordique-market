'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Auth } from 'firebase/auth';

type UserRole = 'customer' | 'merchant' | 'admin';

interface AuthState {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  initialized: boolean;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  role: null,
  loading: true,
  initialized: false,
  signOut: async () => {},
  refreshRole: async () => {},
});

let firebaseAuthInstance: Auth | null = null;

async function getFirebaseAuth(): Promise<Auth | null> {
  if (firebaseAuthInstance) return firebaseAuthInstance;
  try {
    const { getAuth, onAuthStateChanged: _ } = await import('firebase/auth');
    const { getFirebaseApp } = await import('@/lib/firebase/config');
    const app = getFirebaseApp();
    firebaseAuthInstance = getAuth(app);
    return firebaseAuthInstance;
  } catch {
    return null;
  }
}

async function fetchRole(idToken: string): Promise<UserRole | null> {
  try {
    const res = await fetch('/api/auth', {
      headers: { Authorization: `Bearer ${idToken}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.role as UserRole) || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    async function init() {
      const auth = await getFirebaseAuth();
      if (!auth) {
        setLoading(false);
        setInitialized(true);
        return;
      }

      unsubscribe = auth.onAuthStateChanged(async (fbUser) => {
        setUser(fbUser);
        if (fbUser) {
          try {
            const token = await fbUser.getIdToken();
            const r = await fetchRole(token);
            setRole(r);
          } catch {
            setRole(null);
          }
        } else {
          setRole(null);
        }
        setLoading(false);
        setInitialized(true);
      });
    }

    init();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    const auth = await getFirebaseAuth();
    if (auth) {
      await auth.signOut();
    }
    setUser(null);
    setRole(null);
  }, []);

  const refreshRole = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken(true);
      const r = await fetchRole(token);
      setRole(r);
    } catch {}
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, role, loading, initialized, signOut, refreshRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
