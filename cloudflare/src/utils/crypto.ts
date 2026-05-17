const KEY = 'aura-secret-key-2024';
const KEY_NUMS = KEY.split('').map(c => c.charCodeAt(0));

function mixSeed(id: string): number[] {
  return id.split('').map((c, i) => c.charCodeAt(0) ^ KEY_NUMS[i % KEY_NUMS.length]);
}

export function obfuscate(text: string, id: string): string {
  const seed = mixSeed(id);
  return text.split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ seed[i % seed.length])).join('');
}

export function obfuscatePrice(price: number, id: string): string {
  return obfuscate(String(price), id + '_price');
}
