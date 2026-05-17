import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, FieldValue, isFirebaseConfigured } from '@/lib/firebase/admin';
import { requireAdminAuth } from '@/lib/admin-check';

export async function GET() {
  try {
    if (!isFirebaseConfigured().ok) return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });

    const db = getAdminDb();
    const snapshot = await db.collection('merchants').orderBy('createdAt', 'desc').get();
    const merchants = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ merchants });
  } catch (error) {
    console.error('Error fetching merchants:', error);
    return NextResponse.json({ error: 'Failed to fetch merchants' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authCheck = await requireAdminAuth(request);
    if (authCheck instanceof NextResponse) return authCheck;

    if (!isFirebaseConfigured().ok) return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });

    const body = await request.json();
    const { id, status, rejectReason } = body;
    const db = getAdminDb();
    const updateData: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };

    if (status) updateData.status = status;
    if (rejectReason !== undefined) updateData.rejectReason = rejectReason;

    await db.collection('merchants').doc(id).update(updateData);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating merchant:', error);
    return NextResponse.json({ error: 'Failed to update merchant' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authCheck = await requireAdminAuth(request);
    if (authCheck instanceof NextResponse) return authCheck;

    if (!isFirebaseConfigured().ok) return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const deleteUser = searchParams.get('deleteUser') === 'true';

    if (!id) return NextResponse.json({ error: 'Merchant ID required' }, { status: 400 });

    const db = getAdminDb();
    await db.collection('merchants').doc(id).delete();
    if (deleteUser) {
      try {
        const { getAdminAuth } = await import('@/lib/firebase/admin');
        await getAdminAuth().deleteUser(id);
      } catch (e) {
        console.warn('Could not delete auth user:', e);
      }
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting merchant:', error);
    return NextResponse.json({ error: 'Failed to delete merchant' }, { status: 500 });
  }
}
