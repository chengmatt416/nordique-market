'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, Badge, Button, Modal } from '@/components/ui';
import { formatDate, cn, getImageUrl } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Search, MoreVertical, Check, X, Eye, Star } from 'lucide-react';

type MerchantStatus = 'pending' | 'approved' | 'rejected';

interface Merchant {
  id: string;
  storeName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  status: MerchantStatus;
  joinDate: string;
  productsCount: number;
  totalSales: number;
  rating: number;
  description: string;
  rejectReason?: string;
}

const sampleMerchants: Merchant[] = [
  {
    id: '1',
    storeName: '北歐家居館',
    ownerName: '王小明',
    email: 'nordic.home@email.com',
    phone: '0912-345-678',
    address: '台北市大安區忠孝東路四段101號',
    status: 'approved',
    joinDate: '2024-01-15',
    productsCount: 156,
    totalSales: 2580000,
    rating: 4.8,
    description: '專營北歐風格家具與家飾品，提供高品質的簡約生活體驗。',
  },
  {
    id: '2',
    storeName: '簡約生活工作室',
    ownerName: '陳雅琪',
    email: 'simple.life@email.com',
    phone: '0923-456-789',
    address: '新北市板橋區中山路一段208號',
    status: 'approved',
    joinDate: '2024-02-20',
    productsCount: 89,
    totalSales: 1560000,
    rating: 4.6,
    description: '推廣極簡主義生活，嚴選各式簡約設計商品。',
  },
  {
    id: '3',
    storeName: '設計師選物店',
    ownerName: '張志偉',
    email: 'designer.select@email.com',
    phone: '0934-567-890',
    address: '台中市西區精明路77號',
    status: 'pending',
    joinDate: '2024-03-10',
    productsCount: 45,
    totalSales: 0,
    rating: 0,
    description: '匯集國內外新銳設計師作品，帶給您獨特的設計選物體驗。',
  },
  {
    id: '4',
    storeName: '手感皮革工坊',
    ownerName: '林建志',
    email: 'leather.craft@email.com',
    phone: '0945-678-901',
    address: '高雄市鼓山區美術東二路55號',
    status: 'pending',
    joinDate: '2024-03-12',
    productsCount: 32,
    totalSales: 0,
    rating: 0,
    description: '手工製作真皮皮件，每件作品都獨一無二。',
  },
  {
    id: '5',
    storeName: '綠色生活選物',
    ownerName: '黃小倩',
    email: 'green.life@email.com',
    phone: '0956-789-012',
    address: '台南市東區中華東路三段66號',
    status: 'approved',
    joinDate: '2024-01-28',
    productsCount: 234,
    totalSales: 3200000,
    rating: 4.9,
    description: '嚴選環保友善商品，推廣永續綠色生活方式。',
  },
  {
    id: '6',
    storeName: '日式雜貨小舖',
    ownerName: '田中美咲',
    email: 'japan.zakka@email.com',
    phone: '0967-890-123',
    address: '桃園市桃園區中正路888號',
    status: 'rejected',
    joinDate: '2024-02-05',
    productsCount: 0,
    totalSales: 0,
    rating: 0,
    description: '引進日本各地特色雜貨與文創商品。',
    rejectReason: '提供的商店登記文件不完整，請補件後重新申請。',
  },
  {
    id: '7',
    storeName: '手作陶瓷工作坊',
    ownerName: '劉雅惠',
    email: 'ceramic.studio@email.com',
    phone: '0978-901-234',
    address: '新竹市東區光復路二段300號',
    status: 'approved',
    joinDate: '2023-12-15',
    productsCount: 67,
    totalSales: 890000,
    rating: 4.7,
    description: '自產自銷手工陶瓷品，每件都是匠心獨具的藝術品。',
  },
  {
    id: '8',
    storeName: '復古傢俱收藏',
    ownerName: '周建國',
    email: 'vintage.furniture@email.com',
    phone: '0989-012-345',
    address: '彰化縣彰化市中山路一段500號',
    status: 'pending',
    joinDate: '2024-03-14',
    productsCount: 28,
    totalSales: 0,
    rating: 0,
    description: '精選各式復古風格傢俱，重現經典年代的美好。',
  },
  {
    id: '9',
    storeName: '香氛生活館',
    ownerName: '蔡明慧',
    email: 'aroma.life@email.com',
    phone: '0990-123-456',
    address: '屏東縣屏東市仁愛路200號',
    status: 'approved',
    joinDate: '2024-01-10',
    productsCount: 178,
    totalSales: 1950000,
    rating: 4.5,
    description: '專營各類香氛產品，包含蠟燭、擴香及精油等。',
  },
  {
    id: '10',
    storeName: '文創禮品專賣',
    ownerName: '楊雅筑',
    email: 'creative.gift@email.com',
    phone: '0901-234-567',
    address: '花蓮縣花蓮市中華路一段150號',
    status: 'rejected',
    joinDate: '2024-02-18',
    productsCount: 0,
    totalSales: 0,
    rating: 0,
    description: '各式創意禮品與文創商品，適合送禮自用。',
    rejectReason: '商店經營內容與申請類別不符，請重新確認申請品項。',
  },
];

