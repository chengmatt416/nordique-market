import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from '@/lib/firebase/admin';
import { getAdminDb, isFirebaseConfigured } from '@/lib/firebase/admin';
import { isAdminEmail } from '@/lib/admin-check';
import { verifyToken } from '@/lib/auth-verify';

async function getUserDb() {
  if (isFirebaseConfigured().ok) {
    return getAdminDb();
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken, role, name, photoURL } = body;

    const decoded = await verifyToken(idToken);
    const uid = decoded.uid;
    const email = decoded.email || '';

    const db = await getUserDb();
    if (db) {
      const existingDoc = await db.collection('users').doc(uid).get();
      if (existingDoc.exists) {
        const existing = existingDoc.data()!;
        const correctedRole = isAdminEmail(email) ? 'admin' : (existing.role || 'customer');
        const updates: Record<string, unknown> = {
          name: name || existing.name || decoded.name || '',
          photoURL: photoURL || existing.photoURL || decoded.photoURL || '',
          lastLoginAt: FieldValue.serverTimestamp(),
        };
        if (correctedRole !== existing.role) {
          updates.role = correctedRole;
          try { await (await import('@/lib/firebase/admin')).getAdminAuth().setCustomUserClaims(uid, { role: correctedRole }); } catch {}
        }
        await db.collection('users').doc(uid).update(updates);
        return NextResponse.json({ success: true, uid, role: correctedRole, existing: true });
      }
    }

    const finalRole = isAdminEmail(email) ? 'admin' : (role || 'customer');
    if (db) {
      try {
        const { getAdminAuth } = await import('@/lib/firebase/admin');
        await getAdminAuth().setCustomUserClaims(uid, { role: finalRole });
      } catch {}
      await db.collection('users').doc(uid).set({
        uid, email,
        name: name || decoded.name || '',
        photoURL: photoURL || decoded.photoURL || '',
        role: finalRole,
        onboardingCompleted: false,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    return NextResponse.json({ success: true, uid, role: finalRole, existing: false });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[Auth POST]', msg);
    return NextResponse.json({ error: 'Login failed', detail: msg }, { status: 401 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await verifyToken(idToken);

    let role = 'customer';
    const db = await getUserDb();
    if (db) {
      try {
        const doc = await db.collection('users').doc(decoded.uid).get();
        if (doc.exists) role = doc.data()?.role || 'customer';
      } catch {}
    }

    return NextResponse.json({ uid: decoded.uid, email: decoded.email, role });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[Auth GET]', msg);
    return NextResponse.json({ error: 'Invalid token', detail: msg }, { status: 401 });
  }
}
