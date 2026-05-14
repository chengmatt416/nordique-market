'use client';
import { useState } from 'react';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Button, Card } from '@/components/ui';
import { formatPrice, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

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

interface MerchantGroup {
  merchantId: string;
  merchantName: string;
  items: CartItem[];
}

const sampleCartItems: CartItem[] = [
  {
    id: '1',
    name: '北歐簡約陶瓷花瓶',
    variantName: '米白色 / 中型',
    price: 1280,
    quantity: 1,
    image: 'vase-1',
    merchantId: 'm1',
    merchantName: '北歐家居館',
    selected: true,
  },
  {
    id: '2',
    name: '手工羊毛針織毯',
    variantName: '淺灰色',
    price: 2480,
    quantity: 2,
    image: 'blanket-1',
    merchantId: 'm1',
    merchantName: '北歐家居館',
    selected: true,
  },
  {
    id: '3',
    name: '極簡木質時鐘',
    variantName: '胡桃木色',
    price: 980,
    quantity: 1,
    image: 'clock-1',
    merchantId: 'm2',
    merchantName: '設計師工坊',
    selected: true,
  },
  {
    id: '4',
    name: '純棉舒眠枕頭套',
    variantName: '白色 / 標準尺寸',
    price: 580,
    quantity: 2,
    image: 'pillow-1',
    merchantId: 'm3',
    merchantName: '質感生活',
    selected: false,
  },
];

function groupItemsByMerchant(items: CartItem[]): MerchantGroup[] {
  const groups: Record<string, MerchantGroup> = {};
  items.forEach((item) => {
    if (!groups[item.merchantId]) {
      groups[item.merchantId] = {
        merchantId: item.merchantId,
        merchantName: item.merchantName,
        items: [],
      };
    }
    groups[item.merchantId].items.push(item);
  });
  return Object.values(groups);
}

function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(sampleCartItems);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  const groups = groupItemsByMerchant(cartItems);

  const selectedItems = cartItems.filter((item) => item.selected);
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = selectedItems.length > 0 ? 60 : 0;
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + shipping - discount;

  const toggleItem = (id: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const applyCoupon = () => {
    if (couponCode.trim().toUpperCase() === 'AURA10') {
      setCouponApplied(true);
    }
  };

  if (cartItems.length === 0) {
    return (
      <ClientLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-32 h-32 rounded-full bg-[var(--secondary)] flex items-center justify-center mb-6"
          >
            <ShoppingBag className="w-16 h-16 text-[var(--text-muted)]" />
          </motion.div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            您的購物車是空的
          </h2>
          <p className="text-[var(--text-secondary)] mb-6">
            探索北歐優質商品，開始購物之旅
          </p>
          <Link href="/">
            <Button>
              開始購物
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">購物車</h1>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {groups.map((group) => {
              const groupSubtotal = group.items
                .filter((item) => item.selected)
                .reduce((sum, item) => sum + item.price * item.quantity, 0);

              return (
                <Card key={group.merchantId} padding="none">
                  <div className="p-4 border-b border-[var(--border)]">
                    <h3 className="font-medium text-[var(--text-primary)]">
                      商店：{group.merchantName}
                    </h3>
                  </div>
                  <div className="divide-y divide-[var(--border)]">
                    <AnimatePresence>
                      {group.items.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 1 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="p-4 flex gap-4"
                        >
                          <button
                            onClick={() => toggleItem(item.id)}
                            className={cn(
                              'w-5 h-5 rounded border-2 flex-shrink-0 mt-1 transition-colors',
                              item.selected
                                ? 'bg-[var(--primary)] border-[var(--primary)]'
                                : 'border-[var(--border)] hover:border-[var(--text-muted)]'
                            )}
                          >
                            {item.selected && (
                              <svg
                                viewBox="0 0 12 12"
                                className="w-full h-full text-white"
                              >
                                <path
                                  d="M2 6l3 3 5-6"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </button>

                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`https://picsum.photos/seed/${item.image}/120/120`}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-[var(--radius-sm)] bg-[var(--secondary)]"
                          />

                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-[var(--text-primary)] truncate">
                              {item.name}
                            </h4>
                            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                              {item.variantName}
                            </p>
                            <p className="font-semibold text-[var(--primary)] mt-1">
                              {formatPrice(item.price)}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--error)] transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-7 h-7 rounded-full border border-[var(--border)] flex items-center justify-center hover:bg-[var(--secondary)] transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-7 h-7 rounded-full border border-[var(--border)] flex items-center justify-center hover:bg-[var(--secondary)] transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  <div className="p-4 bg-[var(--secondary)]/50 flex justify-between items-center">
                    <span className="text-sm text-[var(--text-secondary)]">
                      小計
                    </span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {formatPrice(groupSubtotal)}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="space-y-6">
            <Card>
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">
                優惠碼
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="輸入優惠碼"
                  className="flex-1 h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white text-sm focus:outline-none focus:border-[var(--accent)]"
                />
                <Button onClick={applyCoupon} variant="outline" size="sm">
                  套用
                </Button>
              </div>
              {couponApplied && (
                <p className="text-sm text-[var(--success)] mt-2">
                  已套用 AURA10 優惠碼，享 10% 折扣
                </p>
              )}
            </Card>

            <Card>
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">
                訂單摘要
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">小計</span>
                  <span className="text-[var(--text-primary)]">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">運費</span>
                  <span className="text-[var(--text-primary)]">
                    {formatPrice(shipping)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--success)]">折扣</span>
                    <span className="text-[var(--success)]">
                      -{formatPrice(discount)}
                    </span>
                  </div>
                )}
                <div className="pt-3 border-t border-[var(--border)] flex justify-between">
                  <span className="font-semibold text-[var(--text-primary)]">
                    總計
                  </span>
                  <span className="font-bold text-lg text-[var(--primary)]">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
              <Link href="/client/checkout" className="block mt-4">
                <Button className="w-full" disabled={selectedItems.length === 0}>
                  前往結帳
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}

export default CartPage;