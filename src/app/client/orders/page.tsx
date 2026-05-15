'use client';
import { useState, useEffect, useCallback } from 'react';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Button, Card, Badge } from '@/components/ui';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Clock, Truck, CheckCircle, XCircle, Search, MapPin, PackageCheck, ShoppingBag } from 'lucide-react';

type OrderStatus = 'pending_payment' | 'pending_ship' | 'shipped' | 'completed' | 'cancelled';

interface OrderItem {
  id: string;
  name: string;
  variantName: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  customerId: string;
  merchantId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  merchantName: string;
  trackingNumber?: string;
  shippingAddress?: string;
}

type StatusVariant = 'warning' | 'accent' | 'default' | 'success' | 'error';

const statusFlow: OrderStatus[] = ['pending_payment', 'pending_ship', 'shipped', 'completed'];

const statusConfig: Record<OrderStatus, { label: string; variant: StatusVariant; icon: typeof Package; step: number }> = {
  pending_payment: { label: '待付款', variant: 'warning', icon: Clock, step: 0 },
  pending_ship: { label: '待發貨', variant: 'warning', icon: Package, step: 1 },
  shipped: { label: '已發貨', variant: 'accent', icon: Truck, step: 2 },
  completed: { label: '已完成', variant: 'success', icon: PackageCheck, step: 3 },
  cancelled: { label: '已取消', variant: 'default', icon: XCircle, step: -1 },
};

const tabs = [
  { id: 'all', label: '全部' },
  { id: 'pending_payment', label: '待付款' },
  { id: 'pending_ship', label: '待發貨' },
  { id: 'shipped', label: '運送中' },
  { id: 'completed', label: '已完成' },
];

function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 text-red-500 py-2">
        <XCircle className="w-5 h-5" />
        <span className="text-sm font-medium">訂單已取消</span>
      </div>
    );
  }

  const currentStep = statusConfig[status].step;

  const TimelineIcon = ({ s, isDone }: { s: OrderStatus; isDone: boolean }) => {
    if (isDone && s !== 'completed') return <CheckCircle className="w-4 h-4" />;
    const Icon = statusConfig[s].icon;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="flex items-center gap-0 py-2">
      {statusFlow.map((s, i) => {
        const isDone = i <= currentStep;
        const isCurrent = i === currentStep;
        return (
          <div key={s} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                isDone ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400',
                isCurrent ? 'ring-2 ring-indigo-600 ring-offset-2' : ''
              )}>
                <TimelineIcon s={s} isDone={isDone} />
              </div>
              <span className={cn('text-[10px] mt-1 whitespace-nowrap', isDone ? 'text-indigo-600 font-medium' : 'text-gray-400')}>
                {statusConfig[s].label}
              </span>
            </div>
            {i < statusFlow.length - 1 && (
              <div className={cn('flex-1 h-0.5 mx-1 mb-5', i < currentStep ? 'bg-indigo-600' : 'bg-gray-200')} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [trackingSearch, setTrackingSearch] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/orders?customerId=current');
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data.orders || data);
    } catch {
      setError('無法載入訂單');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === 'all' || order.status === activeTab;
    const matchesSearch = !trackingSearch.trim() ||
      order.id.toLowerCase().includes(trackingSearch.toLowerCase()) ||
      (order.trackingNumber || '').toLowerCase().includes(trackingSearch.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getCounts = () => {
    const counts: Record<string, number> = { all: orders.length };
    tabs.slice(1).forEach((tab) => {
      counts[tab.id] = orders.filter((o) => o.status === tab.id).length;
    });
    return counts;
  };

  const counts = getCounts();

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">追蹤訂單</h1>
        </div>

        <Card padding="md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="輸入訂單編號或物流追蹤碼查詢..."
              value={trackingSearch}
              onChange={(e) => setTrackingSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </Card>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              )}
            >
              {tab.label}
              {counts[tab.id] > 0 && (
                <span
                  className={cn(
                    'ml-1.5 px-1.5 py-0.5 rounded-full text-xs',
                    activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200 text-gray-600'
                  )}
                >
                  {counts[tab.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-500">載入中...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20">
            <XCircle className="w-16 h-16 text-red-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">無法載入訂單</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchOrders}>重試</Button>
          </div>
        )}

        {!loading && !error && (
          <AnimatePresence mode="wait">
            {filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className="w-32 h-32 rounded-full bg-gray-50 flex items-center justify-center mb-6"
                >
                  <Package className="w-16 h-16 text-gray-400" />
                </motion.div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {trackingSearch ? '找不到相符訂單' : '尚無訂單'}
                </h2>
                <p className="text-gray-600 mb-6">
                  {trackingSearch
                    ? '請確認訂單編號或追蹤碼是否正確'
                    : activeTab === 'all'
                    ? '開始購物，查看您的訂單'
                    : '目前沒有這個狀態的訂單'}
                </p>
                {trackingSearch && (
                  <Button onClick={() => setTrackingSearch('')}>清除搜尋</Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order, idx) => {
                  const statusInfo = statusConfig[order.status];
                  const StatusIcon = statusInfo.icon;
                  const isExpanded = expandedOrder === order.id;

                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                    >
                      <Card padding="none" className="overflow-hidden">
                        <div
                          className="p-4 cursor-pointer"
                          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{order.id}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                            </div>
                            <Badge variant={statusInfo.variant}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-medium text-gray-400">商店：</span>
                            <span className="text-sm text-gray-600">{order.merchantName}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {order.items.slice(0, 2).map((item) => (
                                <img
                                  key={item.id}
                                  src={`https://picsum.photos/seed/${item.image}/60/60`}
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded-lg bg-gray-50"
                                />
                              ))}
                              {order.items.length > 2 && (
                                <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-xs text-gray-400">
                                  +{order.items.length - 2}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-400">
                                共 {order.items.reduce((s, i) => s + i.quantity, 0)} 件
                              </p>
                              <p className="font-semibold text-indigo-600">{formatPrice(order.totalAmount)}</p>
                            </div>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="px-4 pb-4 border-t border-gray-200 pt-4 overflow-hidden"
                            >
                              <OrderTimeline status={order.status} />

                              {order.trackingNumber && (
                                <div className="flex items-center gap-2 mt-3 p-3 bg-indigo-50 rounded-lg">
                                  <Truck className="w-4 h-4 text-indigo-600" />
                                  <span className="text-sm text-gray-600">物流追蹤碼：</span>
                                  <span className="text-sm font-mono font-medium text-indigo-600">{order.trackingNumber}</span>
                                </div>
                              )}

                              {order.shippingAddress && (
                                <div className="flex items-start gap-2 mt-2 p-3 bg-gray-50 rounded-lg">
                                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                  <span className="text-sm text-gray-600">{order.shippingAddress}</span>
                                </div>
                              )}

                              <div className="space-y-3 mt-3">
                                {order.items.map((item) => (
                                  <div key={item.id} className="flex gap-3">
                                    <img
                                      src={`https://picsum.photos/seed/${item.image}/60/60`}
                                      alt={item.name}
                                      className="w-14 h-14 object-cover rounded-lg bg-gray-50 flex-shrink-0"
                                    />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                      <p className="text-xs text-gray-600">{item.variantName}</p>
                                      <p className="text-xs text-gray-400">x{item.quantity}</p>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 flex-shrink-0">
                                      {formatPrice(item.price * item.quantity)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        )}
      </div>
    </ClientLayout>
  );
}

export default OrdersPage;