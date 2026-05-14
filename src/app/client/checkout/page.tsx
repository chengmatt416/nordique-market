'use client';
import { useState } from 'react';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Button, Card, Badge, Input, Modal } from '@/components/ui';
import { formatPrice, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Check, CreditCard, Building, Store, MapPin, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

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
  {
    id: '1',
    name: '王小明',
    phone: '0912-345-678',
    city: '台北市',
    address: '松山區民生東路三段128號9樓',
    isDefault: true,
  },
  {
    id: '2',
    name: '王小明',
    phone: '0932-111-222',
    city: '新北市',
    address: '板橋區文化路一段168號',
  },
];

const orderItems: OrderItem[] = [
  {
    id: '1',
    name: '北歐簡約陶瓷花瓶',
    variantName: '米白色 / 中型',
    price: 1280,
    quantity: 1,
    image: 'vase-1',
    merchantName: '北歐家居館',
  },
  {
    id: '2',
    name: '手工羊毛針織毯',
    variantName: '淺灰色',
    price: 2480,
    quantity: 2,
    image: 'blanket-1',
    merchantName: '北歐家居館',
  },
  {
    id: '3',
    name: '極簡木質時鐘',
    variantName: '胡桃木色',
    price: 980,
    quantity: 1,
    image: 'clock-1',
    merchantName: '設計師工坊',
  },
];

const paymentMethods = [
  { id: 'card', label: '信用卡', icon: CreditCard },
  { id: 'bank', label: '銀行轉帳', icon: Building },
  { id: 'convenience', label: '超商繳費', icon: Store },
];

const cities = ['台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市'];

const steps = [
  { num: 1, label: '選擇商品' },
  { num: 2, label: '填寫資料' },
  { num: 3, label: '完成訂單' },
];

function groupItemsByMerchant(items: OrderItem[]) {
  const groups: Record<string, OrderItem[]> = {};
  items.forEach((item) => {
    if (!groups[item.merchantName]) {
      groups[item.merchantName] = [];
    }
    groups[item.merchantName].push(item);
  });
  return groups;
}

