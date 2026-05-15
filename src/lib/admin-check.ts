import { NextResponse } from 'next/server';
import { getAdminAuth, isFirebaseConfigured } from '@/lib/firebase/admin';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'pinyen.no2fa@gmail.com';

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

export function getAdminEmail(): string {
  return ADMIN_EMAIL;
}

const UNAUTHORIZED = NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

export async function requireAdminAuth(request: Request): Promise<NextResponse | { email: string }> {
  if (!isFirebaseConfigured().ok) {
    return NextResponse.json({ error: 'Firebase not configured' }, { status: 503 });
  }

  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return UNAUTHORIZED;
  }

  try {
    const auth = getAdminAuth();
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(idToken);
    const email = decodedToken.email;

    if (!isAdminEmail(email)) {
      return UNAUTHORIZED;
    }

    return { email: email || '' };
  } catch {
    return UNAUTHORIZED;
  }
}
