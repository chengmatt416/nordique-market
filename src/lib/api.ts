import { deobfuscate, deobfuscatePrice, deobfuscateProduct, deobfuscateProducts } from './crypto';

// API client — all data goes through Firebase API routes
// Product data is obfuscated in transit and deobfuscated here
// No mock data anywhere. If Firebase isn't configured, pages show setup instructions.

export async function fetchJSON(url: string, options: RequestInit = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Network error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Products ──────────────────────────────────────────

export function fetchProducts(params?: Record<string, string>) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return fetchJSON(`/api/products${qs}`).then((data: any) => ({
    ...data,
    products: deobfuscateProducts(data.products || []),
    product: data.product ? deobfuscateProduct(data.product) : undefined,
  }));
}

export function createProduct(data: Record<string, unknown>) {
  return fetchJSON('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function updateProduct(data: Record<string, unknown>) {
  return fetchJSON('/api/products', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function deleteProduct(id: string) {
  return fetch('/api/products?id=' + id, { method: 'DELETE' });
}

// ── Orders ────────────────────────────────────────────

export function fetchOrders(params?: Record<string, string>) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return fetchJSON(`/api/orders${qs}`);
}

export function createOrder(data: Record<string, unknown>) {
  return fetchJSON('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function updateOrder(data: Record<string, unknown>) {
  return fetchJSON('/api/orders', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

// ── Users ─────────────────────────────────────────────

export function fetchUsers() {
  return fetchJSON('/api/users');
}

export function updateUser(data: Record<string, unknown>) {
  return fetchJSON('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

// ── Auth ──────────────────────────────────────────────

export function verifyToken(token: string) {
  return fetchJSON('/api/auth', {
    headers: { Authorization: 'Bearer ' + token },
  });
}

export function registerUser(data: { idToken: string; role: string; name: string; photoURL: string }) {
  return fetchJSON('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}