type TabType = 'all' | 'pending' | 'approved' | 'rejected';

const tabs: { key: TabType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待審核' },
  { key: 'approved', label: '已核准' },
  { key: 'rejected', label: '已拒絕' },
];

export default function MerchantsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [merchants, setMerchants] = useState<Merchant[]>(sampleMerchants);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filteredMerchants = merchants.filter((merchant) => {
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'pending' && merchant.status === 'pending') ||
      (activeTab === 'approved' && merchant.status === 'approved') ||
      (activeTab === 'rejected' && merchant.status === 'rejected');
    const matchesSearch =
      merchant.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      merchant.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      merchant.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const tabCounts = {
    all: merchants.length,
    pending: merchants.filter((m) => m.status === 'pending').length,
    approved: merchants.filter((m) => m.status === 'approved').length,
    rejected: merchants.filter((m) => m.status === 'rejected').length,
  };

  const handleApprove = (merchant: Merchant) => {
    setMerchants((prev) =>
      prev.map((m) => (m.id === merchant.id ? { ...m, status: 'approved' } : m))
    );
    setApproveModalOpen(false);
    setSelectedMerchant(null);
  };

  const handleReject = () => {
    if (!selectedMerchant) return;
    setMerchants((prev) =>
      prev.map((m) =>
        m.id === selectedMerchant.id ? { ...m, status: 'rejected', rejectReason } : m
      )
    );
    setRejectModalOpen(false);
    setRejectReason('');
    setSelectedMerchant(null);
  };

  const openDetailModal = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    setDetailModalOpen(true);
    setOpenMenu(null);
  };

  const openApproveModal = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    setApproveModalOpen(true);
    setOpenMenu(null);
  };

  const openRejectModal = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    setRejectModalOpen(true);
    setOpenMenu(null);
  };

  const getStatusBadge = (status: MerchantStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">待審核</Badge>;
      case 'approved':
        return <Badge variant="success">已核准</Badge>;
      case 'rejected':
        return <Badge variant="error">已拒絕</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">商家管理</h1>
          <p className="text-gray-600 mt-1">管理所有商家入駐申請與資料</p>
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
                    <span
                      className={cn(
                        'ml-1.5 text-xs px-1.5 py-0.5 rounded-full',
                        activeTab === tab.key
                          ? 'bg-indigo-600/10 text-indigo-600'
                          : 'bg-gray-200'
                      )}
                    >
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
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      商店
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      店主
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      電子郵件
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      狀態
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      入駐日期
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredMerchants.map((merchant) => (
                      <motion.tr
                        key={merchant.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
                              <Store className="w-5 h-5 text-gray-600" />
                            </div>
                            <span className="font-medium text-gray-900">
                              {merchant.storeName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {merchant.ownerName}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {merchant.email}
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(merchant.status)}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(merchant.joinDate)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2 relative">
                            <button
                              onClick={() =>
                                setOpenMenu(openMenu === merchant.id ? null : merchant.id)
                              }
                              className="p-1.5 rounded-md hover:bg-gray-50 transition-colors"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-600" />
                            </button>

                            <AnimatePresence>
                              {openMenu === merchant.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-10"
                                >
                                  <button
                                    onClick={() => openDetailModal(merchant)}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-900 hover:bg-gray-50 transition-colors"
                                  >
                                    <Eye className="w-4 h-4" />
                                    查看詳情
                                  </button>
                                  {merchant.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => openApproveModal(merchant)}
                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-green-500 hover:bg-gray-50 transition-colors"
                                      >
                                        <Check className="w-4 h-4" />
                                        核准
                                      </button>
                                      <button
                                        onClick={() => openRejectModal(merchant)}
                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-gray-50 transition-colors"
                                      >
                                        <X className="w-4 h-4" />
                                        拒絕
                                      </button>
                                    </>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>

              {filteredMerchants.length === 0 && (
                <div className="py-12 text-center text-gray-600">
                  <Store className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>找不到符合條件的商家</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Modal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} title="商家詳情" size="lg">
        {selectedMerchant && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                <Store className="w-8 h-8 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedMerchant.storeName}
                </h3>
                <p className="text-gray-600 mt-1">{selectedMerchant.ownerName}</p>
                {getStatusBadge(selectedMerchant.status)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">商品數量</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {selectedMerchant.productsCount}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">總銷售額</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  NT${selectedMerchant.totalSales.toLocaleString()}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1">
                <p className="text-sm text-gray-600">評分</p>
                <div className="flex items-center gap-1 ml-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'w-4 h-4',
                        i < Math.floor(selectedMerchant.rating)
                          ? 'fill-amber-500 text-amber-500'
                          : 'text-gray-200'
                      )}
                    />
                  ))}
                  <span className="ml-1 text-sm font-medium text-gray-900">
                    {selectedMerchant.rating > 0 ? selectedMerchant.rating : '尚無評分'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">電子郵件</p>
                <p className="text-gray-900">{selectedMerchant.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">電話</p>
                <p className="text-gray-900">{selectedMerchant.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">地址</p>
                <p className="text-gray-900">{selectedMerchant.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">入駐日期</p>
                <p className="text-gray-900">{formatDate(selectedMerchant.joinDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">商店描述</p>
                <p className="text-gray-900">{selectedMerchant.description}</p>
              </div>
              {selectedMerchant.status === 'rejected' && selectedMerchant.rejectReason && (
                <div className="bg-red-100 rounded-lg p-4">
                  <p className="text-sm text-red-500 font-medium">拒絕原因</p>
                  <p className="text-gray-900 mt-1">{selectedMerchant.rejectReason}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={approveModalOpen} onClose={() => setApproveModalOpen(false)} title="確認核准" size="sm">
        {selectedMerchant && (
          <div className="space-y-4">
            <p className="text-gray-600">
              確定要核准商家「<span className="font-medium text-gray-900">{selectedMerchant.storeName}</span>」的入駐申請嗎？
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setApproveModalOpen(false)}>
                取消
              </Button>
              <Button onClick={() => handleApprove(selectedMerchant)}>確認核准</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="拒絕申請" size="md">
        {selectedMerchant && (
          <div className="space-y-4">
            <p className="text-gray-600">
              確定要拒絕商家「<span className="font-medium text-gray-900">{selectedMerchant.storeName}</span>」的入駐申請嗎？
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                拒絕原因（必填）
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="請輸入拒絕原因..."
                rows={4}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 resize-none"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setRejectModalOpen(false)}>
                取消
              </Button>
              <Button variant="primary" onClick={handleReject} disabled={!rejectReason.trim()}>
                確認拒絕
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}