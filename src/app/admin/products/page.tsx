'use client';
import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, Badge, Button, Modal } from '@/components/ui';
import { formatPrice, cn, productImageUrl } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Package, Search, Check, X, Eye } from 'lucide-react';
import { deobfuscateProduct } from '@/lib/crypto';
import { useAuth } from '@/lib/auth-context';

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

const tabs = [
  { key: 'all', label: '全部', statuses: ['pending', 'approved', 'rejected'] as ProductStatus[] },
  { key: 'pending', label: '待審核', statuses: ['pending'] as ProductStatus[] },
  { key: 'approved', label: '已上架', statuses: ['approved'] as ProductStatus[] },
  { key: 'rejected', label: '已下架', statuses: ['rejected'] as ProductStatus[] },
];

export default function AdminProductsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/products');
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `請求失敗 (${res.status})`);
        }
        const data = await res.json();
        const raw = data.products || data;
        setProducts(Array.isArray(raw) ? raw.map((p: any) => p._e ? deobfuscateProduct(p) : p) : raw);
      } catch (err) {
        setError(err instanceof Error ? err.message : '發生未知錯誤');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

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

  const handleApprove = async (productId: string) => {
    setUpdating(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (user) headers['Authorization'] = 'Bearer ' + (await user.getIdToken());
      await fetch('/api/products', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ id: productId, status: 'approved' }),
      });
      setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, status: 'approved' } : p)));
      setShowPreviewModal(false);
    } catch {}
    setUpdating(false);
  };

  const handleReject = async (productId: string) => {
    setUpdating(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (user) headers['Authorization'] = 'Bearer ' + (await user.getIdToken());
      await fetch('/api/products', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ id: productId, status: 'rejected' }),
      });
      setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, status: 'rejected' } : p)));
      setShowRejectModal(false);
      setShowPreviewModal(false);
      setRejectReason('');
    } catch {}
    setUpdating(false);
  };

  const handleDelete = async (productId: string) => {
    setUpdating(true);
    try {
      const headers: Record<string, string> = {};
      if (user) headers['Authorization'] = 'Bearer ' + (await user.getIdToken());
      await fetch(`/api/products?id=${productId}`, { method: 'DELETE', headers });
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch {}
    setUpdating(false);
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
              {loading ? (
                <div className="py-16 flex flex-col items-center justify-center text-gray-600">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  >
                    <Package className="w-8 h-8 text-indigo-600" />
                  </motion.div>
                  <p className="mt-4 text-sm">載入中...</p>
                </div>
              ) : error ? (
                <div className="py-16 flex flex-col items-center justify-center text-gray-600">
                  <p className="text-red-600 font-medium mb-2">載入失敗</p>
                  <p className="text-sm mb-4">{error}</p>
                  <Button
                    variant="primary"
                    onClick={() => window.location.reload()}
                  >
                    重新整理
                  </Button>
                </div>
              ) : (
                <>
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
                              src={productImageUrl(product as any, 80)}
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

                  {!loading && !error && filteredProducts.length === 0 && (
                    <div className="py-12 text-center text-gray-600">
                      沒有找到符合條件的商品
                    </div>
                  )}
                </>
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
                src={productImageUrl(selectedProduct as any, 400)}
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