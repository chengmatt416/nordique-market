import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, isFirebaseConfigured } from '@/lib/firebase/admin';
import { requireAdminAuth } from '@/lib/admin-check';

const FIREBASE_NOT_CONFIGURED = NextResponse.json(
  { error: 'Firebase is not configured. Please set up Firebase Admin credentials.' },
  { status: 503 }
);

export async function GET() {
  try {
    if (!isFirebaseConfigured().ok) return FIREBASE_NOT_CONFIGURED;

    const auth = getAdminAuth();
    const users: { uid: string; email: string; displayName: string; photoURL: string; customClaims: { role?: string } }[] = [];
    const listUsersResult = await auth.listUsers(100);

    for (const user of listUsersResult.users) {
      users.push({
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        customClaims: user.customClaims || {},
      });
    }

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireAdminAuth(request);
    if (authCheck instanceof NextResponse) return authCheck;

    if (!isFirebaseConfigured().ok) return FIREBASE_NOT_CONFIGURED;

    const body = await request.json();
    const { uid, role } = body;

    const auth = getAdminAuth();
    await auth.setCustomUserClaims(uid, { role });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authCheck = await requireAdminAuth(request);
    if (authCheck instanceof NextResponse) return authCheck;

    if (!isFirebaseConfigured().ok) return FIREBASE_NOT_CONFIGURED;

    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ error: 'UID required' }, { status: 400 });
    }

    const auth = getAdminAuth();
    await auth.deleteUser(uid);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}