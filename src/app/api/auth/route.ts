import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb, FieldValue, isFirebaseConfigured } from '@/lib/firebase/admin';
import { isAdminEmail } from '@/lib/admin-check';

const FIREBASE_NOT_CONFIGURED = NextResponse.json(
  { error: 'Firebase is not configured. Please set up Firebase Admin credentials.' },
  { status: 503 }
);

export async function POST(request: NextRequest) {
  try {
    if (!isFirebaseConfigured()) return FIREBASE_NOT_CONFIGURED;

    const body = await request.json();
    const { idToken, role, name, photoURL } = body;

    const auth = getAdminAuth();
    const db = getAdminDb();
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    const finalRole = role || 'customer';

    if (finalRole === 'admin' && !isAdminEmail(email)) {
      return NextResponse.json({ error: 'Unauthorized: admin access restricted' }, { status: 403 });
    }

    await auth.setCustomUserClaims(uid, { role: finalRole });

    await db.collection('users').doc(uid).set({
      uid,
      email: decodedToken.email,
      name: name || decodedToken.name || '',
      photoURL: photoURL || decodedToken.picture || '',
      role: finalRole,
      onboardingCompleted: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    return NextResponse.json({
      success: true,
      uid,
      role: finalRole,
    });
  } catch (error) {
    console.error('Error in auth:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!isFirebaseConfigured()) return FIREBASE_NOT_CONFIGURED;

    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const auth = getAdminAuth();
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(idToken);

    return NextResponse.json({
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: (decodedToken as { role?: string }).role || 'customer',
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}