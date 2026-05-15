'use client';
import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, Badge, Button, Modal } from '@/components/ui';
import { formatPrice, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Package, Search, Check, X, Eye } from 'lucide-react';

type ProductStatus = 'pending' | 'approved' | 'rejected';

interface Product {
  id: string;
  name: string;
  merchantName: string;
  category: string;
  price: number;
  originalPrice: number;
  status: ProductStatus;
  image: string;
  description: string;
  stock: number;
  createdAt: string;
}

const sampleProducts: Product[] = [
  {
    id: 'P001',
    name: '北歐羊毛大衣',
    merchantName: '北歐時尚館',
    category: '服飾',
    price: 5999,
    originalPrice: 7999,
    status: 'approved',
    image: 'coat1',
    description: '100%純羊毛，採用北歐傳統工藝制作，保暖舒適。',
    stock: 45,
    createdAt: '2024-01-15',
  },
  {
    id: 'P002',
    name: '極簡木質家具套組',
    merchantName: '北歐居家',
    category: '家具',
    price: 12999,
    originalPrice: 15999,
    status: 'approved',
    image: 'furniture1',
    description: 'FSC認證木材，極簡北歐風格，適合小坪數空間。',
    stock: 12,
    createdAt: '2024-01-18',
  },
  {
    id: 'P003',
    name: '斯堪地那維亞設計燈具',
    merchantName: '光影美學',
    category: '燈飾',
    price: 3499,
    originalPrice: 4299,
    status: 'pending',
    image: 'lamp1',
    description: '鋁合金燈體，進口LED光源，三段亮度可調。',
    stock: 68,
    createdAt: '2024-01-20',
  },
  {
    id: 'P004',
    name: '北歐風陶瓷餐具組',
    merchantName: '餐桌美學',
    category: '餐廚',
    price: 1899,
    originalPrice: 2299,
    status: 'pending',
    image: 'ceramic1',
    description: '手作陶瓷，釉面光滑細膩，無毒環保顏料。',
    stock: 92,
    createdAt: '2024-01-21',
  },
  {
    id: 'P005',
    name: '北歐羊毛毯',
    merchantName: '北歐時尚館',
    category: '家紡',
    price: 2599,
    originalPrice: 2999,
    status: 'rejected',
    image: 'blanket1',
    description: '紐西蘭羊毛，柔軟親膚，適合冬季使用。',
    stock: 0,
    createdAt: '2024-01-10',
  },
  {
    id: 'P006',
    name: '極簡主義掛鐘',
    merchantName: '時間美學',
    category: '家飾',
    price: 1299,
    originalPrice: 1599,
    status: 'approved',
    image: 'clock1',
    description: '靜音機芯，金屬框架，極簡線條設計。',
    stock: 156,
    createdAt: '2024-01-12',
  },
  {
    id: 'P007',
    name: '北歐實木書架',
    merchantName: '北歐居家',
    category: '家具',
    price: 4599,
    originalPrice: 5499,
    status: 'pending',
    image: 'shelf1',
    description: '白橡木實木，環保水性漆料，簡易組裝設計。',
    stock: 28,
    createdAt: '2024-01-22',
  },
  {
    id: 'P008',
    name: '北歐風抱枕套組',
    merchantName: '質感生活',
    category: '家紡',
    price: 799,
    originalPrice: 999,
    status: 'approved',
    image: 'pillow1',
    description: '棉麻材質，隐形拉鍊設計，可機洗。',
    stock: 234,
    createdAt: '2024-01-14',
  },
  {
    id: 'P009',
    name: '斯堪地那維亞地毯',
    merchantName: '地面美學',
    category: '家紡',
    price: 3999,
    originalPrice: 4999,
    status: 'rejected',
    image: 'rug1',
    description: '羊毛混紡，傳統手工編織，抗菌防蟎處理。',
    stock: 0,
    createdAt: '2024-01-08',
  },
  {
    id: 'P010',
    name: '北歐鋁框全身鏡',
    merchantName: '質感生活',
    category: '家飾',
    price: 2199,
    originalPrice: 2699,
    status: 'pending',
    image: 'mirror1',
    description: '鋁合金框架，高清鏡面，背面防撞保護。',
    stock: 67,
    createdAt: '2024-01-23',
  },
];

const tabs = [
  { key: 'all', label: '全部', statuses: ['pending', 'approved', 'rejected'] as ProductStatus[] },
  { key: 'pending', label: '待審核', statuses: ['pending'] as ProductStatus[] },
  { key: 'approved', label: '已上架', statuses: ['approved'] as ProductStatus[] },
  { key: 'rejected', label: '已下架', statuses: ['rejected'] as ProductStatus[] },
];

