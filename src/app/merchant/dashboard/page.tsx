'use client';

import { MerchantLayout } from '@/components/layout/MerchantLayout';
import { Card, Badge, Button } from '@/components/ui';
import { formatPrice, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingBag, Package, Eye, TrendingUp, TrendingDown, Clock, MoreVertical, Plus } from 'lucide-react';
import Link from 'next/link';

const stats = [
  { label: '今日銷售', value: 'NT$12,580', change: '+12%', trend: 'up', icon: DollarSign },
  { label: '待處理訂單', value: '8', change: '+3', trend: 'up', icon: ShoppingBag },
  { label: '本月營收', value: 'NT$156,780', change: '+8%', trend: 'up', icon: TrendingUp },
  { label: '商品訪問量', value: '2,340', change: '-2%', trend: 'down', icon: Eye },
];

const recentOrders = [
  { id: 'ORD-2024-001', customer: '王小明', items: 3, total: 1280, status: 'pending', time: '5分鐘前' },
  { id: 'ORD-2024-002', customer: '陳小姐', items: 1, total: 899, status: 'paid', time: '15分鐘前' },
  { id: 'ORD-2024-003', customer: '林先生', items: 5, total: 3490, status: 'shipped', time: '1小時前' },
  { id: 'ORD-2024-004', customer: '張大妞', items: 2, total: 650, status: 'paid', time: '2小時前' },
  { id: 'ORD-2024-005', customer: '李小龍', items: 1, total: 1299, status: 'pending', time: '3小時前' },
];

const topProducts = [
  { name: '北歐簡約花瓶', sales: 45, revenue: 36000 },
  { name: '羊毛針織毯', sales: 38, revenue: 28500 },
  { name: '木質收納盒', sales: 32, revenue: 19200 },
  { name: '陶瓷咖啡杯組', sales: 28, revenue: 19600 },
  { name: 'LED氣氛燈', sales: 25, revenue: 18750 },
];

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: '待付款', color: 'bg-amber-100 text-amber-700' },
  paid: { label: '已付款', color: 'bg-blue-100 text-blue-700' },
  shipped: { label: '已發貨', color: 'bg-pink-50 text-pink-700' },
  delivered: { label: '已完成', color: 'bg-green-100 text-green-700' },
};

export default function MerchantDashboard() {
  return (
    <MerchantLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">儀表板</h1>
          <div className="flex gap-3">
            <Link href="/merchant/products">
              <Button variant="primary" size="sm">
                <Plus className="w-4 h-4 mr-1" /> 新增商品
              </Button>
            </Link>
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
                  <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-pink-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`flex items-center text-sm ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {stat.change}
                  </div>
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
                        <Badge className={statusLabels[order.status].color}>
                          {statusLabels[order.status].label}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-gray-400">{order.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card padding="none">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">熱銷商品</h2>
            </div>
            <div className="p-4 space-y-3">
              {topProducts.map((product, i) => (
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
              ))}
            </div>
          </Card>
        </div>
      </div>
    </MerchantLayout>
  );
}