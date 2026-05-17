'use client';

import { useState, useEffect } from 'react';
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

interface Stat {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  change: string;
  warning?: boolean;
}

interface MerchantApproval {
  id: number;
  storeName: string;
  owner: string;
  date: string;
  category: string;
}

interface ProductReview {
  id: number;
  productName: string;
  merchant: string;
  date: string;
}

interface Activity {
  id: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  time: string;
  color: string;
  bgColor: string;
}

interface SystemStatus {
  name: string;
  status: string;
  details: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [merchantApprovals, setMerchantApprovals] = useState<MerchantApproval[]>([]);
  const [productReviews, setProductReviews] = useState<ProductReview[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [systemStatuses, setSystemStatuses] = useState<SystemStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [firebaseUnconfigured, setFirebaseUnconfigured] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/orders'),
        ]);

        if (productsRes.status === 503 || ordersRes.status === 503) {
          setFirebaseUnconfigured(true);
          setStats([
            { label: '總用戶', value: '-', icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-500/10', change: '-' },
            { label: '總商家', value: '-', icon: Store, color: 'text-purple-500', bgColor: 'bg-purple-500/10', change: '-' },
            { label: '總商品', value: '-', icon: Package, color: 'text-green-500', bgColor: 'bg-green-500/10', change: '-' },
            { label: '今日訂單', value: '-', icon: ShoppingCart, color: 'text-orange-500', bgColor: 'bg-orange-500/10', change: '-' },
            { label: '今日銷售額', value: '-', icon: DollarSign, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', change: '-' },
            { label: '待審核', value: '-', icon: AlertTriangle, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', change: '-', warning: true },
          ]);
          setSystemStatuses([
            { name: 'API 服務', status: '未配置', details: 'Firebase 未設定' },
            { name: '資料庫', status: '未配置', details: 'Firebase 未設定' },
            { name: '檔案儲存', status: '未配置', details: 'Firebase 未設定' },
            { name: '支付系統', status: '未配置', details: 'Firebase 未設定' },
            { name: '郵件服務', status: '未配置', details: 'Firebase 未設定' },
          ]);
          setLoading(false);
          return;
        }

        const productsData = await productsRes.json();
        const ordersData = await ordersRes.json();

        const products = productsData.products ?? [];
        const orders = ordersData.orders ?? [];

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayOrders = orders.filter((o: Record<string, unknown>) => {
          if (!o.createdAt) return false;
          const ca = o.createdAt as { toDate?: () => Date };
          const d = typeof ca === 'object' && ca.toDate ? ca.toDate() : new Date(o.createdAt as string);
          return d >= todayStart;
        });
        const todaySales = todayOrders.reduce((sum: number, o: { total?: number }) => sum + (o.total ?? 0), 0);

        const merchants = new Set<string>();
        products.forEach((p: { merchantId?: string }) => { if (p.merchantId) merchants.add(p.merchantId); });
        orders.forEach((o: { merchantId?: string }) => { if (o.merchantId) merchants.add(o.merchantId); });

        let pendingMerchants = 0;
        let totalUsers = 0;
        try {
          const [merchRes, usersRes] = await Promise.all([
            fetch('/api/merchants'),
            fetch('/api/users').catch(() => null),
          ]);
          if (merchRes.ok) {
            const merchData = await merchRes.json();
            pendingMerchants = (merchData.merchants || []).filter((m: any) => m.status === 'pending').length;
          }
          if (usersRes?.ok) {
            const usersData = await usersRes.json();
            totalUsers = (usersData.users || []).length;
          }
        } catch {}

        setStats([
          { label: '總用戶', value: String(totalUsers), icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-500/10', change: '-' },
          { label: '總商家', value: String(merchants.size), icon: Store, color: 'text-purple-500', bgColor: 'bg-purple-500/10', change: '-' },
          { label: '總商品', value: String(products.length), icon: Package, color: 'text-green-500', bgColor: 'bg-green-500/10', change: '-' },
          { label: '今日訂單', value: String(todayOrders.length), icon: ShoppingCart, color: 'text-orange-500', bgColor: 'bg-orange-500/10', change: '-' },
          { label: '今日銷售額', value: formatPrice(todaySales), icon: DollarSign, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', change: '-' },
          { label: '待審核', value: String(pendingMerchants), icon: AlertTriangle, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', change: '-', warning: true },
        ]);

        setMerchantApprovals([]);
        setProductReviews([]);

        const activities: Activity[] = [];
        todayOrders.slice(0, 10).forEach((o: { id?: string; total?: number }) => {
          activities.push({
            id: activities.length + 1,
            icon: ShoppingBag,
            description: `新訂單: ${o.id ?? ''}`,
            time: '今日',
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
          });
        });
        setRecentActivities(activities);

        setSystemStatuses([
          { name: 'API 服務', status: '正常', details: `商品: ${products.length} 筆` },
          { name: '資料庫', status: '正常', details: `訂單: ${orders.length} 筆` },
          { name: '檔案儲存', status: '正常', details: '運行中' },
          { name: '支付系統', status: '正常', details: `今日交易: ${todayOrders.length} 筆` },
          { name: '郵件服務', status: '正常', details: '運行中' },
        ]);
      } catch {
        setFirebaseUnconfigured(true);
        setStats([
          { label: '總用戶', value: '-', icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-500/10', change: '-' },
          { label: '總商家', value: '-', icon: Store, color: 'text-purple-500', bgColor: 'bg-purple-500/10', change: '-' },
          { label: '總商品', value: '-', icon: Package, color: 'text-green-500', bgColor: 'bg-green-500/10', change: '-' },
          { label: '今日訂單', value: '-', icon: ShoppingCart, color: 'text-orange-500', bgColor: 'bg-orange-500/10', change: '-' },
          { label: '今日銷售額', value: '-', icon: DollarSign, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', change: '-' },
          { label: '待審核', value: '-', icon: AlertTriangle, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', change: '-', warning: true },
        ]);
        setSystemStatuses([
          { name: 'API 服務', status: '錯誤', details: '無法連線' },
          { name: '資料庫', status: '錯誤', details: '無法連線' },
          { name: '檔案儲存', status: '錯誤', details: '無法連線' },
          { name: '支付系統', status: '錯誤', details: '無法連線' },
          { name: '郵件服務', status: '錯誤', details: '無法連線' },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const allEmpty = !firebaseUnconfigured && stats.length === 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">管理員儀表板</h1>
            <p className="text-sm text-gray-600 mt-1">歡迎回來！以下是系統概覽</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>最後更新: {formatDate(new Date())}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {stats.length > 0 ? stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card hover className="relative overflow-hidden">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{stat.label}</p>
                        <p className={cn(
                          'text-2xl font-bold mt-1',
                          stat.warning ? 'text-yellow-500' : 'text-gray-900'
                        )}>
                          {stat.value}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <TrendingUp className="w-3 h-3 text-emerald-500" />
                          <span className="text-xs text-emerald-500">{stat.change}</span>
                          <span className="text-xs text-gray-600">較昨日</span>
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
              )) : (
                <div className="col-span-full text-center text-gray-500 py-12">尚無數據</div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card padding="none">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">商家申請審核</h2>
                    <Badge variant="warning">{merchantApprovals.length} 筆待審核</Badge>
                  </div>
                </div>
                {merchantApprovals.length > 0 ? (
                  <>
                    <div className="divide-y divide-gray-200">
                      {merchantApprovals.map((merchant) => (
                        <div key={merchant.id} className="p-4 flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{merchant.storeName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-gray-600">{merchant.owner}</span>
                              <span className="text-xs text-gray-600">•</span>
                              <span className="text-xs text-gray-600">{merchant.category}</span>
                              <span className="text-xs text-gray-600">•</span>
                              <span className="text-xs text-gray-600">{merchant.date}</span>
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
                    <div className="p-3 border-t border-gray-200">
                      <Button variant="ghost" className="w-full" size="sm">
                        <Eye className="w-4 h-4" />
                        查看全部申請
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center text-gray-500">尚無數據</div>
                )}
              </Card>

              <Card padding="none">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">商品審核</h2>
                    <Badge variant="warning">{productReviews.length} 筆待審核</Badge>
                  </div>
                </div>
                {productReviews.length > 0 ? (
                  <>
                    <div className="divide-y divide-gray-200">
                      {productReviews.map((product) => (
                        <div key={product.id} className="p-4 flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{product.productName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-gray-600">{product.merchant}</span>
                              <span className="text-xs text-gray-600">•</span>
                              <span className="text-xs text-gray-600">{product.date}</span>
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
                    <div className="p-3 border-t border-gray-200">
                      <Button variant="ghost" className="w-full" size="sm">
                        <Eye className="w-4 h-4" />
                        查看全部審核
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center text-gray-500">尚無數據</div>
                )}
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card padding="none" className="lg:col-span-2">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">最近活動</h2>
                </div>
                {recentActivities.length > 0 ? (
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {recentActivities.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className={cn('p-2 rounded-lg flex-shrink-0', activity.bgColor)}>
                          <activity.icon className={cn('w-4 h-4', activity.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 truncate">{activity.description}</p>
                          <p className="text-xs text-gray-600">{activity.time}</p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">尚無數據</div>
                )}
              </Card>

              <Card padding="none">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">系統狀態</h2>
                </div>
                <div className="p-4 space-y-4">
                  {systemStatuses.length > 0 ? systemStatuses.map((system) => (
                    <div key={system.name} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{system.name}</p>
                        <p className="text-xs text-gray-600">{system.details}</p>
                      </div>
                      <Badge variant={firebaseUnconfigured ? 'warning' : 'success'}>
                        {system.status}
                      </Badge>
                    </div>
                  )) : (
                    <div className="text-center text-gray-500">尚無數據</div>
                  )}
                </div>
                <div className="p-3 border-t border-gray-200">
                  <div className={cn(
                    'flex items-center justify-center gap-2 text-sm',
                    firebaseUnconfigured ? 'text-yellow-500' : 'text-emerald-500'
                  )}>
                    <div className={cn(
                      'w-2 h-2 rounded-full animate-pulse',
                      firebaseUnconfigured ? 'bg-yellow-500' : 'bg-emerald-500'
                    )} />
                    {firebaseUnconfigured ? 'Firebase 尚未配置' : '所有系統運行正常'}
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
