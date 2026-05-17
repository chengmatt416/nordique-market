import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt, sign, verify } from 'hono/jwt';
import { nanoid } from 'nanoid';
import { obfuscate, obfuscatePrice } from './utils/crypto';

type Env = {
  DB: D1Database;
  STORAGE: R2Bucket;
  KV: KVNamespace;
  JWT_SECRET: string;
  ADMIN_EMAIL: string;
  BRAND_NAME: string;
  CORS_ORIGIN: string;
};

const app = new Hono<{ Bindings: Env }>();

app.use('/*', cors({ origin: (origin, c) => c.env.CORS_ORIGIN || '*' }));

// ─── Helpers ────────────────────────────────────────────

function isAdminEmail(email: string, adminEmail: string): boolean {
  return email.toLowerCase() === adminEmail.toLowerCase();
}

async function requireAuth(c: any) {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    const payload = await verify(auth.slice(7), c.env.JWT_SECRET);
    return payload as { sub: string; email: string; role: string };
  } catch { return null; }
}

async function requireAdmin(c: any) {
  const user = await requireAuth(c);
  if (!user || user.role !== 'admin') return null;
  return user;
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}

// ─── Health ──────────────────────────────────────────────

app.get('/api/health', (c) => json({ status: 'ok', platform: 'cloudflare' }));

// ─── Auth ────────────────────────────────────────────────

