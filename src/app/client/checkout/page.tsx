'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Button, Card, Badge } from '@/components/ui';
import { formatPrice, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Check, CreditCard, Building, Store, MapPin, Plus, ChevronRight } from 'lucide-react';

const STEPS = [
  { label: '選擇商品', key: 1 },
  { label: '填寫資料', key: 2 },
  { label: '完成訂單', key: 3 },
];

const ORDER_ITEMS = [
  {
    id: 1,
    name: 'Nordique 極簡木柄馬克杯',
    variant: 'M / 霧黑色',
    price: 680,
    quantity: 2,
    image: 'https://picsum.photos/seed/mug/120/120',
  },
  {
    id: 2,
    name: '羊毛編織蓋毯',
    variant: 'L / 米白色',
    price: 1280,
    quantity: 1,
    image: 'https://picsum.photos/seed/blanket/120/120',
  },
];

const PAYMENT_METHODS = [
  { id: 'credit', label: '信用卡', icon: CreditCard },
  { id: 'transfer', label: '銀行轉帳', icon: Building },
  { id: 'convenience', label: '超商繳費', icon: Store },
];

const ADDRESSES = [
  {
    id: 'addr1',
    name: '王小明',
    phone: '0912-345-678',
    address: '台北市信義區信義路五段7號',
  },
  {
    id: 'addr2',
    name: '王小明',
    phone: '0928-765-432',
    address: '台北市大安區敦化南路二段105號',
  },
];

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState('addr1');
  const [selectedPayment, setSelectedPayment] = useState('credit');

  const subtotal = ORDER_ITEMS.reduce((sum, item) => sum + item.price * item.quantity, 0);
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
              <Card className="mb-6 rounded-xl bg-white p-6">
                <h2 className="mb-4 text-lg font-bold text-gray-900">訂單內容</h2>
                <div className="divide-y divide-gray-100">
                  {ORDER_ITEMS.map((item) => (
                    <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                      <img
                        src={item.image}
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
              {/* Address Selection */}
              <Card className="mb-6 rounded-xl bg-white p-6">
                <h2 className="mb-4 text-lg font-bold text-gray-900">運送地址</h2>
                <div className="space-y-3">
                  {ADDRESSES.map((addr) => (
                    <label
                      key={addr.id}
                      className={cn(
                        'flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-colors',
                        selectedAddress === addr.id
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={selectedAddress === addr.id}
                        onChange={() => setSelectedAddress(addr.id)}
                        className="mt-0.5 h-4 w-4 accent-indigo-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{addr.name}</span>
                          <span className="text-sm text-gray-400">{addr.phone}</span>
                        </div>
                        <div className="mt-1 flex items-start gap-1 text-sm text-gray-600">
                          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                          {addr.address}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  className="mt-3 flex items-center gap-1 text-sm text-indigo-600"
                >
                  <Plus className="h-4 w-4" />
                  新增地址
                </Button>
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
                onClick={() => setStep(3)}
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