export default function AdminProductsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [products, setProducts] = useState<Product[]>(sampleProducts);

  const getCountByStatus = (statuses: ProductStatus[]) => {
    return products.filter((p) => statuses.includes(p.status)).length;
  };

  const filteredProducts = products.filter((product) => {
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'pending' && product.status === 'pending') ||
      (activeTab === 'approved' && product.status === 'approved') ||
      (activeTab === 'rejected' && product.status === 'rejected');

    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const handlePreview = (product: Product) => {
    setSelectedProduct(product);
    setShowPreviewModal(true);
  };

  const handleApprove = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, status: 'approved' } : p))
    );
    setShowPreviewModal(false);
  };

  const handleReject = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, status: 'rejected' } : p
      )
    );
    setShowRejectModal(false);
    setShowPreviewModal(false);
    setRejectReason('');
  };

  const handleDelete = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const getStatusBadge = (status: ProductStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">待審核</Badge>;
      case 'approved':
        return <Badge variant="success">已上架</Badge>;
      case 'rejected':
        return <Badge variant="error">已下架</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">商品管理</h1>
        </div>

        <Card padding="lg">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="text"
                  placeholder="搜尋商品、名稱或商家..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded border border-gray-200 bg-white text-gray-900 placeholder:text-gray-600 focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="flex gap-2 border-b border-gray-200">
              {tabs.map((tab) => (
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
                    <th className="pb-3 font-medium">商品圖片</th>
                    <th className="pb-3 font-medium">商品名稱</th>
                    <th className="pb-3 font-medium">商家</th>
                    <th className="pb-3 font-medium">類別</th>
                    <th className="pb-3 font-medium">價格</th>
                    <th className="pb-3 font-medium">狀態</th>
                    <th className="pb-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-gray-200 last:border-0 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-3">
                        <img
                          src={`https://picsum.photos/seed/${product.image}/80/80`}
                          alt={product.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      </td>
                      <td className="py-3">
                        <div className="font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {product.id}
                        </div>
                      </td>
                      <td className="py-3 text-gray-600">
                        {product.merchantName}
                      </td>
                      <td className="py-3 text-gray-600">
                        {product.category}
                      </td>
                      <td className="py-3">
                        <div className="font-medium text-indigo-600">
                          {formatPrice(product.price)}
                        </div>
                        <div className="text-xs text-gray-600 line-through">
                          {formatPrice(product.originalPrice)}
                        </div>
                      </td>
                      <td className="py-3">{getStatusBadge(product.status)}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePreview(product)}
                            className="p-2 rounded hover:bg-gray-50 transition-colors"
                            title="預覽"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          {product.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(product.id)}
                                className="p-2 rounded hover:bg-green-100 transition-colors"
                                title="核准"
                              >
                                <Check className="w-4 h-4 text-green-500" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setShowRejectModal(true);
                                }}
                                className="p-2 rounded hover:bg-red-100 transition-colors"
                                title="拒絕"
                              >
                                <X className="w-4 h-4 text-red-500" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 rounded hover:bg-red-100 transition-colors"
                            title="刪除"
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredProducts.length === 0 && (
                <div className="py-12 text-center text-gray-600">
                  沒有找到符合條件的商品
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="商品詳情"
        size="lg"
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <img
                src={`https://picsum.photos/seed/${selectedProduct.image}/400/400`}
                alt={selectedProduct.name}
                className="w-40 h-40 rounded object-cover"
              />
              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedProduct.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedProduct.id}
                </p>
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedProduct.status)}
                </div>
                <div className="text-sm text-gray-600">
                  商家：{selectedProduct.merchantName}
                </div>
                <div className="text-sm text-gray-600">
                  類別：{selectedProduct.category}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">售價</p>
                  <p className="text-lg font-semibold text-indigo-600">
                    {formatPrice(selectedProduct.price)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">原價</p>
                  <p className="text-lg line-through text-gray-600">
                    {formatPrice(selectedProduct.originalPrice)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">庫存</p>
                  <p className="text-lg font-semibold">{selectedProduct.stock}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">上架日期</p>
                  <p className="text-lg">{selectedProduct.createdAt}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">商品描述</p>
              <p className="text-gray-900">
                {selectedProduct.description}
              </p>
            </div>

            {selectedProduct.status === 'pending' && (
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  variant="primary"
                  onClick={() => handleApprove(selectedProduct.id)}
                >
                  <Check className="w-4 h-4" />
                  核准上架
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPreviewModal(false);
                    setShowRejectModal(true);
                  }}
                >
                  <X className="w-4 h-4" />
                  拒絕
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason('');
        }}
        title="拒絕商品"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            請輸入拒絕原因，將通知商家進行修改。
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="請輸入違規原因..."
            rows={4}
            className="w-full px-3 py-2 rounded border border-gray-200 bg-white text-gray-900 placeholder:text-gray-600 focus:outline-none focus:border-indigo-600 resize-none"
          />
          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => {
                setShowRejectModal(false);
                setRejectReason('');
              }}
            >
              取消
            </Button>
            <Button
              variant="primary"
              onClick={() => selectedProduct && handleReject(selectedProduct.id)}
              disabled={!rejectReason.trim()}
            >
              確認拒絕
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}