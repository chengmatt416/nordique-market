import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, FieldValue, isFirebaseConfigured } from '@/lib/firebase/admin';
import { obfuscate, obfuscatePrice } from '@/lib/crypto';

const FIREBASE_NOT_CONFIGURED = NextResponse.json(
  { error: 'Firebase is not configured. Please set up Firebase Admin credentials.' },
  { status: 503 }
);

export async function GET(request: NextRequest) {
  try {
    if (!isFirebaseConfigured()) return FIREBASE_NOT_CONFIGURED;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const category = searchParams.get('category');
    const merchantId = searchParams.get('merchantId');
    const status = searchParams.get('status');

    const db = getAdminDb();
    let query: FirebaseFirestore.Query = db.collection('products');

    if (id) {
      const doc = await db.collection('products').doc(id).get();
      if (!doc.exists) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      const p = { id: doc.id, ...doc.data() } as Record<string, unknown>;
      return NextResponse.json({
        product: {
          ...p,
          _e: true,
          price: obfuscatePrice(Number(p.price) || 0, String(p.id)),
          originalPrice: p.originalPrice ? obfuscatePrice(Number(p.originalPrice), String(p.id)) : undefined,
          name: obfuscate(String(p.name || ''), String(p.id)),
          description: obfuscate(String(p.description || ''), String(p.id)),
        },
      });
    }

    if (category) {
      query = query.where('category', '==', category);
    }
    if (merchantId) {
      query = query.where('merchantId', '==', merchantId);
    }
    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.get();
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const encrypted = products.map((p: Record<string, unknown>) => ({
      ...p,
      _e: true,
      price: obfuscatePrice(Number(p.price) || 0, String(p.id)),
      originalPrice: p.originalPrice ? obfuscatePrice(Number(p.originalPrice), String(p.id)) : undefined,
      name: obfuscate(String(p.name || ''), String(p.id)),
      description: obfuscate(String(p.description || ''), String(p.id)),
    }));

    return NextResponse.json({ products: encrypted });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isFirebaseConfigured()) return FIREBASE_NOT_CONFIGURED;

    const body = await request.json();
    const db = getAdminDb();
    const productRef = db.collection('products').doc();
    await productRef.set({
      ...body,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ id: productRef.id, success: true });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!isFirebaseConfigured()) return FIREBASE_NOT_CONFIGURED;

    const body = await request.json();
    const { id, ...data } = body;

    const db = getAdminDb();
    await db.collection('products').doc(id).update({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isFirebaseConfigured()) return FIREBASE_NOT_CONFIGURED;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const db = getAdminDb();
    await db.collection('products').doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}