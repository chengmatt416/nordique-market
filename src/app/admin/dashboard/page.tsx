'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, Badge, Button } from '@/components/ui';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Users,
  Store,
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Eye,
  UserPlus,
  ShoppingBag,
  Store as StoreIcon,
  Package as PackageIcon,
  ArrowUpRight,
  XCircle,
} from 'lucide-react';

const stats = [
  {
    label: '總用戶',
    value: '12,458',
    icon: Users,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    change: '+12%',
  },
  {
    label: '總商家',
    value: '328',
    icon: Store,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    change: '+5%',
  },
  {
    label: '總商品',
    value: '5,672',
    icon: Package,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    change: '+8%',
  },
  {
    label: '今日訂單',
    value: '156',
    icon: ShoppingCart,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    change: '+23%',
  },
  {
    label: '今日銷售額',
    value: 'NT$892,450',
    icon: DollarSign,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    change: '+18%',
  },
  {
    label: '待審核',
    value: '12',
    icon: AlertTriangle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    change: '-3%',
    warning: true,
  },
];

const merchantApprovals = [
  { id: 1, storeName: '北歐家居館', owner: '王小明', date: '2024-01-15', category: '家具' },
  { id: 2, storeName: '極簡生活選物', owner: '李佳怡', date: '2024-01-14', category: '生活用品' },
  { id: 3, storeName: '斯堪地那維亞美學', owner: '張志偉', date: '2024-01-14', category: '裝飾品' },
  { id: 4, storeName: '北歐童趣', owner: '陳雅惠', date: '2024-01-13', category: '母嬰用品' },
  { id: 5, storeName: '丹麥手作皮革', owner: '林建志', date: '2024-01-13', category: '皮革製品' },
];

const productReviews = [
  { id: 1, productName: '丹麥設計師單椅', merchant: '北歐家居館', date: '2024-01-15' },
  { id: 2, productName: '羊毛北歐地毯', merchant: '極簡生活選物', date: '2024-01-14' },
  { id: 3, productName: '木質收納櫃', merchant: '斯堪地那維亞美學', date: '2024-01-14' },
  { id: 4, productName: '嬰兒北歐床組', merchant: '北歐童趣', date: '2024-01-13' },
  { id: 5, productName: '皮革記事本', merchant: '丹麥手作皮革', date: '2024-01-13' },
];

