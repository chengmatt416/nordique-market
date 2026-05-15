'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Button, Card } from '@/components/ui';
import { formatPrice, cn } from '@/lib/utils';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Store } from 'lucide-react';

interface CartItem {
  id: number;
  name: string;
  variant: string;
  price: number;
  image: number;
  quantity: number;
  merchant: string;
  merchantId: number;
}

const sampleItems: CartItem[] = [
  { id: 1, name: '極簡實木書桌', variant: '胡桃木色 / 120cm', price: 4200, image: 101, quantity: 1, merchant: 'Nordique 北歐家居', merchantId: 1 },
  { id: 2, name: '北歐風落地燈', variant: '啞光黑', price: 2600, image: 103, quantity: 2, merchant: 'Nordique 北歐家居', merchantId: 1 },
  { id: 3, name: '亞麻寬版襯衫', variant: '米白色 / L', price: 1580, image: 105, quantity: 1, merchant: 'Linen House 亞麻之家', merchantId: 2 },
  { id: 4, name: '藍牙降噪耳機 Pro', variant: '午夜藍', price: 3290, image: 106, quantity: 1, merchant: 'TechVibe 科技潮流', merchantId: 3 },
];

function groupByMerchant(items: CartItem[]) {
  const map = new Map<number, { merchant: string; merchantId: number; items: CartItem[] }>();
  for (const item of items) {
    if (!map.has(item.merchantId)) {
      map.set(item.merchantId, { merchant: item.merchant, merchantId: item.merchantId, items: [] });
    }
    map.get(item.merchantId)!.items.push(item);
  }
  return Array.from(map.values());
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(sampleItems);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set(sampleItems.map((i) => i.id)));
  const [couponCode, setCouponCode] = useState('');

  const updateQuantity = (id: number, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const toggleItem = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  };

  const selectedItems = items.filter((i) => selectedIds.has(i.id));
  const subtotal = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = selectedItems.length > 0 ? 60 : 0;
  const total = subtotal + shipping;

  const merchantGroups = groupByMerchant(items);

  if (items.length === 0) {
    return (
      <ClientLayout>
        <h1 className="text-xl font-bold text-gray-900 mb-6">購物車</h1>
        <div className="flex flex-col items-center justify-center py-20">
          <ShoppingBag className="w-20 h-20 text-gray-300 mb-6" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">您的購物車是空的</h2>
          <p className="text-sm text-gray-500 mb-8">快去挑選喜歡的商品吧！</p>
          <Link href="/search">
            <Button size="lg">開始購物</Button>
          </Link>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <h1 className="text-xl font-bold text-gray-900 mb-6">購物車</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center px-4 py-3 border-b border-gray-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.size === items.length && items.length > 0}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-900">全選</span>
              </label>
            </div>

            {merchantGroups.map((group) => (
              <div key={group.merchantId} className="border-b border-gray-200 last:border-b-0">
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50">
                  <Store className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">{group.merchant}</span>
                </div>

                {group.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleItem(item.id)}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 shrink-0"
                    />
                    <div className="w-[60px] h-[60px] rounded-lg bg-gray-100 overflow-hidden shrink-0">
                      <img
                        src={`https://picsum.photos/seed/${item.image}/120/120`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{item.variant}</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        disabled={item.quantity <= 1}
                        className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:w-80 shrink-0">
          <div className="sticky top-[88px]">
            <Card padding="lg">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">小計</span>
                  <span className="text-sm font-medium text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">運費</span>
                  <span className="text-sm font-medium text-gray-900">
                    {shipping > 0 ? formatPrice(shipping) : '–'}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-gray-900">總計</span>
                    <span className="text-base font-bold text-gray-900">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <Link
                href={selectedItems.length > 0 ? '/client/checkout' : '#'}
                className={cn(
                  'flex items-center justify-center gap-2 w-full mt-5 h-12 rounded-lg font-medium text-white transition-colors',
                  selectedItems.length > 0
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-indigo-600/50 cursor-not-allowed pointer-events-none'
                )}
              >
                結帳
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Card>

            <Card className="mt-4">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">優惠券</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="輸入折扣碼"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <Button variant="outline" size="md" disabled={!couponCode.trim()}>
                    套用
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}