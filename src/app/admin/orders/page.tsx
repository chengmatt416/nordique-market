'use client';
import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, Badge, Button, Modal } from '@/components/ui';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ShoppingCart, Search, Eye, AlertTriangle } from 'lucide-react';

type OrderStatus = 'pending_payment' | 'paid' | 'shipped' | 'completed' | 'cancelled';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customerName: string;
  merchantName: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  date: string;
  hasDispute: boolean;
  disputeReason?: string;
  shippingAddress: string;
  phone: string;
}

const sampleOrders: Order[] = [
  {
    id: 'ORD-2024-001',
    customerName: '王小明',
    merchantName: '北歐時尚館',
    items: [
      { name: '北歐羊毛大衣', quantity: 1, price: 5999 },
    ],
    total: 5999,
    status: 'completed',
    date: '2024-01-20',
    hasDispute: false,
    shippingAddress: '台北市信義區忠孝東路一段100號',
    phone: '0912-345-678',
  },
  {
    id: 'ORD-2024-002',
    customerName: '陳雅琳',
    merchantName: '北歐居家',
    items: [
      { name: '極簡木質家具套組', quantity: 1, price: 12999 },
      { name: '北歐實木書架', quantity: 1, price: 4599 },
    ],
    total: 17598,
    status: 'shipped',
    date: '2024-01-21',
    hasDispute: false,
    shippingAddress: '新北市板橋區中山路一段200號',
    phone: '0923-456-789',
  },
  {
    id: 'ORD-2024-003',
    customerName: '林志偉',
    merchantName: '光影美學',
    items: [
      { name: '斯堪地那維亞設計燈具', quantity: 2, price: 3499 },
    ],
    total: 6998,
    status: 'paid',
    date: '2024-01-22',
    hasDispute: false,
    shippingAddress: '桃園市桃園區中山路300號',
    phone: '0934-567-890',
  },
  {
    id: 'ORD-2024-004',
    customerName: '張淑芬',
    merchantName: '餐桌美學',
    items: [
      { name: '北歐風陶瓷餐具組', quantity: 1, price: 1899 },
    ],
    total: 1899,
    status: 'pending_payment',
    date: '2024-01-22',
    hasDispute: false,
    shippingAddress: '台中市西屯區台灣大道400號',
    phone: '0945-678-901',
  },
  {
    id: 'ORD-2024-005',
    customerName: '黃建志',
    merchantName: '北歐時尚館',
    items: [
      { name: '北歐羊毛大衣', quantity: 1, price: 5999 },
      { name: '北歐風抱枕套組', quantity: 2, price: 799 },
    ],
    total: 7597,
    status: 'paid',
    date: '2024-01-21',
    hasDispute: true,
    disputeReason: '商品與描述不符',
    shippingAddress: '高雄市苓雅區中山二路500號',
    phone: '0956-789-012',
  },
  {
    id: 'ORD-2024-006',
    customerName: '李美玲',
    merchantName: '質感生活',
    items: [
      { name: '極簡主義掛鐘', quantity: 1, price: 1299 },
      { name: '北歐鋁框全身鏡', quantity: 1, price: 2199 },
    ],
    total: 3498,
    status: 'cancelled',
    date: '2024-01-19',
    hasDispute: false,
    shippingAddress: '台南市東區中華東路600號',
    phone: '0967-890-123',
  },
  {
    id: 'ORD-2024-007',
    customerName: '周大偉',
    merchantName: '北歐居家',
    items: [
      { name: '極簡木質家具套組', quantity: 1, price: 12999 },
    ],
    total: 12999,
    status: 'completed',
    date: '2024-01-18',
    hasDispute: true,
    disputeReason: '商品損壞',
    shippingAddress: '新竹市東區光復路700號',
    phone: '0978-901-234',
  },
  {
    id: 'ORD-2024-008',
    customerName: '吳雅琪',
    merchantName: '地面美學',
    items: [
      { name: '斯堪地那維亞地毯', quantity: 1, price: 3999 },
    ],
    total: 3999,
    status: 'shipped',
    date: '2024-01-20',
    hasDispute: false,
    shippingAddress: '彰化縣彰化市中山路800號',
    phone: '0989-012-345',
  },
  {
    id: 'ORD-2024-009',
    customerName: '鄭偉民',
    merchantName: '時間美學',
    items: [
      { name: '極簡主義掛鐘', quantity: 1, price: 1299 },
    ],
    total: 1299,
    status: 'pending_payment',
    date: '2024-01-23',
    hasDispute: false,
    shippingAddress: '雲林縣斗六市中山路900號',
    phone: '0990-123-456',
  },
  {
    id: 'ORD-2024-010',
    customerName: '楊曉彤',
    merchantName: '質感生活',
    items: [
      { name: '北歐風抱枕套組', quantity: 3, price: 799 },
      { name: '北歐鋁框全身鏡', quantity: 1, price: 2199 },
    ],
    total: 4596,
    status: 'paid',
    date: '2024-01-22',
    hasDispute: false,
    shippingAddress: '屏東縣屏東市中山路1000號',
    phone: '0901-234-567',
  },
];

const statusTabs = [
  { key: 'all', label: '全部', statuses: ['pending_payment', 'paid', 'shipped', 'completed', 'cancelled'] as OrderStatus[] },
  { key: 'pending_payment', label: '待付款', statuses: ['pending_payment'] as OrderStatus[] },
  { key: 'paid', label: '已付款', statuses: ['paid'] as OrderStatus[] },
  { key: 'shipped', label: '已發貨', statuses: ['shipped'] as OrderStatus[] },
  { key: 'completed', label: '已完成', statuses: ['completed'] as OrderStatus[] },
  { key: 'cancelled', label: '已取消', statuses: ['cancelled'] as OrderStatus[] },
];

