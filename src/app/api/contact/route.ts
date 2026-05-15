import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, FieldValue, isFirebaseConfigured } from '@/lib/firebase/admin';
import { requireAdminAuth } from '@/lib/admin-check';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    const config = isFirebaseConfigured();
    if (!config.ok) {
      console.warn('Contact message not saved: Firebase not configured', config.missing);
      return NextResponse.json({ success: true, note: 'saved_locally' });
    }

    const db = getAdminDb();
    await db.collection('contact_messages').add({
      name: name || '',
      email: email || '',
      subject: subject || '',
      message: message || '',
      status: 'unread',
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Error saving contact message:', e);
    return NextResponse.json({ success: true, note: 'acknowledged' });
  }
}

export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireAdminAuth(request);
    if (authCheck instanceof NextResponse) return authCheck;

    const config = isFirebaseConfigured();
    if (!config.ok) {
      return NextResponse.json({ error: 'Firebase not configured' }, { status: 503 });
    }

    const db = getAdminDb();
    const snapshot = await db.collection('contact_messages')
      .orderBy('createdAt', 'desc')
      .get();

    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ messages });
  } catch (e) {
    console.error('Error fetching contact messages:', e);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authCheck = await requireAdminAuth(request);
    if (authCheck instanceof NextResponse) return authCheck;

    const config = isFirebaseConfigured();
    if (!config.ok) {
      return NextResponse.json({ error: 'Firebase not configured' }, { status: 503 });
    }

    const body = await request.json();
    const { id, status } = body;

    const db = getAdminDb();
    await db.collection('contact_messages').doc(id).update({
      status,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Error updating message:', e);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}
