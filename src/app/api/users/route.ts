import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb, FieldValue, isFirebaseConfigured } from '@/lib/firebase/admin';
import { requireAdminAuth } from '@/lib/admin-check';

export async function GET() {
  try {
    if (!isFirebaseConfigured().ok) return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });

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

    if (!isFirebaseConfigured().ok) return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });

    const body = await request.json();
    const { uid, role } = body;

    const auth = getAdminAuth();
    const db = getAdminDb();
    await auth.setCustomUserClaims(uid, { role });
    try {
      await db.collection('users').doc(uid).update({ role, updatedAt: FieldValue.serverTimestamp() });
    } catch {}
    if (role === 'merchant') {
      try {
        const user = await auth.getUser(uid);
        await db.collection('merchants').doc(uid).set({
          storeName: user.displayName || '',
          storeLogo: user.photoURL || '',
          description: '',
          status: 'approved',
          ownerName: user.displayName || '',
          email: user.email || '',
          phone: '', address: '',
          joinDate: new Date().toISOString().split('T')[0],
          productsCount: 0, totalSales: 0, rating: 0,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
      } catch {}
    }

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

    if (!isFirebaseConfigured().ok) return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });

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