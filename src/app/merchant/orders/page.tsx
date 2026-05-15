'use client';

import { useState } from 'react';
import { MerchantLayout } from '@/components/layout/MerchantLayout';
import { Card, Badge, Button, Modal } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Package, Eye, Truck, Search, User, MapPin, CreditCard } from 'lucide-react';

type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';

interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  date: string;
  shippingAddress: string;
  paymentMethod: string;
  trackingNumber?: string;
}

const sampleOrders: Order[] = [
  {
    id: 'ORD-2026-001',
    customerName: '王小明',
    customerEmail: 'wang@example.com',
    customerPhone: '0912-345-678',
    items: [
      { id: '1', name: '北歐羊毛大衣', image: 'jacket1', price: 4800, quantity: 1 },
      { id: '2', name: '極簡羊毛圍巾', image: 'scarf1', price: 1200, quantity: 2 },
    ],
    total: 7200,
    status: 'pending',
    date: '2026-05-14T10:30:00',
    shippingAddress: '台北市大安區忠孝東路100號',
    paymentMethod: '信用卡',
  },
  {
    id: 'ORD-2026-002',
    customerName: '陳雅琪',
    customerEmail: 'chen@example.com',
    customerPhone: '0933-222-111',
    items: [
      { id: '3', name: '斯堪地那維亞簡約托特包', image: 'bag1', price: 3600, quantity: 1 },
    ],
    total: 3600,
    status: 'paid',
    date: '2026-05-13T15:45:00',
    shippingAddress: '新北市板橋區中山路200號',
    paymentMethod: 'LINE Pay',
  },
  {
    id: 'ORD-2026-003',
    customerName: '林志偉',
    customerEmail: 'lin@example.com',
    customerPhone: '0921-888-999',
    items: [
      { id: '4', name: '北歐實木收納櫃', image: 'cabinet1', price: 8500, quantity: 1 },
      { id: '5', name: '極簡陶瓷擺件', image: 'vase1', price: 1800, quantity: 1 },
    ],
    total: 10300,
    status: 'shipped',
    date: '2026-05-12T09:20:00',
    shippingAddress: '桃園市桃園區中正路300號',
    paymentMethod: '信用卡',
    trackingNumber: 'TG123456789TW',
  },
  {
    id: 'ORD-2026-004',
    customerName: '張淑芬',
    customerEmail: 'zhang@example.com',
    customerPhone: '0977-555-333',
    items: [
      { id: '6', name: '北歐風雙人沙發', image: 'sofa1', price: 15800, quantity: 1 },
    ],
    total: 15800,
    status: 'completed',
    date: '2026-05-10T14:00:00',
    shippingAddress: '台中市西區英才路400號',
    paymentMethod: '信用卡',
    trackingNumber: 'TG987654321TW',
  },
  {
    id: 'ORD-2026-005',
    customerName: '黃建志',
    customerEmail: 'huang@example.com',
    customerPhone: '0955-123-456',
    items: [
      { id: '7', name: '極簡木質書桌', image: 'desk1', price: 6800, quantity: 1 },
      { id: '8', name: '北歐設計師椅', image: 'chair1', price: 5200, quantity: 1 },
    ],
    total: 12000,
    status: 'completed',
    date: '2026-05-08T11:30:00',
    shippingAddress: '高雄市左營區博愛路500號',
    paymentMethod: 'ATM轉帳',
    trackingNumber: 'TG456789123TW',
  },
  {
    id: 'ORD-2026-006',
    customerName: '李美玲',
    customerEmail: 'li@example.com',
    customerPhone: '0932-777-888',
    items: [
      { id: '9', name: '北歐羊毛被', image: 'blanket1', price: 4200, quantity: 2 },
    ],
    total: 8400,
    status: 'cancelled',
    date: '2026-05-06T16:20:00',
    shippingAddress: '台南市東區中華東路600號',
    paymentMethod: '信用卡',
  },
  {
    id: 'ORD-2026-007',
    customerName: '周杰倫',
    customerEmail: 'zhou@example.com',
    customerPhone: '0911-222-333',
    items: [
      { id: '10', name: '斯堪地那維亞簡約掛鐘', image: 'clock1', price: 2800, quantity: 1 },
      { id: '11', name: '北歐綠植盆栽', image: 'plant1', price: 800, quantity: 3 },
    ],
    total: 5200,
    status: 'paid',
    date: '2026-05-14T08:15:00',
    shippingAddress: '新竹市東區光復路700號',
    paymentMethod: 'LINE Pay',
  },
  {
    id: 'ORD-2026-008',
    customerName: '吳雅惠',
    customerEmail: 'wu@example.com',
    customerPhone: '0966-444-555',
    items: [
      { id: '12', name: '極簡不鏽鋼鬧鐘', image: 'alarm1', price: 1600, quantity: 1 },
    ],
    total: 1600,
    status: 'pending',
    date: '2026-05-14T12:00:00',
    shippingAddress: '台北市信義區市府路800號',
    paymentMethod: '信用卡',
  },
];

const statusLabels: Record<OrderStatus, string> = {
  pending: '待付款',
  paid: '已付款',
  shipped: '已發貨',
  completed: '已完成',
  cancelled: '已取消',
};