app.post('/api/auth', async (c) => {
  try {
    const { idToken, role, name, photoURL } = await c.req.json();
    const { OAuth2Client } = await import('google-auth-library');
    const client = new OAuth2Client(c.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({ idToken, audience: c.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload) return json({ error: 'Invalid token' }, 401);

    const uid = payload.sub;
    const email = payload.email || '';
    const finalRole = isAdminEmail(email, c.env.ADMIN_EMAIL) ? 'admin' : (role || 'customer');

    const existing = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(uid).first();
    if (existing) {
      const correctedRole = isAdminEmail(email, c.env.ADMIN_EMAIL) ? 'admin' : (existing as any).role;
      await c.env.DB.prepare(
        'UPDATE users SET display_name = ?, photo_url = ?, role = ?, updated_at = datetime(\'now\') WHERE id = ?'
      ).bind(name || payload.name || '', photoURL || payload.picture || '', correctedRole, uid).run();
      const token = await sign({ sub: uid, email, role: correctedRole }, c.env.JWT_SECRET);
      return json({ success: true, uid, role: correctedRole, existing: true, token });
    }

    if (finalRole === 'merchant') {
      await c.env.DB.prepare(
        'INSERT INTO merchants (id, store_name, store_logo, status, owner_name, email) VALUES (?, ?, ?, \'pending\', ?, ?)'
      ).bind(uid, name || payload.name || '', photoURL || payload.picture || '', name || payload.name || '', email).run();
    }

    await c.env.DB.prepare(
      'INSERT INTO users (id, email, display_name, photo_url, role) VALUES (?, ?, ?, ?, ?)'
    ).bind(uid, email, name || payload.name || '', photoURL || payload.picture || '', finalRole).run();

    const token = await sign({ sub: uid, email, role: finalRole }, c.env.JWT_SECRET);
    return json({ success: true, uid, role: finalRole, existing: false, token });
  } catch (e: any) {
    return json({ error: 'Auth failed', detail: e.message }, 401);
  }
});

app.get('/api/auth/me', async (c) => {
  const user = await requireAuth(c);
  if (!user) return json({ error: 'Unauthorized' }, 401);
  const dbUser = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(user.sub).first();
  return json({ uid: user.sub, email: user.email, role: dbUser ? (dbUser as any).role : user.role });
});

// ─── Products ────────────────────────────────────────────

app.get('/api/products', async (c) => {
  const id = c.req.query('id');
  const merchantId = c.req.query('merchantId');
  const category = c.req.query('category');
  const status = c.req.query('status');

  let sql = 'SELECT * FROM products WHERE 1=1';
  const binds: any[] = [];
  if (id) { sql += ' AND id = ?'; binds.push(id); }
  if (merchantId) { sql += ' AND merchant_id = ?'; binds.push(merchantId); }
  if (category) { sql += ' AND category = ?'; binds.push(category); }
  if (status) { sql += ' AND status = ?'; binds.push(status); }
  sql += ' ORDER BY created_at DESC';

  const { results } = await c.env.DB.prepare(sql).bind(...binds).all();

  const encrypted = (results || []).map((p: any) => ({
    ...p, _e: true,
    price: obfuscatePrice(p.price || 0, p.id),
    original_price: p.original_price ? obfuscatePrice(p.original_price, p.id) : undefined,
    name: obfuscate(p.name || '', p.id),
    description: obfuscate(p.description || '', p.id),
  }));

  if (id && results?.length === 1) return json({ product: encrypted[0] });
  return json({ products: encrypted });
});

app.post('/api/products', async (c) => {
  const user = await requireAuth(c);
  if (!user) return json({ error: 'Unauthorized' }, 401);
  const body = await c.req.json();
  const productId = nanoid(12);
  await c.env.DB.prepare(
    `INSERT INTO products (id, name, description, price, original_price, images, category, merchant_id, stock, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(productId, body.name, body.description || '', body.price || 0, body.originalPrice || body.price || 0,
    JSON.stringify(body.images || []), body.category || '', body.merchantId || user.sub,
    body.stock || 0, body.status || 'pending').run();
  return json({ id: productId, success: true });
});

app.put('/api/products', async (c) => {
  const body = await c.req.json();
  const { id, ...data } = body;
  const sets: string[] = []; const binds: any[] = [];
  if (data.name !== undefined) { sets.push('name = ?'); binds.push(data.name); }
  if (data.price !== undefined) { sets.push('price = ?'); binds.push(data.price); }
  if (data.status !== undefined) { sets.push('status = ?'); binds.push(data.status); }
  if (data.stock !== undefined) { sets.push('stock = ?'); binds.push(data.stock); }
  if (data.description !== undefined) { sets.push('description = ?'); binds.push(data.description); }
  sets.push("updated_at = datetime('now')");
  binds.push(id);
  await c.env.DB.prepare(`UPDATE products SET ${sets.join(', ')} WHERE id = ?`).bind(...binds).run();
  return json({ success: true });
});

app.delete('/api/products', async (c) => {
  const id = c.req.query('id');
  if (!id) return json({ error: 'Product ID required' }, 400);
  await c.env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
  return json({ success: true });
});

app.get('/api/search', async (c) => {
  const q = c.req.query('q') || '';
  const category = c.req.query('category');
  const limit = Math.min(Number(c.req.query('limit')) || 20, 50);

  let sql = 'SELECT * FROM products WHERE status = \'active\'';
  const binds: any[] = [];
  if (q) { sql += ' AND (name LIKE ? OR description LIKE ?)'; binds.push(`%${q}%`, `%${q}%`); }
  if (category) { sql += ' AND category = ?'; binds.push(category); }
  sql += ' ORDER BY created_at DESC LIMIT ?';
  binds.push(limit);

  const { results } = await c.env.DB.prepare(sql).bind(...binds).all();
  const encrypted = (results || []).map((p: any) => ({
    ...p, _e: true,
    price: obfuscatePrice(p.price || 0, p.id),
    name: obfuscate(p.name || '', p.id),
  }));
  return json({ products: encrypted, total: encrypted.length });
});

// ─── Orders ──────────────────────────────────────────────

app.get('/api/orders', async (c) => {
  const customerId = c.req.query('customerId');
  const merchantId = c.req.query('merchantId');
  const status = c.req.query('status');

  let sql = 'SELECT * FROM orders WHERE 1=1';
  const binds: any[] = [];
  if (customerId) { sql += ' AND customer_id = ?'; binds.push(customerId); }
  if (merchantId) { sql += ' AND merchant_id = ?'; binds.push(merchantId); }
  if (status) { sql += ' AND status = ?'; binds.push(status); }
  sql += ' ORDER BY created_at DESC';

  const { results } = await c.env.DB.prepare(sql).bind(...binds).all();
  return json({ orders: results || [] });
});

app.post('/api/orders', async (c) => {
  const body = await c.req.json();
  const user = await requireAuth(c);
  const orderId = nanoid(12).toUpperCase();

  const merchantIds = Array.isArray(body.items) ? [...new Set(body.items.map((i: any) => i.merchantId).filter(Boolean))] : ['unknown'];
  const merchantId = merchantIds[0];

  await c.env.DB.prepare(
    `INSERT INTO orders (id, customer_id, merchant_id, items, total_amount, shipping_fee, status, payment_method, customer_name, customer_email)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(orderId, user?.sub || 'guest', merchantId, JSON.stringify(body.items || []),
    body.totalAmount || 0, body.shippingFee || 0, 'pending', body.paymentMethod || '',
    body.customerName || '', body.customerEmail || '').run();
  return json({ id: orderId, success: true });
});

app.put('/api/orders', async (c) => {
  const body = await c.req.json();
  const { id, status, trackingNumber, ...data } = body;
  const sets: string[] = []; const binds: any[] = [];
  if (status) { sets.push('status = ?'); binds.push(status); }
  if (trackingNumber) { sets.push('tracking_number = ?'); binds.push(trackingNumber); }
  sets.push("updated_at = datetime('now')");
  binds.push(id);
  await c.env.DB.prepare(`UPDATE orders SET ${sets.join(', ')} WHERE id = ?`).bind(...binds).run();
  return json({ success: true });
});

// ─── Merchants ──────────────────────────────────────────

app.get('/api/merchants', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM merchants ORDER BY created_at DESC').all();
  return json({ merchants: results || [] });
});

app.put('/api/merchants', async (c) => {
  const user = await requireAdmin(c);
  if (!user) return json({ error: 'Unauthorized' }, 403);
  const body = await c.req.json();
  const { id, status, rejectReason } = body;
  if (status) {
    await c.env.DB.prepare("UPDATE merchants SET status = ?, reject_reason = ?, updated_at = datetime('now') WHERE id = ?")
      .bind(status, rejectReason || '', id).run();
    if (status === 'approved') {
      await c.env.DB.prepare("UPDATE users SET role = 'merchant' WHERE id = ?").bind(id).run();
    }
  }
  return json({ success: true });
});

app.delete('/api/merchants', async (c) => {
  const user = await requireAdmin(c);
  if (!user) return json({ error: 'Unauthorized' }, 403);
  const id = c.req.query('id');
  if (!id) return json({ error: 'Merchant ID required' }, 400);
  await c.env.DB.prepare('DELETE FROM merchants WHERE id = ?').bind(id).run();
  await c.env.DB.prepare("UPDATE users SET role = 'customer' WHERE id = ? AND role = 'merchant'").bind(id).run();
  return json({ success: true });
});

// ─── Users ───────────────────────────────────────────────

app.get('/api/users', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT id, email, display_name, photo_url, role FROM users ORDER BY created_at DESC').all();
  return json({ users: results || [] });
});

app.post('/api/users', async (c) => {
  const user = await requireAdmin(c);
  if (!user) return json({ error: 'Unauthorized' }, 403);
  const { uid, role } = await c.req.json();
  await c.env.DB.prepare("UPDATE users SET role = ?, updated_at = datetime('now') WHERE id = ?").bind(role, uid).run();
  if (role === 'merchant') {
    const existing = await c.env.DB.prepare('SELECT * FROM merchants WHERE id = ?').bind(uid).first();
    if (!existing) {
      const u = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(uid).first() as any;
      await c.env.DB.prepare(
        'INSERT INTO merchants (id, store_name, status, owner_name, email) VALUES (?, ?, \'approved\', ?, ?)'
      ).bind(uid, u?.display_name || '', u?.display_name || '', u?.email || '').run();
    }
  }
  return json({ success: true });
});

app.delete('/api/users', async (c) => {
  const user = await requireAdmin(c);
  if (!user) return json({ error: 'Unauthorized' }, 403);
  const uid = c.req.query('uid');
  if (!uid) return json({ error: 'UID required' }, 400);
  await c.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(uid).run();
  await c.env.DB.prepare('DELETE FROM merchants WHERE id = ?').bind(uid).run();
  return json({ success: true });
});

// ─── Brand Settings ──────────────────────────────────────

app.get('/api/brand', async (c) => {
  const row = await c.env.DB.prepare('SELECT * FROM brand_settings WHERE id = \'default\'').first();
  if (!row) {
    return json({
      name: c.env.BRAND_NAME, tagline: '', description: '', contactEmail: '', contactPhone: '',
      contactAddress: '', facebookUrl: '', instagramUrl: '', heroTitle: '', heroSubtitle: '',
      footerTagline: '', helpContent: '[]', privacyContent: '[]', termsContent: '[]',
      contactExtraInfo: '', flashSale: JSON.stringify({ active: false }), merchantSignupEnabled: true,
      categories: JSON.stringify([
        { name: '時尚', icon: 'ShoppingBag' }, { name: '電子產品', icon: 'Zap' },
        { name: '家居', icon: 'Heart' }, { name: '美妝', icon: 'Sparkles' },
        { name: '運動', icon: 'Dumbbell' }, { name: '食品', icon: 'Apple' },
      ]),
    });
  }
  return json(row);
});

app.put('/api/brand', async (c) => {
  const user = await requireAdmin(c);
  if (!user) return json({ error: 'Unauthorized' }, 403);
  const body = await c.req.json();
  const existing = await c.env.DB.prepare('SELECT id FROM brand_settings WHERE id = \'default\'').first();
  const allowed = ['name', 'tagline', 'description', 'contactEmail', 'contactPhone', 'contactAddress',
    'facebookUrl', 'instagramUrl', 'heroTitle', 'heroSubtitle', 'footerTagline', 'helpContent',
    'privacyContent', 'termsContent', 'contactExtraInfo', 'flashSale', 'merchantSignupEnabled', 'categories'];
  const entries = allowed.filter(k => body[k] !== undefined);
  if (existing) {
    const sets = entries.map(k => `${toSnake(k)} = ?`).join(', ');
    const vals = entries.map(k => body[k]);
    await c.env.DB.prepare(`UPDATE brand_settings SET ${sets}, updated_at = datetime('now') WHERE id = 'default'`).bind(...vals).run();
  } else {
    const cols = entries.map(toSnake).join(', ');
    const placeholders = entries.map(() => '?').join(', ');
    await c.env.DB.prepare(`INSERT INTO brand_settings (id, ${cols}) VALUES ('default', ${placeholders})`).bind(...entries.map(k => body[k])).run();
  }
  return json({ success: true });
});

function toSnake(k: string) {
  return k.replace(/[A-Z]/g, c => '_' + c.toLowerCase());
}

// ─── Contact Messages ────────────────────────────────────

app.get('/api/contact', async (c) => {
  const user = await requireAdmin(c);
  if (!user) return json({ error: 'Unauthorized' }, 403);
  const { results } = await c.env.DB.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all();
  return json({ messages: results || [] });
});

app.post('/api/contact', async (c) => {
  const body = await c.req.json();
  const id = nanoid(12);
  await c.env.DB.prepare(
    'INSERT INTO contact_messages (id, name, email, subject, message) VALUES (?, ?, ?, ?, ?)'
  ).bind(id, body.name || '', body.email || '', body.subject || '', body.message || '').run();
  return json({ success: true });
});

app.put('/api/contact', async (c) => {
  const user = await requireAdmin(c);
  if (!user) return json({ error: 'Unauthorized' }, 403);
  const { id, status } = await c.req.json();
  await c.env.DB.prepare("UPDATE contact_messages SET status = ? WHERE id = ?").bind(status, id).run();
  return json({ success: true });
});

// ─── Upload ──────────────────────────────────────────────

app.post('/api/upload', async (c) => {
  const user = await requireAuth(c);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const formData = await c.req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return json({ error: 'No file' }, 400);

  const key = `uploads/${user.sub}/${Date.now()}_${file.name}`;
  await c.env.STORAGE.put(key, file, {
    httpMetadata: { contentType: file.type },
  });
  const url = `https://storage.your-domain.com/${key}`;
  return json({ url, key, success: true });
});

// ─── Debug ──────────────────────────────────────────────

app.get('/api/debug', async (c) => {
  const user = await requireAuth(c);
  return json({
    platform: 'cloudflare-workers',
    authenticated: !!user,
    user,
    db: await c.env.DB.prepare('SELECT COUNT(*) as count FROM users').first(),
  });
});

export default app;
