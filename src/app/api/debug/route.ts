import { NextResponse } from 'next/server';

export async function GET() {
  const vars = {
    NEXT_PUBLIC_FIREBASE_API_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: {
      set: !!process.env.FIREBASE_PRIVATE_KEY,
      length: (process.env.FIREBASE_PRIVATE_KEY || '').length,
      startsWith: (process.env.FIREBASE_PRIVATE_KEY || '').startsWith('"') ? 'starts_with_quote' :
                  (process.env.FIREBASE_PRIVATE_KEY || '').startsWith('-----BEGIN') ? 'starts_with_pem' : 'unexpected',
      hasNewlines: (process.env.FIREBASE_PRIVATE_KEY || '').includes('\n'),
      hasLiteralN: (process.env.FIREBASE_PRIVATE_KEY || '').includes('\\n'),
    },
    ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
    PRODUCT_ENCRYPT_KEY: !!process.env.PRODUCT_ENCRYPT_KEY,
  };

  return NextResponse.json({
    message: 'Environment variable check (values masked for security)',
    vars,
    hint: 'Ensure you have redeployed after setting env vars. FIREBASE_PRIVATE_KEY should be a PEM string with \\n for line breaks, NOT actual newlines.',
  });
}
