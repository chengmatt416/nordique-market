'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Button, Card } from '@/components/ui';
import { formatPrice, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Store } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  variantName: string;
  price: number;
  quantity: number;
  image: string;
  merchantId: string;
  merchantName: string;
  selected: boolean;
}

const sampleCartItems: CartItem[] = [
  { id: '1', name: '北歐簡約陶瓷花瓶', variantName: '米白色 / 中型', price: 1280, quantity: 1, image: 'vase-1', merchantId: 'm1', merchantName: '北歐家居館', selected: true },
  { id: '2', name: '手工羊毛針織毯', variantName: '淺灰色', price: 2480, quantity: 2, image: 'blanket-1', merchantId: 'm1', merchantName: '北歐家居館', selected: true },
  { id: '3', name: '極簡木質時鐘', variantName: '胡桃木色', price: 980, quantity: 1, image: 'clock-1', merchantId: 'm2', merchantName: '設計師工坊', selected: true },
  { id: '4', name: '純棉舒眠枕頭套', variantName: '白色 / 標準尺寸', price: 580, quantity: 2, image: 'pillow-1', merchantId: 'm3', merchantName: '質感生活', selected: false },
];

function groupItemsByMerchant(items: CartItem[]) {
  const groups: Record<string, { merchantId: string; merchantName: string; items: CartItem[] }> = {};
  items.forEach((item) => {
    if (!groups[item.merchantId]) {
      groups[item.merchantId] = { merchantId: item.merchantId, merchantName: item.merchantName, items: [] };
    }
    groups[item.merchantId].items.push(item);
  });
  return Object.values(groups);
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(sampleCartItems);
  const [coupon, setCoupon] = useState('');

  const groupedItems = groupItemsByMerchant(items);
  const selectedItems = items.filter((i) => i.selected);
  const subtotal = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingFee = selectedItems.length > 0 ? 60 : 0;
  const total = subtotal + shippingFee;

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const toggleSelect = (id: string) => {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, selected: !item.selected } : item));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const allSelected = selectedItems.length === items.filter((i) => i.selected).length && items.every((i) => i.selected);

  return (
    <ClientLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">購物車</h1>

        {items.length === 0 ? (
          <Card padding="lg" className="text-center py-16">
            <ShoppingBag className="w-16 h-16 mx-auto text-[var(--text-muted)] mb-4" />
            <p className="text-lg text-[var(--text-secondary)] mb-4">您的購物車是空的</p>
            <Link href="/search">
              <Button>開始選購</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => setItems((prev) => prev.map((i) => ({ ...i, selected: !allSelected })))}
                  className="w-5 h-5 rounded border-[var(--border)] accent-[var(--primary)]"
                />
                <span className="text-sm">全選</span>
              </label>
            </div>

            {groupedItems.map((group) => (
              <Card key={group.merchantId} padding="none">
                <div className="p-4 border-b border-[var(--border)] flex items-center gap-2">
                  <Store className="w-4 h-4 text-[var(--text-muted)]" />
                  <span className="font-medium">{group.merchantName}</span>
                </div>
                <div className="divide-y divide-[var(--border)]">
                  {group.items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="p-4 flex gap-4"
                    >
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => toggleSelect(item.id)}
                        className="w-5 h-5 rounded border-[var(--border)] accent-[var(--primary)] flex-shrink-0 mt-4"
                      />
                      <div className="w-20 h-20 bg-[var(--secondary)] rounded-lg overflow-hidden flex-shrink-0">
                        <img src={`https://picsum.photos/seed/${item.image}/200/200`} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{item.name}</h3>
                        <p className="text-sm text-[var(--text-secondary)]">{item.variantName}</p>
                        <p className="font-bold text-[var(--primary)] mt-1">{formatPrice(item.price)}</p>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <button onClick={() => removeItem(item.id)} className="p-1 text-[var(--text-muted)] hover:text-[var(--error)]">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 rounded border border-[var(--border)] flex items-center justify-center hover:bg-[var(--secondary)]">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 rounded border border-[var(--border)] flex items-center justify-center hover:bg-[var(--secondary)]">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            ))}

            <Card padding="md">
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="輸入優惠碼"
                  className="flex-1 h-10 px-3 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)]"
                />
                <Button variant="outline" size="sm">套用</Button>
              </div>
            </Card>

            <Card padding="md">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">商品小計</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">運費</span>
                  <span>{formatPrice(shippingFee)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-3 border-t border-[var(--border)]">
                  <span>總計</span>
                  <span className="text-[var(--primary)]">{formatPrice(total)}</span>
                </div>
              </div>
              <Link href="/client/checkout" className="block mt-4">
                <Button className="w-full" size="lg" disabled={selectedItems.length === 0}>
                  結帳
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </Card>
          </div>
        )}
      </div>
    </ClientLayout>
  );
}