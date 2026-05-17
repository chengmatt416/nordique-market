'use client';
import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, Badge, Button, Modal } from '@/components/ui';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ShoppingCart, Search, Eye, AlertTriangle, Loader2 } from 'lucide-react';
import { deobfuscate, deobfuscatePrice } from '@/lib/crypto';

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

const statusTabs = [
  { key: 'all', label: '全部', statuses: ['pending_payment', 'paid', 'shipped', 'completed', 'cancelled'] as OrderStatus[] },
  { key: 'pending_payment', label: '待付款', statuses: ['pending_payment'] as OrderStatus[] },
  { key: 'paid', label: '已付款', statuses: ['paid'] as OrderStatus[] },
  { key: 'shipped', label: '已發貨', statuses: ['shipped'] as OrderStatus[] },
  { key: 'completed', label: '已完成', statuses: ['completed'] as OrderStatus[] },
  { key: 'cancelled', label: '已取消', statuses: ['cancelled'] as OrderStatus[] },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/orders');
        if (!res.ok) throw new Error('無法載入訂單資料');
        const data = await res.json();
        const list: Order[] = (data.orders || []).map((o: any) => ({
          id: o.id,
          customerName: o.customerName || o.customer || '',
          merchantName: o.merchantName || '',
          items: (o.items || []).map((item: any) => item._e ? {
            name: deobfuscate(item.name || '', item.productId || ''),
            quantity: item.quantity || 1,
            price: deobfuscatePrice(item.price || '0', item.productId || ''),
          } : { name: item.name || '', quantity: item.quantity || 1, price: item.price || 0 }),
          total: o.total || 0,
          status: o.status || 'pending_payment',
          date: o.date || o.createdAt || '',
          hasDispute: o.hasDispute || false,
          disputeReason: o.disputeReason || '',
          shippingAddress: o.shippingAddress || '',
          phone: o.phone || '',
        }));
        setOrders(list);
      } catch (err) {
        setError(err instanceof Error ? err.message : '載入訂單失敗');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    setUpdating(true);
    try {
      await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch {
    } finally {
      setUpdating(false);
    }
  }

  const getCountByStatus = (statuses: OrderStatus[]) => {
    return orders.filter((o) => statuses.includes(o.status)).length;
  };

  const filteredOrders = orders.filter((order) => {
    const matchesTab =
      activeTab === 'all' ||
      statusTabs.find((t) => t.key === activeTab)?.statuses.includes(order.status);

    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const disputeOrders = orders.filter((o) => o.hasDispute);

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
          <ShoppingCart className="w-8 h-8 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">訂單管理</h1>
        </div>

        {disputeOrders.length > 0 && (
          <Card padding="md" className="border-red-500/50 bg-red-50">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="font-medium text-gray-900">
                目前有 {disputeOrders.length} 筆訂單存在糾紛，需要處理
              </span>
            </div>
          </Card>
        )}

        <Card padding="lg">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <span className="ml-3 text-gray-600">載入訂單資料中...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16">
              <AlertTriangle className="w-10 h-10 text-red-500 mb-3" />
              <p className="text-gray-900 font-medium mb-2">載入失敗</p>
              <p className="text-gray-600 text-sm mb-4">{error}</p>
              <Button
                variant="primary"
                onClick={() => window.location.reload()}
              >
                重新載入
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="text"
                    placeholder="搜尋訂單編號或客戶名稱..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded border border-gray-200 bg-white text-gray-900 placeholder:text-gray-600 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="flex gap-2 border-b border-gray-200">
                {statusTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                      activeTab === tab.key
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    )}
                  >
                    {tab.label} ({getCountByStatus(tab.statuses)})
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-600 border-b border-gray-200">
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
                          'border-b border-gray-200 last:border-0 transition-colors',
                          order.hasDispute ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50/50'
                        )}
                      >
                        <td className="py-3 font-medium text-gray-900">
                          {order.id}
                        </td>
                        <td className="py-3 text-gray-600">
                          {order.customerName}
                        </td>
                        <td className="py-3 text-gray-600">
                          {order.merchantName}
                        </td>
                        <td className="py-3 text-gray-600">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)} 件
                        </td>
                        <td className="py-3 font-medium text-indigo-600">
                          {formatPrice(order.total)}
                        </td>
                        <td className="py-3">{getStatusBadge(order.status, order.hasDispute)}</td>
                        <td className="py-3 text-gray-600">
                          {formatDate(order.date)}
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => handleViewDetail(order)}
                            className="p-2 rounded hover:bg-gray-50 transition-colors"
                            title="查看詳情"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredOrders.length === 0 && (
                  <div className="py-12 text-center text-gray-600">
                    沒有找到符合條件的訂單
                  </div>
                )}
              </div>
            </div>
          )}
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
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedOrder.id}
                </h3>
                <p className="text-sm text-gray-600">
                  {formatDate(selectedOrder.date)}
                </p>
              </div>
              {getStatusBadge(selectedOrder.status, selectedOrder.hasDispute)}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">客戶資訊</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">姓名：</span>
                  <span className="text-gray-900">{selectedOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-gray-600">電話：</span>
                  <span className="text-gray-900">{selectedOrder.phone}</span>
                </div>
              </div>
              <div className="mt-2 text-sm">
                <span className="text-gray-600">配送地址：</span>
                <span className="text-gray-900">{selectedOrder.shippingAddress}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">商家資訊</h4>
              <p className="text-sm text-gray-900">{selectedOrder.merchantName}</p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">商品明細</h4>
              <div className="space-y-2">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-gray-900">{item.name}</span>
                      <span className="text-gray-600"> x {item.quantity}</span>
                    </div>
                    <span className="text-gray-900">{formatPrice(item.price)}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                <span className="font-medium text-gray-900">總計</span>
                <span className="text-lg font-semibold text-indigo-600">
                  {formatPrice(selectedOrder.total)}
                </span>
              </div>
            </div>

            {selectedOrder.hasDispute && (
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-start gap-2 p-3 rounded bg-red-100">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-500">訂單糾紛</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedOrder.disputeReason}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-600 mb-3">變更狀態</h4>
              <div className="flex flex-wrap gap-2">
                {(selectedOrder.status === 'pending_payment') && (
                  <Button size="sm" onClick={() => updateOrderStatus(selectedOrder.id, 'paid')} loading={updating}>標記為已付款</Button>
                )}
                {(selectedOrder.status === 'paid') && (
                  <Button size="sm" onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')} loading={updating}>標記為已發貨</Button>
                )}
                {(selectedOrder.status === 'shipped') && (
                  <Button size="sm" onClick={() => updateOrderStatus(selectedOrder.id, 'completed')} loading={updating}>標記為已完成</Button>
                )}
                {!['cancelled', 'completed'].includes(selectedOrder.status) && (
                  <Button size="sm" variant="outline" onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')} loading={updating}>取消訂單</Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
