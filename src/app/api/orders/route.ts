import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, FieldValue, isFirebaseConfigured } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    if (!isFirebaseConfigured().ok) return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const merchantId = searchParams.get('merchantId');
    const status = searchParams.get('status');

    const db = getAdminDb();
    let query: FirebaseFirestore.Query = db.collection('orders');

    if (customerId) {
      query = query.where('customerId', '==', customerId);
    }
    if (merchantId) {
      query = query.where('merchantId', '==', merchantId);
    }
    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isFirebaseConfigured().ok) return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });

    const body = await request.json();
    const db = getAdminDb();
    const orderRef = db.collection('orders').doc();

    await orderRef.set({
      ...body,
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ id: orderRef.id, success: true });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!isFirebaseConfigured().ok) return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });

    const body = await request.json();
    const { id, status, trackingNumber, ...data } = body;

    const db = getAdminDb();
    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (status) updateData.status = status;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;

    await db.collection('orders').doc(id).update(updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}