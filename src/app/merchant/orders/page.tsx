'use client';

import { useEffect, useState } from 'react';
import { MerchantLayout } from '@/components/layout/MerchantLayout';
import { Card, Badge, Button, Modal, Input } from '@/components/ui';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Package, Eye, Truck, Search, User, MapPin, CreditCard } from 'lucide-react';

const MERCHANT_ID = 'xxx';

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      setError(false);
      const res = await fetch(`/api/orders?merchantId=${MERCHANT_ID}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      const list: Order[] = (data.orders || []).map((o: any) => ({
        id: o.id,
        customerName: o.customerName || o.customer || '',
        customerEmail: o.customerEmail || '',
        customerPhone: o.customerPhone || '',
        items: o.items || [],
        total: o.total || 0,
        status: o.status || 'pending',
        date: o.date || o.createdAt || '',
        shippingAddress: o.shippingAddress || '',
        paymentMethod: o.paymentMethod || '',
        trackingNumber: o.trackingNumber,
      }));
      setOrders(list);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  async function updateOrder(id: string, updates: Record<string, any>) {
    setUpdating(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, merchantId: MERCHANT_ID, ...updates }),
      });
      if (!res.ok) throw new Error('Failed to update');
      await fetchOrders();
      setSelectedOrder(null);
      setShowShippingModal(false);
      setTrackingNumber('');
    } catch {
      setError(true);
    } finally {
      setUpdating(false);
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === 'all' || order.status === activeTab;
    const matchesSearch =
      searchQuery === '' ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  const getStatusCount = (status: string) => {
    if (status === 'all') return orders.length;
    return orders.filter((o) => o.status === status).length;
  };

  const getImageUrl = (path: string) => `https://picsum.photos/seed/${path}/100/100`;

  const handleConfirmPayment = (order: Order) => {
    updateOrder(order.id, { status: 'paid' });
  };

  const handleOpenShippingModal = (order: Order) => {
    setSelectedOrder(order);
    setTrackingNumber(order.trackingNumber || '');
    setShowShippingModal(true);
  };

  const handleSubmitShipping = () => {
    if (selectedOrder && trackingNumber) {
      updateOrder(selectedOrder.id, { status: 'shipped', trackingNumber });
    }
  };

  const handleMarkCompleted = (order: Order) => {
    updateOrder(order.id, { status: 'completed' });
  };

  return (
    <MerchantLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">訂單管理</h1>
            <p className="text-sm text-gray-600 mt-1">管理您的所有訂單</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Package className="w-5 h-5" />
            <span>共 {orders.length} 筆訂單</span>
          </div>
        </div>

        {loading && (
          <Card className="p-12 text-center text-gray-400">載入中...</Card>
        )}

        {error && (
          <Card className="p-12 text-center text-gray-500">無法載入訂單</Card>
        )}

        {!loading && !error && orders.length === 0 && (
          <Card className="p-12 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">尚無數據</p>
          </Card>
        )}

        {!loading && !error && orders.length > 0 && (
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
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">訂單編號</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">客戶名稱</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">商品數量</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">訂單總額</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">狀態</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">日期</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-400">找不到符合條件的訂單</td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{order.id}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{order.customerName}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{order.items.length} 件</td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{formatPrice(order.total)}</td>
                        <td className="px-4 py-4">
                          <Badge variant={statusBadgeVariants[order.status]}>
                            {statusLabels[order.status]}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">{formatDate(order.date)}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            {order.status === 'shipped' && (
                              <Button variant="ghost" size="sm">
                                <Truck className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
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
              <span className="text-sm text-gray-600">{selectedOrder.id}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedOrder.customerName}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.customerEmail}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.customerPhone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">付款方式</p>
                  <p className="text-sm text-gray-600">{selectedOrder.paymentMethod}</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">配送地址</p>
                <p className="text-sm text-gray-600">{selectedOrder.shippingAddress}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">商品列表</h4>
              <div className="space-y-3">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-md">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        {formatPrice(item.price)} x {item.quantity}
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
                <p className="text-sm font-medium text-gray-900">{formatDate(selectedOrder.date)}</p>
                {selectedOrder.trackingNumber && (
                  <>
                    <p className="text-sm text-gray-600 mt-2">追蹤編號</p>
                    <p className="text-sm font-medium text-gray-900">{selectedOrder.trackingNumber}</p>
                  </>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">訂單總額</p>
                <p className="text-2xl font-bold text-indigo-600">{formatPrice(selectedOrder.total)}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              {selectedOrder.status === 'pending' && (
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => handleConfirmPayment(selectedOrder)}
                  disabled={updating}
                >
                  {updating ? '處理中...' : '確認付款'}
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
                  disabled={updating}
                >
                  {updating ? '處理中...' : '標記完成'}
                </Button>
              )}
              {(selectedOrder.status === 'completed' || selectedOrder.status === 'cancelled') && (
                <Button variant="outline" className="flex-1" onClick={() => setSelectedOrder(null)}>
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
          <p className="text-sm text-gray-600">訂單編號：{selectedOrder?.id}</p>
          <Input
            label="追蹤編號"
            placeholder="請輸入物流追蹤編號"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            icon={<Truck className="w-4 h-4" />}
          />
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setShowShippingModal(false)}>
              取消
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleSubmitShipping}
              disabled={!trackingNumber || updating}
            >
              {updating ? '處理中...' : '確認出貨'}
            </Button>
          </div>
        </div>
      </Modal>
    </MerchantLayout>
  );
}