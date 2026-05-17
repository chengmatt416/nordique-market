'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, Badge, Button, Modal } from '@/components/ui';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Search, Check, X, Eye, Star, Loader2, AlertTriangle, MoreVertical, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

type VendorStatus = 'pending' | 'approved' | 'rejected';

interface Vendor {
  id: string;
  storeName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  status: VendorStatus;
  joinDate: string;
  productsCount: number;
  totalSales: number;
  rating: number;
  description: string;
  rejectReason?: string;
}

type TabType = 'all' | 'pending' | 'approved' | 'rejected';

const tabs: { key: TabType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待審核' },
  { key: 'approved', label: '已核准' },
  { key: 'rejected', label: '已拒絕' },
];

export default function VendorPage() {
  const { user } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteWithUser, setDeleteWithUser] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, []);

  async function getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (user) {
      const token = await user.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async function fetchVendors() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/merchants');
      if (!res.ok) {
        if (res.status === 503) {
          setError('firebase_not_configured');
        } else {
          throw new Error('無法載入商家資料');
        }
        return;
      }
      const data = await res.json();
      setVendors((data.merchants || []).map((m: any) => ({
        id: m.id,
        storeName: m.storeName || m.name || '',
        ownerName: m.ownerName || m.owner || '',
        email: m.email || '',
        phone: m.phone || '',
        address: m.address || '',
        status: m.status || 'pending',
        joinDate: m.joinDate || m.createdAt || '',
        productsCount: m.productsCount || 0,
        totalSales: m.totalSales || 0,
        rating: m.rating || 0,
        description: m.description || '',
        rejectReason: m.rejectReason,
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入失敗');
    } finally {
      setLoading(false);
    }
  }

  async function updateVendorStatus(id: string, status: VendorStatus, reason?: string) {
    setUpdating(true);
    try {
      await fetch('/api/merchants', {
        method: 'PUT',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ id, status, rejectReason: reason }),
      });
      setVendors((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status, rejectReason: reason } : v))
      );
    } catch {}
    setUpdating(false);
    setApproveModalOpen(false);
    setRejectModalOpen(false);
    setSelectedVendor(null);
    setRejectReason('');
  }

  async function deleteVendor() {
    if (!selectedVendor) return;
    setUpdating(true);
    try {
      const headers = await getAuthHeaders();
      delete headers['Content-Type'];
      await fetch(`/api/merchants?id=${selectedVendor.id}&deleteUser=${deleteWithUser}`, {
        method: 'DELETE',
        headers,
      });
      setVendors((prev) => prev.filter((v) => v.id !== selectedVendor.id));
      setDeleteModalOpen(false);
      setSelectedVendor(null);
    } catch {}
    setUpdating(false);
  }

  const filteredVendors = vendors.filter((v) => {
    const matchesTab = activeTab === 'all' || v.status === activeTab;
    const matchesSearch =
      v.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const tabCounts = {
    all: vendors.length,
    pending: vendors.filter((v) => v.status === 'pending').length,
    approved: vendors.filter((v) => v.status === 'approved').length,
    rejected: vendors.filter((v) => v.status === 'rejected').length,
  };

  const getStatusBadge = (status: VendorStatus) => {
    switch (status) {
      case 'pending': return <Badge variant="warning">待審核</Badge>;
      case 'approved': return <Badge variant="success">已核准</Badge>;
      case 'rejected': return <Badge variant="error">已拒絕</Badge>;
    }
  };

  const openDetail = (v: Vendor) => {
    setSelectedVendor(v);
    setDetailModalOpen(true);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="ml-3 text-gray-600">載入中...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error === 'firebase_not_configured') {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Firebase 尚未設定</h2>
          <p className="text-gray-600 mb-6">請先完成 Firebase 設定以管理供應商</p>
          <a href="/firebase-setup" className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">前往設定</a>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <AlertTriangle className="w-10 h-10 text-red-500 mb-3" />
          <p className="text-gray-900 font-medium mb-2">載入失敗</p>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <Button onClick={fetchVendors}>重試</Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">供應商管理</h1>
          <p className="text-gray-600 mt-1">管理所有供應商入駐申請與資料</p>
        </div>

        <Card padding="lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      'px-4 py-2 rounded-md text-sm font-medium transition-all',
                      activeTab === tab.key
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    {tab.label}
                    <span className={cn('ml-1.5 text-xs px-1.5 py-0.5 rounded-full', activeTab === tab.key ? 'bg-indigo-600/10 text-indigo-600' : 'bg-gray-200')}>
                      {tabCounts[tab.key]}
                    </span>
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="text"
                  placeholder="搜尋商店名稱、店主或電子郵件..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">商店</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">店主</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">電子郵件</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">狀態</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">入駐日期</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredVendors.map((v) => (
                      <motion.tr
                        key={v.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                              <Store className="w-5 h-5 text-gray-600" />
                            </div>
                            <span className="font-medium text-gray-900">{v.storeName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{v.ownerName}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{v.email}</td>
                        <td className="py-3 px-4">{getStatusBadge(v.status)}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{v.joinDate ? formatDate(v.joinDate) : '-'}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openDetail(v)}
                              className="p-1.5 rounded-md hover:bg-gray-50 transition-colors"
                              title="查看詳情"
                            >
                              <Eye className="w-4 h-4 text-gray-600" />
                            </button>
                            {v.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => { setSelectedVendor(v); setApproveModalOpen(true); }}
                                  className="p-1.5 rounded-md hover:bg-green-100 transition-colors"
                                  title="核准"
                                >
                                  <Check className="w-4 h-4 text-green-500" />
                                </button>
                                <button
                                  onClick={() => { setSelectedVendor(v); setRejectModalOpen(true); }}
                                  className="p-1.5 rounded-md hover:bg-red-100 transition-colors"
                                  title="拒絕"
                                >
                                  <X className="w-4 h-4 text-red-500" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>

              {filteredVendors.length === 0 && (
                <div className="py-12 text-center text-gray-600">
                  <Store className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>找不到符合條件的供應商</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Modal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} title="供應商詳情" size="lg">
        {selectedVendor && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                <Store className="w-8 h-8 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">{selectedVendor.storeName}</h3>
                <p className="text-gray-600 mt-1">{selectedVendor.ownerName}</p>
                {getStatusBadge(selectedVendor.status)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">商品數量</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{selectedVendor.productsCount}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">總銷售額</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{formatPrice(selectedVendor.totalSales)}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1">
                <p className="text-sm text-gray-600">評分</p>
                <div className="flex items-center gap-1 ml-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn('w-4 h-4', i < Math.floor(selectedVendor.rating) ? 'fill-amber-500 text-amber-500' : 'text-gray-200')} />
                  ))}
                  <span className="ml-1 text-sm font-medium text-gray-900">{selectedVendor.rating > 0 ? selectedVendor.rating : '尚無評分'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div><p className="text-sm text-gray-600">電子郵件</p><p className="text-gray-900">{selectedVendor.email}</p></div>
              <div><p className="text-sm text-gray-600">電話</p><p className="text-gray-900">{selectedVendor.phone}</p></div>
              <div><p className="text-sm text-gray-600">地址</p><p className="text-gray-900">{selectedVendor.address || '-'}</p></div>
              <div><p className="text-sm text-gray-600">入駐日期</p><p className="text-gray-900">{selectedVendor.joinDate ? formatDate(selectedVendor.joinDate) : '-'}</p></div>
              <div><p className="text-sm text-gray-600">商店描述</p><p className="text-gray-900">{selectedVendor.description || '-'}</p></div>
              {selectedVendor.status === 'rejected' && selectedVendor.rejectReason && (
                <div className="bg-red-100 rounded-lg p-4">
                  <p className="text-sm text-red-500 font-medium">拒絕原因</p>
                  <p className="text-gray-900 mt-1">{selectedVendor.rejectReason}</p>
                </div>
              )}
            </div>

            {selectedVendor.status === 'pending' && (
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button onClick={() => { setDetailModalOpen(false); setApproveModalOpen(true); }}>核准入駐</Button>
                <Button variant="outline" onClick={() => { setDetailModalOpen(false); setRejectModalOpen(true); }}>拒絕</Button>
              </div>
            )}
            <div className="pt-4 border-t border-gray-200 flex justify-end">
              <Button variant="ghost" onClick={() => { setDetailModalOpen(false); setDeleteModalOpen(true); }} className="text-red-500 hover:text-red-700">
                <Trash2 className="w-4 h-4 mr-1" /> 刪除供應商
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={approveModalOpen} onClose={() => setApproveModalOpen(false)} title="確認核准" size="sm">
        {selectedVendor && (
          <div className="space-y-4">
            <p className="text-gray-600">
              確定要核准供應商「<span className="font-medium text-gray-900">{selectedVendor.storeName}</span>」的入駐申請嗎？
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setApproveModalOpen(false)}>取消</Button>
              <Button onClick={() => updateVendorStatus(selectedVendor.id, 'approved')} loading={updating}>確認核准</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={rejectModalOpen} onClose={() => { setRejectModalOpen(false); setRejectReason(''); }} title="拒絕申請" size="md">
        {selectedVendor && (
          <div className="space-y-4">
            <p className="text-gray-600">
              確定要拒絕供應商「<span className="font-medium text-gray-900">{selectedVendor.storeName}</span>」的入駐申請嗎？
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">拒絕原因（必填）</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="請輸入拒絕原因..."
                rows={4}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 resize-none"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => { setRejectModalOpen(false); setRejectReason(''); }}>取消</Button>
              <Button onClick={() => updateVendorStatus(selectedVendor.id, 'rejected', rejectReason)} loading={updating} disabled={!rejectReason.trim()}>確認拒絕</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={deleteModalOpen} onClose={() => { setDeleteModalOpen(false); setDeleteWithUser(false); }} title="刪除供應商" size="md">
        {selectedVendor && (
          <div className="space-y-4">
            <p className="text-gray-600">
              確定要刪除供應商「<span className="font-medium text-gray-900">{selectedVendor.storeName}</span>」嗎？此操作無法復原。
            </p>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={deleteWithUser}
                onChange={(e) => setDeleteWithUser(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
              />
              <span className="text-sm text-gray-700">同時刪除該用戶的 Firebase Auth 帳戶</span>
            </label>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => { setDeleteModalOpen(false); setDeleteWithUser(false); }}>取消</Button>
              <Button onClick={deleteVendor} loading={updating} className="bg-red-500 hover:bg-red-600">確認刪除</Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