const statusBadgeVariants: Record<OrderStatus, 'warning' | 'accent' | 'success' | 'default'> = {
  pending: 'warning',
  paid: 'accent',
  shipped: 'accent',
  completed: 'success',
  cancelled: 'default',
};

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待付款' },
  { key: 'paid', label: '已付款' },
  { key: 'shipped', label: '已發貨' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
] as const;

export default function MerchantOrdersPage() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = sampleOrders.filter((order) => {
    const matchesTab = activeTab === 'all' || order.status === activeTab;
    const matchesSearch =
      searchQuery === '' ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  const getStatusCount = (status: string) => {
    if (status === 'all') return sampleOrders.length;
    return sampleOrders.filter((o) => o.status === status).length;
  };

  const getImageUrl = (path: string) => `https://picsum.photos/seed/${path}/100/100`;

  const handleConfirmPayment = (order: Order) => {
    console.log('Confirm payment:', order.id);
    setSelectedOrder(null);
  };

  const handleOpenShippingModal = (order: Order) => {
    setSelectedOrder(order);
    setTrackingNumber(order.trackingNumber || '');
    setShowShippingModal(true);
  };

  const handleSubmitShipping = () => {
    if (selectedOrder && trackingNumber) {
      console.log('Submit shipping:', selectedOrder.id, trackingNumber);
      setShowShippingModal(false);
      setSelectedOrder(null);
      setTrackingNumber('');
    }
  };

  const handleMarkCompleted = (order: Order) => {
    console.log('Mark completed:', order.id);
    setSelectedOrder(null);
  };

  return (
    <MerchantLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">訂單管理</h1>
            <p className="text-sm text-gray-600 mt-1">
              管理您的所有訂單
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Package className="w-5 h-5" />
            <span>共 {sampleOrders.length} 筆訂單</span>
          </div>
        </div>

        <Card padding="none">
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                      activeTab === tab.key
                        ? 'bg-pink-400 text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    {tab.label}
                    <Badge
                      variant={
                        tab.key === 'all'
                          ? 'default'
                          : tab.key === 'pending'
                          ? 'warning'
                          : tab.key === 'paid' || tab.key === 'shipped'
                          ? 'accent'
                          : tab.key === 'completed'
                          ? 'success'
                          : 'default'
                      }
                      className="ml-2"
                    >
                      {getStatusCount(tab.key)}
                    </Badge>
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜尋訂單..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 h-10 pl-10 pr-4 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:border-pink-400"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    訂單編號
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    客戶名稱
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    商品數量
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    訂單總額
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    狀態
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    日期
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {order.customerName}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {order.items.length} 件
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={statusBadgeVariants[order.status]}>
                        {statusLabels[order.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {formatDate(order.date)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {order.status === 'shipped' && (
                          <Button
                            variant="ghost"
                            size="sm"
                          >
                            <Truck className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-600">
              <Package className="w-12 h-12 mb-4 opacity-50" />
              <p>找不到符合條件的訂單</p>
            </div>
          )}
        </Card>
      </div>

      <Modal
        isOpen={selectedOrder !== null && !showShippingModal}
        onClose={() => setSelectedOrder(null)}
        title="訂單詳情"
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Badge variant={statusBadgeVariants[selectedOrder.status]}>
                {statusLabels[selectedOrder.status]}
              </Badge>
              <span className="text-sm text-gray-600">
                {selectedOrder.id}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedOrder.customerName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedOrder.customerEmail}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedOrder.customerPhone}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    付款方式
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedOrder.paymentMethod}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  配送地址
                </p>
                <p className="text-sm text-gray-600">
                  {selectedOrder.shippingAddress}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                商品列表
              </h4>
              <div className="space-y-3">
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-md"
                  >
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-600">訂單日期</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(selectedOrder.date)}
                </p>
                {selectedOrder.trackingNumber && (
                  <>
                    <p className="text-sm text-gray-600 mt-2">追蹤編號</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedOrder.trackingNumber}
                    </p>
                  </>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">訂單總額</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {formatPrice(selectedOrder.total)}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              {selectedOrder.status === 'pending' && (
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => handleConfirmPayment(selectedOrder)}
                >
                  確認付款
                </Button>
              )}
              {selectedOrder.status === 'paid' && (
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => handleOpenShippingModal(selectedOrder)}
                >
                  填寫物流
                </Button>
              )}
              {selectedOrder.status === 'shipped' && (
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => handleMarkCompleted(selectedOrder)}
                >
                  標記完成
                </Button>
              )}
              {(selectedOrder.status === 'completed' || selectedOrder.status === 'cancelled') && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedOrder(null)}
                >
                  關閉
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showShippingModal}
        onClose={() => setShowShippingModal(false)}
        title="填寫物流資訊"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            訂單編號：{selectedOrder?.id}
          </p>
          <Input
            label="追蹤編號"
            placeholder="請輸入物流追蹤編號"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            icon={<Truck className="w-4 h-4" />}
          />
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowShippingModal(false)}
            >
              取消
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleSubmitShipping}
              disabled={!trackingNumber}
            >
              確認出貨
            </Button>
          </div>
        </div>
      </Modal>
    </MerchantLayout>
  );
}