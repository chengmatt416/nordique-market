'use client';

import { useState } from 'react';
import { MerchantLayout } from '@/components/layout/MerchantLayout';
import { Card, Badge } from '@/components/ui';
import { formatPrice, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const dateRanges = ['今日', '本週', '本月', '近三個月', '自訂'] as const;

const stats = [
  { label: '總訂單', value: 328, icon: '📦' },
  { label: '總營收', value: 892450, prefix: 'NT$', icon: '💰' },
  { label: '平均訂單金額', value: 2720, prefix: 'NT$', icon: '📊' },
  { label: '新客戶', value: 56, icon: '👤' },
];

const topProducts = [
  { rank: 1, name: '北歐簡約花瓶', sales: 45, revenue: 36000, trend: 12 },
  { rank: 2, name: '羊毛針織毯', sales: 38, revenue: 28500, trend: 8 },
  { rank: 3, name: '木質收納盒', sales: 32, revenue: 19200, trend: -3 },
  { rank: 4, name: '陶瓷咖啡杯組', sales: 28, revenue: 19600, trend: 5 },
  { rank: 5, name: 'LED氣氛燈', sales: 25, revenue: 18750, trend: -1 },
];

const categories = [
  { name: '家飾品', count: 156, percentage: 35 },
  { name: '家具', count: 98, percentage: 22 },
  { name: '燈具', count: 76, percentage: 17 },
  { name: '織品', count: 64, percentage: 14 },
  { name: '其他', count: 52, percentage: 12 },
];

export default function MerchantAnalytics() {
  const [selectedRange, setSelectedRange] = useState<typeof dateRanges[number]>('本月');

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
          {stats.map((stat, i) => (
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
          ))}
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
          </Card>

          <Card padding="none">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">類別分布</h2>
            </div>
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
          </Card>
        </div>
      </div>
    </MerchantLayout>
  );
}