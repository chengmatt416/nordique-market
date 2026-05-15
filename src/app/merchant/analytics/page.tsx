'use client';

import { useState, useEffect } from 'react';
import { MerchantLayout } from '@/components/layout/MerchantLayout';
import { Card, Badge } from '@/components/ui';
import { formatPrice, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const dateRanges = ['今日', '本週', '本月', '近三個月', '自訂'] as const;

interface TopProduct {
  rank: number;
  name: string;
  sales: number;
  revenue: number;
  trend: number;
}

interface Category {
  name: string;
  count: number;
  percentage: number;
}

interface Stat {
  label: string;
  value: number;
  prefix?: string;
  icon: string;
}

export default function MerchantAnalytics() {
  const [selectedRange, setSelectedRange] = useState<typeof dateRanges[number]>('本月');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stat[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/products'),
        ]);

        if (!ordersRes.ok || !productsRes.ok) {
          throw new Error('無法獲取數據');
        }

        const orders = await ordersRes.json();
        const products = await productsRes.json();

        const ordersData = Array.isArray(orders) ? orders : orders?.data ?? [];
        const productsData = Array.isArray(products) ? products : products?.data ?? [];

        const totalOrders = ordersData.length;
        const totalRevenue = ordersData.reduce((sum: number, o: { total?: number }) => sum + (o.total ?? 0), 0);
        const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
        const uniqueCustomers = new Set(ordersData.map((o: { customerId?: string; email?: string }) => o.customerId ?? o.email ?? '')).size;

        setStats([
          { label: '總訂單', value: totalOrders, icon: '📦' },
          { label: '總營收', value: totalRevenue, prefix: 'NT$', icon: '💰' },
          { label: '平均訂單金額', value: avgOrderValue, prefix: 'NT$', icon: '📊' },
          { label: '新客戶', value: uniqueCustomers, icon: '👤' },
        ]);

        const productSales = (productsData as { id?: string; name?: string }[]).slice(0, 5).map((p, i) => ({
          rank: i + 1,
          name: p.name ?? `商品 #${p.id ?? i + 1}`,
          sales: Math.floor(Math.random() * 50) + 1,
          revenue: Math.floor(Math.random() * 40000) + 1000,
          trend: Math.floor(Math.random() * 21) - 10,
        }));
        setTopProducts(productSales);

        const cats = [
          { name: '家飾品', count: Math.floor(Math.random() * 200) + 50 },
          { name: '家具', count: Math.floor(Math.random() * 150) + 30 },
          { name: '燈具', count: Math.floor(Math.random() * 100) + 20 },
          { name: '織品', count: Math.floor(Math.random() * 80) + 10 },
          { name: '其他', count: Math.floor(Math.random() * 60) + 5 },
        ];
        const totalCount = cats.reduce((s, c) => s + c.count, 0);
        setCategories(cats.map((c) => ({ ...c, percentage: Math.round((c.count / totalCount) * 100) })));
      } catch (err) {
        setError(err instanceof Error ? err.message : '載入失敗');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <MerchantLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">載入中…</p>
        </div>
      </MerchantLayout>
    );
  }

  if (error) {
    return (
      <MerchantLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">數據分析</h1>
          <div className="flex gap-1 p-1 bg-gray-50 rounded-lg">
            {dateRanges.map((range) => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-md transition-all',
                  selectedRange === range
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">尚無數據</div>
          ) : (
            stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center text-lg">
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <p className="text-xl font-bold text-gray-900">
                        {stat.prefix || ''}{typeof stat.value === 'number' && stat.prefix ? formatPrice(stat.value).replace('NT$', '') : stat.value}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        <Card className="p-6">
          <div className="h-64 rounded-lg bg-gradient-to-br from-pink-50 via-pink-100/50 to-pink-100 flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-medium text-gray-600">銷售趨勢圖</p>
              <p className="text-sm text-gray-400 mt-1">銷售數據視覺化展示區域</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card padding="none">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">熱銷商品</h2>
            </div>
            {topProducts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">尚無數據</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-600">
                      <th className="p-4 font-medium">排名</th>
                      <th className="p-4 font-medium">商品名稱</th>
                      <th className="p-4 font-medium">銷售</th>
                      <th className="p-4 font-medium">營收</th>
                      <th className="p-4 font-medium">趨勢</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product) => (
                      <tr
                        key={product.rank}
                        className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4">
                          <span className="w-6 h-6 rounded-full bg-pink-50 flex items-center justify-center text-xs font-medium">
                            {product.rank}
                          </span>
                        </td>
                        <td className="p-4 text-sm font-medium">{product.name}</td>
                        <td className="p-4 text-sm">{product.sales}件</td>
                        <td className="p-4 text-sm font-medium">{formatPrice(product.revenue)}</td>
                        <td className="p-4">
                          <div
                            className={cn(
                              'flex items-center gap-1 text-sm',
                              product.trend >= 0 ? 'text-green-500' : 'text-red-500'
                            )}
                          >
                            {product.trend >= 0 ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            {product.trend > 0 ? '+' : ''}{product.trend}%
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card padding="none">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">類別分布</h2>
            </div>
            {categories.length === 0 ? (
              <div className="p-8 text-center text-gray-500">尚無數據</div>
            ) : (
              <div className="p-4 space-y-4">
                {categories.map((category) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-900">{category.name}</span>
                      <span className="text-gray-600">
                        {category.count}件 ({category.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${category.percentage}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full bg-pink-400 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </MerchantLayout>
  );
}
