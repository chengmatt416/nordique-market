import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb, FieldValue } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken, role, name, photoURL } = body;

    const auth = getAdminAuth();
    const db = getAdminDb();
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    await auth.setCustomUserClaims(uid, { role: role || 'customer' });

    await db.collection('users').doc(uid).set({
      uid,
      email: decodedToken.email,
      name: name || decodedToken.name || '',
      photoURL: photoURL || decodedToken.picture || '',
      role: role || 'customer',
      onboardingCompleted: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    return NextResponse.json({
      success: true,
      uid,
      role: role || 'customer',
    });
  } catch (error) {
    console.error('Error in auth:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
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