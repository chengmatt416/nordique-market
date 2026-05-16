import { isFirebaseConfigured } from '@/lib/firebase/admin';

const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

async function fallbackVerify(idToken: string) {
  if (!API_KEY) throw new Error('NEXT_PUBLIC_FIREBASE_API_KEY not set');
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token verification failed: ${err}`);
  }
  const data = await res.json();
  if (!data.users?.length) throw new Error('No user found');
  return {
    uid: data.users[0].localId,
    email: data.users[0].email || '',
    name: data.users[0].displayName || '',
    photoURL: data.users[0].photoUrl || '',
  };
}

export async function verifyToken(idToken: string) {
  const { ok } = isFirebaseConfigured();
  if (ok) {
    try {
      const { getAdminAuth } = await import('@/lib/firebase/admin');
      const auth = getAdminAuth();
      const decoded = await auth.verifyIdToken(idToken);
      return {
        uid: decoded.uid,
        email: decoded.email || '',
        name: decoded.name || '',
        photoURL: decoded.picture || '',
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('[Auth] Admin SDK verifyIdToken failed, falling back to REST API');
      console.warn('[Auth] Admin SDK error:', msg);
      return fallbackVerify(idToken);
    }
  }
  return fallbackVerify(idToken);
}
