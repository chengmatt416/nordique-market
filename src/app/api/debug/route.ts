import { NextResponse } from 'next/server';
import { isFirebaseConfigured } from '@/lib/firebase/admin';

export async function GET() {
  const { ok, missing } = isFirebaseConfigured();
  const rawKey = process.env.FIREBASE_PRIVATE_KEY || '';

  const vars = {
    NEXT_PUBLIC_FIREBASE_API_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: {
      set: !!rawKey,
      length: rawKey.length,
      startsWith: rawKey.startsWith('-----BEGIN PRIVATE KEY-----'),
      endsWith: rawKey.endsWith('-----END PRIVATE KEY-----'),
      hasNewlines: rawKey.includes('\n'),
      hasLiteralN: rawKey.includes('\\n'),
      lineCount: rawKey.split('\n').length,
      preview: rawKey.substring(0, 40) + '...',
    },
    ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
    PRODUCT_ENCRYPT_KEY: !!process.env.PRODUCT_ENCRYPT_KEY,
    isFirebaseConfigured: { ok, missing },
  };

  // Try to actually initialize Firebase Admin
  let initResult: { success: boolean; error?: string } = { success: false };
  if (ok) {
    try {
      const { getFirebaseAdminApp } = await import('@/lib/firebase/admin');
      getFirebaseAdminApp();
      initResult = { success: true };
    } catch (e: unknown) {
      initResult = { success: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  return NextResponse.json({
    message: 'Firebase Admin SDK environment check',
    vars,
    initResult,
    hint: ok
      ? `All env vars present (${rawKey.length} chars). Check initResult above for actual SDK error.`
      : 'Missing: ' + missing.join(', '),
  });
}
