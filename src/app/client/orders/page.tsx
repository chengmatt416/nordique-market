'use client';
import { useState } from 'react';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Button, Card, Badge } from '@/components/ui';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Package, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';

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
  orderNumber: string;
  date: string;
  status: OrderStatus;
  merchantName: string;
  items: OrderItem[];
  total: number;
}

const orders: Order[] = [
  {
    id: '1',
    orderNumber: 'AURA-2024-001234',
    date: '2024-01-15T10:30:00',
    status: 'pending_payment',
    merchantName: '北歐家居館',
    items: [
      {
        id: '1',
        name: '北歐簡約陶瓷花瓶',
        variantName: '米白色 / 中型',
        price: 1280,
        quantity: 1,
        image: 'vase-1',
      },
    ],
    total: 1340,
  },
  {
    id: '2',
    orderNumber: 'AURA-2024-001235',
    date: '2024-01-14T15:20:00',
    status: 'pending_ship',
    merchantName: '設計師工坊',
    items: [
      {
        id: '2',
        name: '極簡木質時鐘',
        variantName: '胡桃木色',
        price: 980,
        quantity: 1,
        image: 'clock-1',
      },
      {
        id: '3',
        name: '創意壁掛收納架',
        variantName: '淺木色',
        price: 1680,
        quantity: 1,
        image: 'shelf-1',
      },
    ],
    total: 2720,
  },
  {
    id: '3',
    orderNumber: 'AURA-2024-001236',
    date: '2024-01-12T09:15:00',
    status: 'shipped',
    merchantName: '質感生活',
    items: [
      {
        id: '4',
        name: '純棉舒眠枕頭套',
        variantName: '白色 / 標準尺寸',
        price: 580,
        quantity: 2,
        image: 'pillow-1',
      },
    ],
    total: 1220,
  },
  {
    id: '4',
    orderNumber: 'AURA-2024-001237',
    date: '2024-01-10T14:45:00',
    status: 'completed',
    merchantName: '北歐家居館',
    items: [
      {
        id: '5',
        name: '手工羊毛針織毯',
        variantName: '淺灰色',
        price: 2480,
        quantity: 1,
        image: 'blanket-1',
      },
      {
        id: '6',
        name: '北歐簡約陶瓷花瓶',
        variantName: '米白色 / 小型',
        price: 880,
        quantity: 1,
        image: 'vase-2',
      },
    ],
    total: 3520,
  },
  {
    id: '5',
    orderNumber: 'AURA-2024-001238',
    date: '2024-01-08T11:00:00',
    status: 'completed',
    merchantName: '設計師工坊',
    items: [
      {
        id: '7',
        name: '實木簡約書桌',
        variantName: '胡桃木色 / 120cm',
        price: 5800,
        quantity: 1,
        image: 'desk-1',
      },
    ],
    total: 5860,
  },
  {
    id: '6',
    orderNumber: 'AURA-2024-001239',
    date: '2024-01-05T16:30:00',
    status: 'cancelled',
    merchantName: '質感生活',
    items: [
      {
        id: '8',
        name: '抗菌防螨床墊',
        variantName: '標準雙人',
        price: 4200,
        quantity: 1,
        image: 'mattress-1',
      },
    ],
    total: 4260,
  },
];

const statusConfig: Record<
  OrderStatus,
  { label: string; variant: 'warning' | 'accent' | 'default' | 'success' | 'error'; icon: typeof Package }
> = {
  pending_payment: { label: '待付款', variant: 'warning', icon: Clock },
  pending_ship: { label: '待發貨', variant: 'accent', icon: Package },
  shipped: { label: '已發貨', variant: 'accent', icon: Truck },
  completed: { label: '已完成', variant: 'success', icon: CheckCircle },
  cancelled: { label: '已取消', variant: 'default', icon: XCircle },
};

const tabs = [
  { id: 'all', label: '全部' },
  { id: 'pending_payment', label: '待付款' },
  { id: 'pending_ship', label: '待發貨' },
  { id: 'shipped', label: '已發貨' },
  { id: 'completed', label: '已完成' },
];

function OrdersPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const filteredOrders =
    activeTab === 'all'
      ? orders
      : orders.filter((order) => order.status === activeTab);

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
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">我的訂單</h1>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                activeTab === tab.id
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--secondary)]'
              )}
            >
              {tab.label}
              {counts[tab.id] > 0 && (
                <span
                  className={cn(
                    'ml-1.5 px-1.5 py-0.5 rounded-full text-xs',
                    activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-[var(--border)]'
                  )}
                >
                  {counts[tab.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="w-32 h-32 rounded-full bg-[var(--secondary)] flex items-center justify-center mb-6"
            >
              <Package className="w-16 h-16 text-[var(--text-muted)]" />
            </motion.div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
              尚無訂單
            </h2>
            <p className="text-[var(--text-secondary)] mb-6">
              {activeTab === 'all'
                ? '開始購物，查看您的訂單'
                : '目前沒有這個狀態的訂單'}
            </p>
            <Button onClick={() => setActiveTab('all')}>查看所有訂單</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusInfo = statusConfig[order.status];
              const StatusIcon = statusInfo.icon;
              const isExpanded = expandedOrder === order.id;

              return (
                <Card
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  padding="none"
                  className="overflow-hidden"
                >
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() =>
                      setExpandedOrder(isExpanded ? null : order.id)
                    }
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {order.orderNumber}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">
                          {formatDate(order.date)}
                        </p>
                      </div>
                      <Badge variant={statusInfo.variant}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-medium text-[var(--text-muted)]">
                        商店：
                      </span>
                      <span className="text-sm text-[var(--text-secondary)]">
                        {order.merchantName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {order.items.slice(0, 2).map((item) => {
                          return (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              key={item.id}
                              src={`https://picsum.photos/seed/${item.image}/60/60`}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded bg-[var(--secondary)]"
                            />
                          );
                        })}
                        {order.items.length > 2 && (
                          <div className="w-12 h-12 rounded bg-[var(--secondary)] flex items-center justify-center text-xs text-[var(--text-muted)]">
                            +{order.items.length - 2}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[var(--text-muted)]">
                          共 {order.items.reduce((s, i) => s + i.quantity, 0)} 件
                        </p>
                        <p className="font-semibold text-[var(--primary)]">
                          {formatPrice(order.total)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-4 pb-4 border-t border-[var(--border)] pt-4"
                    >
                      <div className="space-y-3">
                        {order.items.map((item) => {
                          return (
                            <div key={item.id} className="flex gap-3">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={`https://picsum.photos/seed/${item.image}/60/60`}
                                alt={item.name}
                                className="w-14 h-14 object-cover rounded bg-[var(--secondary)]"
                              />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-[var(--text-primary)]">
                                {item.name}
                              </p>
                              <p className="text-xs text-[var(--text-secondary)]">
                                {item.variantName}
                              </p>
                              <p className="text-xs text-[var(--text-muted)]">
                                x{item.quantity}
                              </p>
                            </div>
                            <p className="text-sm font-medium text-[var(--text-primary)]">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                          );
                        })}
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Badge variant="default">查看詳情</Badge>
                      </div>
                    </motion.div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ClientLayout>
  );
}

export default OrdersPage;