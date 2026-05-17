export interface CartItemData {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: string;
  merchantId?: string;
  merchantName?: string;
}

const CART_KEY = 'aura_cart';

export function getCart(): CartItemData[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItemData[]) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {}
}

export function addToCart(item: CartItemData) {
  const cart = getCart();
  const existing = cart.find((i) => i.id === item.id);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }
  saveCart(cart);
  return cart;
}

export function removeFromCart(id: string) {
  const cart = getCart().filter((i) => i.id !== id);
  saveCart(cart);
  return cart;
}

export function updateQuantity(id: string, delta: number) {
  const cart = getCart().map((i) =>
    i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
  );
  saveCart(cart);
  return cart;
}

export function clearCart() {
  saveCart([]);
  return [];
}

export function getCartCount(): number {
  return getCart().reduce((s, i) => s + i.quantity, 0);
}