export default function AdminOrdersPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const getCountByStatus = (statuses: OrderStatus[]) => {
    return sampleOrders.filter((o) => statuses.includes(o.status)).length;
  };

  const filteredOrders = sampleOrders.filter((order) => {
    const matchesTab =
      activeTab === 'all' ||
      statusTabs.find((t) => t.key === activeTab)?.statuses.includes(order.status);

    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const disputeOrders = sampleOrders.filter((o) => o.hasDispute);

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status: OrderStatus, hasDispute: boolean) => {
    if (hasDispute) {
      return <Badge variant="error">有糾紛</Badge>;
    }

    switch (status) {
      case 'pending_payment':
        return <Badge variant="warning">待付款</Badge>;
      case 'paid':
        return <Badge variant="accent">已付款</Badge>;
      case 'shipped':
        return <Badge variant="default">已發貨</Badge>;
      case 'completed':
        return <Badge variant="success">已完成</Badge>;
      case 'cancelled':
        return <Badge variant="error">已取消</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-[var(--primary)]" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">訂單管理</h1>
        </div>

        {disputeOrders.length > 0 && (
          <Card padding="md" className="border-[var(--error)]/50 bg-[var(--error)]/5">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-[var(--error)]" />
              <span className="font-medium text-[var(--text-primary)]">
                目前有 {disputeOrders.length} 筆訂單存在糾紛，需要處理
              </span>
            </div>
          </Card>
        )}

        <Card padding="lg">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  placeholder="搜尋訂單編號或客戶名稱..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>

            <div className="flex gap-2 border-b border-[var(--border)]">
              {statusTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                    activeTab === tab.key
                      ? 'border-[var(--primary)] text-[var(--primary)]'
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  )}
                >
                  {tab.label} ({getCountByStatus(tab.statuses)})
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-[var(--text-secondary)] border-b border-[var(--border)]">
                    <th className="pb-3 font-medium">訂單編號</th>
                    <th className="pb-3 font-medium">客戶名稱</th>
                    <th className="pb-3 font-medium">商家</th>
                    <th className="pb-3 font-medium">商品數量</th>
                    <th className="pb-3 font-medium">總金額</th>
                    <th className="pb-3 font-medium">狀態</th>
                    <th className="pb-3 font-medium">日期</th>
                    <th className="pb-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className={cn(
                        'border-b border-[var(--border)] last:border-0 transition-colors',
                        order.hasDispute ? 'bg-[var(--error)]/5 hover:bg-[var(--error)]/10' : 'hover:bg-[var(--secondary)]/50'
                      )}
                    >
                      <td className="py-3 font-medium text-[var(--text-primary)]">
                        {order.id}
                      </td>
                      <td className="py-3 text-[var(--text-secondary)]">
                        {order.customerName}
                      </td>
                      <td className="py-3 text-[var(--text-secondary)]">
                        {order.merchantName}
                      </td>
                      <td className="py-3 text-[var(--text-secondary)]">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} 件
                      </td>
                      <td className="py-3 font-medium text-[var(--primary)]">
                        {formatPrice(order.total)}
                      </td>
                      <td className="py-3">{getStatusBadge(order.status, order.hasDispute)}</td>
                      <td className="py-3 text-[var(--text-secondary)]">
                        {formatDate(order.date)}
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => handleViewDetail(order)}
                          className="p-2 rounded-[var(--radius-sm)] hover:bg-[var(--secondary)] transition-colors"
                          title="查看詳情"
                        >
                          <Eye className="w-4 h-4 text-[var(--text-secondary)]" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredOrders.length === 0 && (
                <div className="py-12 text-center text-[var(--text-secondary)]">
                  沒有找到符合條件的訂單
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="訂單詳情"
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  {selectedOrder.id}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {formatDate(selectedOrder.date)}
                </p>
              </div>
              {getStatusBadge(selectedOrder.status, selectedOrder.hasDispute)}
            </div>

            <div className="border-t border-[var(--border)] pt-4">
              <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">客戶資訊</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-[var(--text-secondary)]">姓名：</span>
                  <span className="text-[var(--text-primary)]">{selectedOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-[var(--text-secondary)]">電話：</span>
                  <span className="text-[var(--text-primary)]">{selectedOrder.phone}</span>
                </div>
              </div>
              <div className="mt-2 text-sm">
                <span className="text-[var(--text-secondary)]">配送地址：</span>
                <span className="text-[var(--text-primary)]">{selectedOrder.shippingAddress}</span>
              </div>
            </div>

            <div className="border-t border-[var(--border)] pt-4">
              <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">商家資訊</h4>
              <p className="text-sm text-[var(--text-primary)]">{selectedOrder.merchantName}</p>
            </div>

            <div className="border-t border-[var(--border)] pt-4">
              <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">商品明細</h4>
              <div className="space-y-2">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-[var(--text-primary)]">{item.name}</span>
                      <span className="text-[var(--text-secondary)]"> x {item.quantity}</span>
                    </div>
                    <span className="text-[var(--text-primary)]">{formatPrice(item.price)}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border)]">
                <span className="font-medium text-[var(--text-primary)]">總計</span>
                <span className="text-lg font-semibold text-[var(--primary)]">
                  {formatPrice(selectedOrder.total)}
                </span>
              </div>
            </div>

            {selectedOrder.hasDispute && (
              <div className="border-t border-[var(--border)] pt-4">
                <div className="flex items-start gap-2 p-3 rounded-[var(--radius-sm)] bg-[var(--error)]/10">
                  <AlertTriangle className="w-4 h-4 text-[var(--error)] mt-0.5" />
                  <div>
                    <p className="font-medium text-[var(--error)]">訂單糾紛</p>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                      {selectedOrder.disputeReason}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}