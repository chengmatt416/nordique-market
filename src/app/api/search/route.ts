import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, isFirebaseConfigured } from '@/lib/firebase/admin';
import { obfuscate, obfuscatePrice } from '@/lib/crypto';

const FIREBASE_NOT_CONFIGURED = NextResponse.json(
  { error: 'Firebase is not configured. Please set up Firebase Admin credentials.' },
  { status: 503 }
);

function getRelevance(product: { name: string; description?: string }, query: string): number {
  const nameLower = product.name.toLowerCase();
  const descLower = (product.description || '').toLowerCase();
  const q = query.toLowerCase();
  let score = 0;

  if (nameLower === q) score += 100;
  if (nameLower.startsWith(q)) score += 50;
  if (nameLower.includes(q)) score += 30;

  if (descLower.includes(q)) score += 15;

  const qWords = q.split(/\s+/).filter(Boolean);
  for (const word of qWords) {
    if (nameLower.includes(word)) score += 10;
    if (descLower.includes(word)) score += 5;
  }

  return score;
}

export async function GET(request: NextRequest) {
  try {
    if (!isFirebaseConfigured()) return FIREBASE_NOT_CONFIGURED;

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || '';
    const category = searchParams.get('category')?.trim();
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 50);

    const db = getAdminDb();
    let query: FirebaseFirestore.Query = db.collection('products');

    if (q) {
      const endTerm = q.slice(0, -1) + String.fromCharCode(q.charCodeAt(q.length - 1) + 1);
      query = query
        .where('name', '>=', q)
        .where('name', '<', endTerm);
    } else {
      query = query.limit(limit);
    }

    if (category) {
      query = query.where('category', '==', category);
    }

    const snapshot = await query.get();

    let products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (q) {
      let descSnapshot: FirebaseFirestore.QuerySnapshot | null = null;
      try {
        descSnapshot = await db
          .collection('products')
          .where('description', '>=', q)
          .where('description', '<', q + '\uf8ff')
          .limit(limit)
          .get();
      } catch {
        // Description index may not exist, skip
      }

      const existingIds = new Set(products.map((p: { id: string }) => p.id));
      if (descSnapshot) {
        for (const doc of descSnapshot.docs) {
          if (!existingIds.has(doc.id)) {
            const data = { id: doc.id, ...doc.data() };
            products.push(data);
            existingIds.add(doc.id);
          }
        }
      }

      const nameWords = q.toLowerCase().split(/\s+/).filter(Boolean);
      if (nameWords.length > 0) {
        const filteredByName = products.filter((p: any) => {
          const name = (p.name || '').toLowerCase();
          return nameWords.some((word) => name.includes(word));
        });

        const filteredByDesc = products.filter((p: any) => {
          const name = (p.name || '').toLowerCase();
          const desc = (p.description || '').toLowerCase();
          return nameWords.some((word) => desc.includes(word) || name.includes(word));
        });

        const rankedSet = new Map<string, any>();
        for (const p of filteredByName) rankedSet.set(p.id, p);
        for (const p of filteredByDesc) {
          if (!rankedSet.has(p.id)) rankedSet.set(p.id, p);
        }

        products = Array.from(rankedSet.values());
        products.sort((a: any, b: any) => {
          return getRelevance(b, q) - getRelevance(a, q);
        });
      }
    }

    if (minPrice !== undefined && !isNaN(minPrice)) {
      products = products.filter((p: any) => Number(p.price || 0) >= minPrice);
    }
    if (maxPrice !== undefined && !isNaN(maxPrice)) {
      products = products.filter((p: any) => Number(p.price || 0) <= maxPrice);
    }

    const categories = new Map<string, number>();
    for (const p of products) {
      const cat = (p as any).category;
      if (cat) {
        categories.set(cat, (categories.get(cat) || 0) + 1);
      }
    }

    if (limit < products.length) {
      products = products.slice(0, limit);
    }

    const encrypted = products.map((p: Record<string, unknown>) => ({
      ...p,
      _e: true,
      price: obfuscatePrice(Number(p.price) || 0, String(p.id)),
      originalPrice: p.originalPrice ? obfuscatePrice(Number(p.originalPrice), String(p.id)) : undefined,
      name: obfuscate(String(p.name || ''), String(p.id)),
      description: obfuscate(String(p.description || ''), String(p.id)),
    }));

    return NextResponse.json({
      products: encrypted,
      total: products.length,
      categories: Array.from(categories.entries()).map(([name, count]) => ({
        name,
        count,
      })),
      query: q || undefined,
    });
  } catch (error) {
    console.error('Error in search:', error);
    return NextResponse.json({ error: 'Failed to perform search' }, { status: 500 });
  }
}