'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Button, Card } from '@/components/ui';
import { formatPrice, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Check, CreditCard, Building, Store, MapPin, Plus, ChevronRight, ShoppingBag } from 'lucide-react';
import { getCart, clearCart, CartItemData } from '@/lib/cart';

const STEPS = [
  { label: '選擇商品', key: 1 },
  { label: '填寫資料', key: 2 },
  { label: '完成訂單', key: 3 },
];

const PAYMENT_METHODS = [
  { id: 'credit', label: '信用卡', icon: CreditCard },
  { id: 'transfer', label: '銀行轉帳', icon: Building },
  { id: 'convenience', label: '超商繳費', icon: Store },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [items, setItems] = useState<CartItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState('credit');

  useEffect(() => {
    const cart = getCart().filter(i => i.quantity > 0);
    if (cart.length === 0) {
      setLoading(false);
      return;
    }
    setItems(cart);
    setLoading(false);
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 1000 ? 0 : 80;
  const total = subtotal + shipping;

  const getStepClass = (k: number) => {
    if (k < step) return 'bg-green-500 text-white border-green-500';
    if (k === step) return 'bg-indigo-600 text-white border-indigo-600';
    return 'bg-gray-100 text-gray-400 border-gray-200';
  };

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-2xl px-4">
          {/* Step Indicator */}
          <div className="mb-8 flex items-center justify-center gap-0">
            {STEPS.map((s, index) => (
              <div key={s.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold',
                      getStepClass(s.key)
                    )}
                  >
                    {s.key < step ? <Check className="h-5 w-5" /> : s.key}
                  </div>
                  <span
                    className={cn(
                      'mt-2 text-xs',
                      s.key <= step ? 'text-gray-900' : 'text-gray-400'
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'mx-2 mb-6 h-0.5 w-16',
                      s.key < step ? 'bg-green-500' : 'bg-gray-200'
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Order Items */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {loading ? (
                <Card className="mb-6 rounded-xl bg-white p-6 text-center">
                  <p className="text-gray-500">載入中...</p>
                </Card>
              ) : items.length === 0 ? (
                <Card className="mb-6 rounded-xl bg-white p-6 text-center">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-lg font-medium text-gray-900 mb-2">購物車是空的</h2>
                  <p className="text-sm text-gray-500 mb-6">請先將商品加入購物車</p>
                  <Link href="/search">
                    <Button>前往選購</Button>
                  </Link>
                </Card>
              ) : (
                <Card className="mb-6 rounded-xl bg-white p-6">
                  <h2 className="mb-4 text-lg font-bold text-gray-900">訂單內容</h2>
                  <div className="divide-y divide-gray-100">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                        <img
                          src={item.image || `https://picsum.photos/seed/${item.id}/120/120`}
                          alt={item.name}
                          className="h-20 w-20 rounded-lg object-cover"
                        />
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{item.name}</h3>
                            <p className="text-sm text-gray-400">{item.variant}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-indigo-600">
                              {formatPrice(item.price)}
                            </span>
                            <span className="text-sm text-gray-600">x{item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <Button
                onClick={() => setStep(2)}
                className="w-full rounded-xl bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-700"
              >
                下一步
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Address & Payment */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Shipping Address */}
              <Card className="mb-6 rounded-xl bg-white p-6">
                <h2 className="mb-4 text-lg font-bold text-gray-900">運送地址</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">收件人姓名</label>
                    <input type="text" placeholder="請輸入姓名"
                      className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">聯絡電話</label>
                    <input type="tel" placeholder="0912-345-678"
                      className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">配送地址</label>
                    <input type="text" placeholder="請輸入完整地址"
                      className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                  </div>
                </div>
              </Card>

              {/* Payment Method */}
              <Card className="mb-6 rounded-xl bg-white p-6">
                <h2 className="mb-4 text-lg font-bold text-gray-900">付款方式</h2>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map((method) => (
                    <label
                      key={method.id}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-colors',
                        selectedPayment === method.id
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={selectedPayment === method.id}
                        onChange={() => setSelectedPayment(method.id)}
                        className="h-4 w-4 accent-indigo-600"
                      />
                      <method.icon className="h-5 w-5 text-gray-600" />
                      <span className="font-medium text-gray-900">{method.label}</span>
                    </label>
                  ))}
                </div>
              </Card>

              {/* Order Total */}
              <Card className="mb-6 rounded-xl bg-white p-6">
                <h2 className="mb-4 text-lg font-bold text-gray-900">訂單摘要</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">小計</span>
                    <span className="text-gray-900">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">運費</span>
                    <span className="text-gray-900">
                      {shipping === 0 ? (
                        <span className="text-green-500 font-medium">免運</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between text-base font-bold">
                      <span className="text-gray-900">總計</span>
                      <span className="text-indigo-600">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Button
                onClick={async () => {
                  try {
                    await fetch('/api/orders', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        items: items.map(i => ({ productId: i.id, productName: i.name, price: i.price, quantity: i.quantity, productImage: i.image })),
                        totalAmount: total,
                        shippingFee: shipping,
                        paymentMethod: selectedPayment,
                      }),
                    });
                  } catch {}
                  clearCart();
                  setStep(3);
                }}
                className="w-full rounded-xl bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-700"
              >
                確認送出
              </Button>
            </motion.div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="rounded-xl bg-white p-8 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500">
                  <Check className="h-10 w-10 text-white" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-gray-900">訂單已成立！</h2>
                <p className="mb-6 text-gray-400">
                  感謝您的訂購，我們會盡快為您處理
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Link href="/client/orders">
                    <Button
                      variant="outline"
                      className="w-full rounded-xl border-2 border-gray-200 px-6 py-3 font-medium text-gray-900 hover:bg-gray-50"
                    >
                      查看訂單
                    </Button>
                  </Link>
                  <Link href="/client/products">
                    <Button className="w-full rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700">
                      繼續購物
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
}