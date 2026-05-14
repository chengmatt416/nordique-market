'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Button, Card, Badge } from '@/components/ui';
import { formatPrice, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Check, CreditCard, Building, Store, MapPin, Plus, ChevronRight, Package } from 'lucide-react';

interface Address {
  id: string;
  name: string;
  phone: string;
  city: string;
  address: string;
  isDefault?: boolean;
}

interface OrderItem {
  id: string;
  name: string;
  variantName: string;
  price: number;
  quantity: number;
  image: string;
  merchantName: string;
}

interface NewAddress {
  name: string;
  phone: string;
  city: string;
  address: string;
}

const savedAddresses: Address[] = [
  { id: '1', name: '王小明', phone: '0912-345-678', city: '台北市', address: '松山區民生東路三段128號9樓', isDefault: true },
  { id: '2', name: '王小明', phone: '0932-111-222', city: '新北市', address: '板橋區文化路一段168號' },
];

const orderItems: OrderItem[] = [
  { id: '1', name: '北歐簡約陶瓷花瓶', variantName: '米白色 / 中型', price: 1280, quantity: 1, image: 'vase-1', merchantName: '北歐家居館' },
  { id: '2', name: '手工羊毛針織毯', variantName: '淺灰色', price: 2480, quantity: 2, image: 'blanket-1', merchantName: '北歐家居館' },
];

const paymentMethods = [
  { id: 'credit', label: '信用卡', icon: CreditCard },
  { id: 'bank', label: '銀行轉帳', icon: Building },
  { id: 'cvs', label: '超商繳費', icon: Store },
];

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState('1');
  const [selectedPayment, setSelectedPayment] = useState('credit');
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<NewAddress>({ name: '', phone: '', city: '', address: '' });
  const [showSuccess, setShowSuccess] = useState(false);

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = 60;
  const discount = 0;
  const total = subtotal + shippingFee - discount;

  const handleSubmitOrder = () => {
    setShowSuccess(true);
  };

  return (
    <ClientLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">確認訂單</h1>

        <div className="flex items-center gap-2 mb-8">
          {['選擇商品', '填寫資料', '完成訂單'].map((label, i) => (
            <div key={i} className="flex items-center">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                step > i + 1 ? 'bg-[var(--success)] text-white' : step === i + 1 ? 'bg-[var(--primary)] text-white' : 'bg-[var(--border)] text-[var(--text-secondary)]'
              )}>
                {step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={cn('ml-2 text-sm', step === i + 1 ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-muted)]')}>
                {label}
              </span>
              {i < 2 && <ChevronRight className="w-4 h-4 mx-3 text-[var(--text-muted)]" />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <Card padding="none">
              <div className="p-4 border-b border-[var(--border)] font-medium">商品明細</div>
              <div className="divide-y divide-[var(--border)]">
                {orderItems.map((item) => (
                  <div key={item.id} className="p-4 flex gap-4">
                    <div className="w-16 h-16 bg-[var(--secondary)] rounded-lg overflow-hidden">
                      <img src={`https://picsum.photos/seed/${item.image}/200/200`} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-[var(--text-secondary)]">{item.variantName}</p>
                      <p className="text-sm text-[var(--text-muted)]">{item.merchantName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(item.price)}</p>
                      <p className="text-sm text-[var(--text-muted)]">x{item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Button onClick={() => setStep(2)} className="w-full" size="lg">
              下一步：填寫資料 <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <Card padding="none">
              <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                <span className="font-medium flex items-center gap-2"><MapPin className="w-4 h-4" /> 收件地址</span>
                <Button variant="ghost" size="sm" onClick={() => setShowNewAddress(!showNewAddress)}>
                  <Plus className="w-4 h-4 mr-1" /> 新增
                </Button>
              </div>
              <div className="p-4 space-y-3">
                {savedAddresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                      selectedAddress === addr.id ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-[var(--border)] hover:border-[var(--accent)]'
                    )}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={addr.id}
                      checked={selectedAddress === addr.id}
                      onChange={() => setSelectedAddress(addr.id)}
                      className="mt-1 accent-[var(--primary)]"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{addr.name} {addr.isDefault && <Badge variant="success" className="text-xs ml-2">預設</Badge>}</p>
                      <p className="text-sm text-[var(--text-secondary)]">{addr.phone}</p>
                      <p className="text-sm text-[var(--text-secondary)]">{addr.city} {addr.address}</p>
                    </div>
                  </label>
                ))}
              </div>
            </Card>

            <Card padding="none">
              <div className="p-4 border-b border-[var(--border)] font-medium flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> 付款方式
              </div>
              <div className="p-4 space-y-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                      selectedPayment === method.id ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-[var(--border)] hover:border-[var(--accent)]'
                    )}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={selectedPayment === method.id}
                      onChange={() => setSelectedPayment(method.id)}
                      className="accent-[var(--primary)]"
                    />
                    <method.icon className="w-5 h-5 text-[var(--text-secondary)]" />
                    <span className="font-medium">{method.label}</span>
                  </label>
                ))}
              </div>
            </Card>

            <Card padding="md">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">商品小計</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">運費</span>
                  <span>{formatPrice(shippingFee)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-[var(--success)]">
                    <span>折扣</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-[var(--border)]">
                  <span>訂單總計</span>
                  <span className="text-[var(--primary)]">{formatPrice(total)}</span>
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">上一步</Button>
              <Button onClick={handleSubmitOrder} className="flex-1" size="lg">送出訂單</Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
            <div className="w-20 h-20 bg-[var(--success)] rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">訂單已成立！</h2>
            <p className="text-[var(--text-secondary)] mb-8">感謝您的購買，我們會盡快為您處理</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/client/orders">
                <Button variant="outline">查看訂單</Button>
              </Link>
              <Link href="/client/home">
                <Button>繼續購物</Button>
              </Link>
            </div>
          </motion.div>
        )}

        {showSuccess && step !== 3 && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowSuccess(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-[var(--success)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">訂單已成立！</h3>
              <p className="text-[var(--text-secondary)] mb-6">感謝您的購買</p>
              <div className="flex gap-3">
                <Link href="/client/orders" className="flex-1">
                  <Button variant="outline" className="w-full">查看訂單</Button>
                </Link>
                <Link href="/client/home" className="flex-1">
                  <Button className="w-full">繼續購物</Button>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
}