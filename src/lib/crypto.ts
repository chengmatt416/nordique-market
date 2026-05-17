const KEY = 'aura-secret-key-2024';
const KEY_NUMS = KEY.split('').map(c => c.charCodeAt(0));

function mixSeed(productId: string): number[] {
  const idNums = productId.split('').map((c, i) => c.charCodeAt(0) ^ KEY_NUMS[i % KEY_NUMS.length]);
  return idNums;
}

export function obfuscate(text: string, productId: string): string {
  const seed = mixSeed(productId);
  return text.split('').map((c, i) => {
    const code = c.charCodeAt(0) ^ seed[i % seed.length];
    return String.fromCharCode(code);
  }).join('');
}

export function deobfuscate(encoded: string, productId: string): string {
  const seed = mixSeed(productId);
  return encoded.split('').map((c, i) => {
    const code = c.charCodeAt(0) ^ seed[i % seed.length];
    return String.fromCharCode(code);
  }).join('');
}

export function obfuscatePrice(price: number, productId: string): string {
  return obfuscate(String(price), productId + '_price');
}

export function deobfuscatePrice(encoded: string, productId: string): number {
  const str = deobfuscate(encoded, productId + '_price');
  return parseFloat(str) || 0;
}

export function deobfuscateProduct(p: any): any {
  if (!p || !p._e) return p;
  return {
    ...p,
    price: deobfuscatePrice(p.price, p.id),
    originalPrice: p.originalPrice ? deobfuscatePrice(p.originalPrice, p.id) : p.originalPrice,
    name: deobfuscate(p.name, p.id),
    description: deobfuscate(p.description, p.id),
    _e: undefined,
  };
}

export function deobfuscateProducts(products: any[]): any[] {
  return (products || []).map(deobfuscateProduct);
}