function CheckoutPage() {
  const [selectedAddress, setSelectedAddress] = useState<string>(savedAddresses[0].id);
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [newAddress, setNewAddress] = useState<NewAddress>({
    name: '',
    phone: '',
    city: '',
    address: '',
  });

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 60;
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + shipping - discount;

  const merchantGroups = groupItemsByMerchant(orderItems);

  const handleAddAddress = () => {
    setShowAddressModal(false);
    setNewAddress({ name: '', phone: '', city: '', address: '' });
  };

  const handleSubmitOrder = () => {
    setShowSuccessModal(true);
  };

  return (
    <ClientLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">結帳</h1>

        <div className="flex items-center justify-center gap-2 md:gap-4">
          {steps.map((step, index) => (
            <div key={step.num} className="flex items-center">
              <div
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                  step.num <= 2
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--secondary)] text-[var(--text-secondary)]'
                )}
              >
                <span
                  className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center text-xs',
                    step.num <= 2 ? 'bg-white/20' : 'bg-[var(--border)]'
                  )}
                >
                  {step.num}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="w-4 h-4 mx-1 text-[var(--text-muted)]" />
              )}
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  收件地址
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddressModal(true)}
                >
                  <Plus className="w-4 h-4" />
                  新增收件地址
                </Button>
              </div>
              <div className="grid gap-3">
                {savedAddresses.map((addr) => (
                  <motion.div
                    key={addr.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedAddress(addr.id)}
                    className={cn(
                      'p-4 rounded-[var(--radius-md)] border-2 cursor-pointer transition-colors',
                      selectedAddress === addr.id
                        ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                        : 'border-[var(--border)] hover:border-[var(--text-muted)]'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[var(--text-primary)]">
                            {addr.name}
                          </span>
                          {addr.isDefault && (
                            <Badge variant="accent">預設</Badge>
                          )}
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                          {addr.phone}
                        </p>
                        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                          {addr.city} {addr.address}
                        </p>
                      </div>
                      {selectedAddress === addr.id && (
                        <div className="w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">
                付款方式
              </h3>
              <div className="grid gap-3">
                {paymentMethods.map((method) => (
                  <motion.div
                    key={method.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedPayment(method.id)}
                    className={cn(
                      'p-4 rounded-[var(--radius-md)] border-2 cursor-pointer transition-colors flex items-center gap-3',
                      selectedPayment === method.id
                        ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                        : 'border-[var(--border)] hover:border-[var(--text-muted)]'
                    )}
                  >
                    <method.icon className="w-5 h-5 text-[var(--text-secondary)]" />
                    <span className="font-medium text-[var(--text-primary)]">
                      {method.label}
                    </span>
                    {selectedPayment === method.id && (
                      <div className="ml-auto w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">
                訂單摘要
              </h3>

              <div className="space-y-4 max-h-64 overflow-y-auto">
                {Object.entries(merchantGroups).map(([merchantName, items]) => (
                  <div key={merchantName}>
                    <p className="text-xs font-medium text-[var(--text-muted)] mb-2">
                      {merchantName}
                    </p>
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3 mb-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://picsum.photos/seed/${item.image}/60/60`}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded bg-[var(--secondary)]"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[var(--text-primary)] truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-[var(--text-secondary)]">
                            x{item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">商品金額</span>
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
                <div className="flex justify-between pt-2 border-t border-[var(--border)]">
                  <span className="font-semibold text-[var(--text-primary)]">
                    訂單總計
                  </span>
                  <span className="font-bold text-lg text-[var(--primary)]">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="輸入優惠碼"
                    className="flex-1 h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white text-sm focus:outline-none focus:border-[var(--accent)]"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (couponCode.trim().toUpperCase() === 'AURA10') {
                        setCouponApplied(true);
                      }
                    }}
                  >
                    套用
                  </Button>
                </div>
                {couponApplied && (
                  <p className="text-sm text-[var(--success)] mt-2">
                    已套用 AURA10 優惠碼
                  </p>
                )}
              </div>
            </Card>

            <Button className="w-full" onClick={handleSubmitOrder}>
              送出訂單
            </Button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        title="新增地址"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="姓名"
            value={newAddress.name}
            onChange={(e) =>
              setNewAddress((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="請輸入姓名"
          />
          <Input
            label="電話"
            value={newAddress.phone}
            onChange={(e) =>
              setNewAddress((prev) => ({ ...prev, phone: e.target.value }))
            }
            placeholder="0912-345-678"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--text-primary)]">
              城市
            </label>
            <select
              value={newAddress.city}
              onChange={(e) =>
                setNewAddress((prev) => ({ ...prev, city: e.target.value }))
              }
              className="w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            >
              <option value="">請選擇城市</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="詳細地址"
            value={newAddress.address}
            onChange={(e) =>
              setNewAddress((prev) => ({ ...prev, address: e.target.value }))
            }
            placeholder="路名、巷弄、樓層等"
          />
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowAddressModal(false)}
              className="flex-1"
            >
              取消
            </Button>
            <Button onClick={handleAddAddress} className="flex-1">
              儲存
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        size="sm"
        showClose={false}
      >
        <div className="text-center py-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--success)]/10 flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <Check className="w-10 h-10 text-[var(--success)]" />
            </motion.div>
          </motion.div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            訂單已成立
          </h2>
          <p className="text-[var(--text-secondary)] mb-6">
            感謝您的購買！我們將盡快處理您的訂單
          </p>
          <div className="flex gap-3">
            <Link href="/client/orders" className="flex-1">
              <Button variant="outline" className="w-full">
                查看訂單
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button className="w-full">繼續購物</Button>
            </Link>
          </div>
        </div>
      </Modal>
    </ClientLayout>
  );
}

export default CheckoutPage;