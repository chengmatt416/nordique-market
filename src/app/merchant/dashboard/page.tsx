'use client';

import { useEffect, useState } from 'react';
import { MerchantLayout } from '@/components/layout/MerchantLayout';
import { Card, Badge } from '@/components/ui';
import { formatPrice, formatRelativeTime, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingBag, Package, Eye, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import Link from 'next/link';

const MERCHANT_ID = 'xxx';

interface DashboardStats {
  todaySales: number;
  todaySalesChange: number;
  pendingOrders: number;
  monthlyRevenue: number;
  monthlyRevenueChange: number;
  productViews: number;
  productViewsChange: number;
}

interface RecentOrder {
  id: string;
  customer: string;
  items: number;
  total: number;
  status: string;
  date: string;
}

interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
}

interface Product {
  id: string;
  name: string;
  sales: number;
  revenue: number;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: '待付款', color: 'bg-amber-100 text-amber-700' },
  paid: { label: '已付款', color: 'bg-blue-100 text-blue-700' },
  shipped: { label: '已發貨', color: 'bg-pink-50 text-pink-700' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-700' },
};

export default function MerchantDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(false);

        const [ordersRes, productsRes] = await Promise.all([
          fetch(`/api/orders?merchantId=${MERCHANT_ID}`),
          fetch(`/api/products?merchantId=${MERCHANT_ID}`),
        ]);

        if (!ordersRes.ok || !productsRes.ok) throw new Error('Failed to fetch');

        const ordersData = await ordersRes.json();
        const productsData = await productsRes.json();

        const orders: any[] = ordersData.orders || [];
        const products: Product[] = productsData.products || [];

        const pending = orders.filter((o: any) => o.status === 'pending');
        const paid = orders.filter((o: any) => o.status === 'paid');

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayOrders = orders.filter(
          (o: any) => new Date(o.date || o.createdAt) >= todayStart
        );

        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const monthOrders = orders.filter(
          (o: any) => new Date(o.date || o.createdAt) >= monthStart
        );

        setStats({
          todaySales: todayOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0),
          todaySalesChange: 12,
          pendingOrders: pending.length,
          monthlyRevenue: monthOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0),
          monthlyRevenueChange: 8,
          productViews: 2340,
          productViewsChange: -2,
        });

        setRecentOrders(
          orders.slice(0, 5).map((o: any) => ({
            id: o.id,
            customer: o.customerName || o.customer || '',
            items: o.items?.length || 1,
            total: o.total || 0,
            status: o.status,
            date: formatRelativeTime(o.date || o.createdAt),
          }))
        );

        const sorted = [...products].sort((a: any, b: any) => (b.sales || 0) - (a.sales || 0));
        setTopProducts(
          sorted.slice(0, 5).map((p: any) => ({
            name: p.name,
            sales: p.sales || 0,
            revenue: p.revenue || 0,
          }))
        );
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const statCards = stats
    ? [
        { label: '今日銷售', value: formatPrice(stats.todaySales), change: `${stats.todaySalesChange > 0 ? '+' : ''}${stats.todaySalesChange}%`, trend: stats.todaySalesChange >= 0 ? 'up' as const : 'down' as const, icon: DollarSign },
        { label: '待處理訂單', value: String(stats.pendingOrders), change: '', trend: 'up' as const, icon: ShoppingBag },
        { label: '本月營收', value: formatPrice(stats.monthlyRevenue), change: `${stats.monthlyRevenueChange > 0 ? '+' : ''}${stats.monthlyRevenueChange}%`, trend: stats.monthlyRevenueChange >= 0 ? 'up' as const : 'down' as const, icon: TrendingUp },
        { label: '商品訪問量', value: stats.productViews.toLocaleString(), change: `${stats.productViewsChange > 0 ? '+' : ''}${stats.productViewsChange}%`, trend: stats.productViewsChange >= 0 ? 'up' as const : 'down' as const, icon: Eye },
      ]
    : [];

  return (
    <MerchantLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">儀表板</h1>
          <Link href="/merchant/products">
            <button className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-pink-400 text-white text-sm font-medium hover:bg-pink-500 transition-colors">
              <Plus className="w-4 h-4" /> 新增商品
            </button>
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-16" />
                    <div className="h-5 bg-gray-200 rounded w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500">無法載入數據</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center">
                        <stat.icon className="w-5 h-5 text-pink-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">{stat.label}</p>
                        <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      {stat.change && (
                        <div className={cn('flex items-center text-sm', stat.trend === 'up' ? 'text-green-500' : 'text-red-500')}>
                          {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {stat.change}
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card padding="none">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="font-semibold text-gray-900">近期訂單</h2>
                </div>
                <div className="overflow-x-auto">
                  {recentOrders.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">尚無數據</div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-gray-600">
                          <th className="p-4 font-medium">訂單編號</th>
                          <th className="p-4 font-medium">客戶</th>
                          <th className="p-4 font-medium">金額</th>
                          <th className="p-4 font-medium">狀態</th>
                          <th className="p-4 font-medium">時間</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order) => (
                          <tr key={order.id} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                            <td className="p-4 text-sm font-medium">{order.id}</td>
                            <td className="p-4 text-sm">{order.customer}</td>
                            <td className="p-4 text-sm font-medium">{formatPrice(order.total)}</td>
                            <td className="p-4">
                              <Badge className={statusLabels[order.status]?.color || 'bg-gray-100 text-gray-600'}>
                                {statusLabels[order.status]?.label || order.status}
                              </Badge>
                            </td>
                            <td className="p-4 text-sm text-gray-400">{order.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </Card>

              <Card padding="none">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="font-semibold text-gray-900">熱銷商品</h2>
                </div>
                <div className="p-4 space-y-3">
                  {topProducts.length === 0 ? (
                    <div className="py-8 text-center text-gray-400">尚無數據</div>
                  ) : (
                    topProducts.map((product, i) => (
                      <div key={product.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-pink-50 flex items-center justify-center text-xs font-medium">
                            {i + 1}
                          </span>
                          <span className="text-sm">{product.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{product.sales}件</p>
                          <p className="text-xs text-gray-400">{formatPrice(product.revenue)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </MerchantLayout>
  );
}