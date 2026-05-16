import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb, FieldValue, isFirebaseConfigured, firebaseNotConfiguredResponse } from '@/lib/firebase/admin';
import { isAdminEmail } from '@/lib/admin-check';

export async function POST(request: NextRequest) {
  try {
    if (!isFirebaseConfigured().ok) return firebaseNotConfiguredResponse();

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
      const updates: Record<string, unknown> = {
        name: name || existing.name || decodedToken.name || '',
        photoURL: photoURL || existing.photoURL || decodedToken.picture || '',
        lastLoginAt: FieldValue.serverTimestamp(),
      };
      if (correctedRole !== existing.role) {
        updates.role = correctedRole;
        await auth.setCustomUserClaims(uid, { role: correctedRole });
      }
      await db.collection('users').doc(uid).update(updates);
      return NextResponse.json({
        success: true,
        uid,
        role: correctedRole,
        existing: true,
      });
    }

    const finalRole = isAdminEmail(email) ? 'admin' : (role || 'customer');

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
    });

    return NextResponse.json({
      success: true,
      uid,
      role: finalRole,
      existing: false,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown error';
    console.error('POST /api/auth error:', detail);
    if (detail.includes('Credential implementation') || detail.includes('private key') || detail.includes('ServiceAccount')) {
      return NextResponse.json({ error: 'Firebase Admin SDK credentials are invalid. Check FIREBASE_PRIVATE_KEY in .env.local' }, { status: 500 });
    }
    if (detail.includes('Invalid Id Token')) {
      const clientProject = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'unknown';
      const adminProject = process.env.FIREBASE_PROJECT_ID || 'unknown';
      return NextResponse.json({
        error: 'Invalid authentication token',
        detail: `Client project: ${clientProject}, Admin project: ${adminProject}. Make sure both use the SAME Firebase project and the service account has Authentication enabled.`,
        serverError: detail,
      }, { status: 401 });
    }
    if (detail.includes('Token expired') || detail.includes('expired')) {
      return NextResponse.json({ error: 'Token expired. Please sign in again.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Authentication failed', detail: detail }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!isFirebaseConfigured().ok) return firebaseNotConfiguredResponse();

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

    return NextResponse.json({
      uid,
      email: decodedToken.email,
      role,
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}