const recentActivities = [
  { id: 1, icon: UserPlus, description: '新用戶註冊: john@example.com', time: '5分鐘前', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  { id: 2, icon: ShoppingBag, description: '新訂單: #ORD-2024-001', time: '12分鐘前', color: 'text-green-500', bgColor: 'bg-green-500/10' },
  { id: 3, icon: StoreIcon, description: '商家申請: 北歐家居館', time: '25分鐘前', color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  { id: 4, icon: PackageIcon, description: '商品上架: 丹麥設計師單椅', time: '38分鐘前', color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  { id: 5, icon: CheckCircle, description: '商家審核通過: 極簡生活選物', time: '1小時前', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
  { id: 6, icon: UserPlus, description: '新用戶註冊: mary@tmail.com', time: '1小時前', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  { id: 7, icon: ShoppingBag, description: '新訂單: #ORD-2024-002', time: '2小時前', color: 'text-green-500', bgColor: 'bg-green-500/10' },
  { id: 8, icon: AlertTriangle, description: '商品待審核: 羊毛北歐地毯', time: '2小時前', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  { id: 9, icon: StoreIcon, description: '商家申請: 斯堪地那維亞美學', time: '3小時前', color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  { id: 10, icon: PackageIcon, description: '商品下架: 舊款皮沙發', time: '4小時前', color: 'text-red-500', bgColor: 'bg-red-500/10' },
];

const systemStatuses = [
  { name: 'API 服務', status: '正常', details: '回應時間: 45ms' },
  { name: '資料庫', status: '正常', details: '連線數: 23/100' },
  { name: '檔案儲存', status: '正常', details: '使用空間: 2.3TB/5TB' },
  { name: '支付系統', status: '正常', details: '今日交易: 1,247筆' },
  { name: '郵件服務', status: '正常', details: '發送成功率: 99.9%' },
];

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">管理員儀表板</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">歡迎回來！以下是系統概覽</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Clock className="w-4 h-4" />
            <span>最後更新: {formatDate(new Date())}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className="relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
                    <p className={cn(
                      'text-2xl font-bold mt-1',
                      stat.warning ? 'text-yellow-500' : 'text-[var(--text-primary)]'
                    )}>
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                      <span className="text-xs text-emerald-500">{stat.change}</span>
                      <span className="text-xs text-[var(--text-secondary)]">較昨日</span>
                    </div>
                  </div>
                  <div className={cn('p-2 rounded-lg', stat.bgColor)}>
                    <stat.icon className={cn('w-5 h-5', stat.color)} />
                  </div>
                </div>
                {stat.warning && (
                  <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-500 rounded-full m-2" />
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card padding="none">
            <div className="p-4 border-b border-[var(--border)]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">商家申請審核</h2>
                <Badge variant="warning">{merchantApprovals.length} 筆待審核</Badge>
              </div>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {merchantApprovals.map((merchant) => (
                <div key={merchant.id} className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-[var(--text-primary)]">{merchant.storeName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-[var(--text-secondary)]">{merchant.owner}</span>
                      <span className="text-xs text-[var(--text-secondary)]">•</span>
                      <span className="text-xs text-[var(--text-secondary)]">{merchant.category}</span>
                      <span className="text-xs text-[var(--text-secondary)]">•</span>
                      <span className="text-xs text-[var(--text-secondary)]">{merchant.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary">
                      <XCircle className="w-4 h-4" />
                      拒絕
                    </Button>
                    <Button size="sm" variant="primary">
                      <CheckCircle className="w-4 h-4" />
                      核准
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-[var(--border)]">
              <Button variant="ghost" className="w-full" size="sm">
                <Eye className="w-4 h-4" />
                查看全部申請
              </Button>
            </div>
          </Card>

          <Card padding="none">
            <div className="p-4 border-b border-[var(--border)]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">商品審核</h2>
                <Badge variant="warning">{productReviews.length} 筆待審核</Badge>
              </div>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {productReviews.map((product) => (
                <div key={product.id} className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-[var(--text-primary)]">{product.productName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-[var(--text-secondary)]">{product.merchant}</span>
                      <span className="text-xs text-[var(--text-secondary)]">•</span>
                      <span className="text-xs text-[var(--text-secondary)]">{product.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary">
                      <XCircle className="w-4 h-4" />
                      拒絕
                    </Button>
                    <Button size="sm" variant="primary">
                      <CheckCircle className="w-4 h-4" />
                      核准
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-[var(--border)]">
              <Button variant="ghost" className="w-full" size="sm">
                <Eye className="w-4 h-4" />
                查看全部審核
              </Button>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card padding="none" className="lg:col-span-2">
            <div className="p-4 border-b border-[var(--border)]">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">最近活動</h2>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--secondary)] transition-colors"
                >
                  <div className={cn('p-2 rounded-lg flex-shrink-0', activity.bgColor)}>
                    <activity.icon className={cn('w-4 h-4', activity.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-primary)] truncate">{activity.description}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{activity.time}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[var(--text-secondary)] flex-shrink-0" />
                </motion.div>
              ))}
            </div>
          </Card>

          <Card padding="none">
            <div className="p-4 border-b border-[var(--border)]">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">系統狀態</h2>
            </div>
            <div className="p-4 space-y-4">
              {systemStatuses.map((system) => (
                <div key={system.name} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{system.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{system.details}</p>
                  </div>
                  <Badge variant="success">正常</Badge>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-[var(--border)]">
              <div className="flex items-center justify-center gap-2 text-sm text-emerald-500">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                所有系統運行正常
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}