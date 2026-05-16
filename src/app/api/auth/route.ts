import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb, FieldValue, isFirebaseConfigured } from '@/lib/firebase/admin';
import { isAdminEmail } from '@/lib/admin-check';

export async function POST(request: NextRequest) {
  try {
    if (!isFirebaseConfigured().ok) {
      return NextResponse.json({ error: 'Firebase not configured' }, { status: 503 });
    }

    const body = await request.json();
    const { idToken, role, name, photoURL } = body;

    const auth = getAdminAuth();
    const db = getAdminDb();
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    const existingDoc = await db.collection('users').doc(uid).get();
    if (existingDoc.exists) {
      const existing = existingDoc.data()!;
      const correctedRole = isAdminEmail(email) ? 'admin' : existing.role;
      await db.collection('users').doc(uid).update({
        name: name || existing.name || decodedToken.name || '',
        photoURL: photoURL || existing.photoURL || decodedToken.picture || '',
        lastLoginAt: FieldValue.serverTimestamp(),
      });
      if (correctedRole !== existing.role) {
        await auth.setCustomUserClaims(uid, { role: correctedRole });
        await db.collection('users').doc(uid).update({ role: correctedRole });
      }
      return NextResponse.json({ success: true, uid, role: correctedRole, existing: true });
    }

    const finalRole = isAdminEmail(email) ? 'admin' : (role || 'customer');
    if (finalRole === 'admin' && !isAdminEmail(email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await auth.setCustomUserClaims(uid, { role: finalRole });
    await db.collection('users').doc(uid).set({
      uid, email: decodedToken.email,
      name: name || decodedToken.name || '',
      photoURL: photoURL || decodedToken.picture || '',
      role: finalRole,
      onboardingCompleted: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, uid, role: finalRole, existing: false });
  } catch (error) {
    console.error('POST /api/auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!isFirebaseConfigured().ok) {
      return NextResponse.json({ error: 'Firebase not configured' }, { status: 503 });
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const auth = getAdminAuth();
    const db = getAdminDb();
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userDoc = await db.collection('users').doc(uid).get();
    const role = userDoc.exists ? (userDoc.data()?.role || 'customer') : (decodedToken as { role?: string }).role || 'customer';

    return NextResponse.json({ uid, email: decodedToken.email, role });
  } catch (error) {
    console.error('Error verifying token:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
