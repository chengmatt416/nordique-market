'use client';

import { useEffect, useState } from 'react';
import { MerchantLayout } from '@/components/layout/MerchantLayout';
import { Card, Badge, Button, Input, Modal } from '@/components/ui';
import { formatPrice, cn } from '@/lib/utils';
import { Plus, Search, Edit, Trash2, ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { deobfuscatePrice, deobfuscate, deobfuscateProduct } from '@/lib/crypto';

type ProductStatus = 'active' | 'inactive' | 'pending';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  originalPrice: number;
  stock: number;
  status: ProductStatus;
  image: string;
}

const categories = ['時鐘', '家具', '地毯', '裝飾品', '燈具', '收納', '五金配件'];

const statusLabels: Record<ProductStatus, string> = {
  active: '上架中',
  inactive: '下架中',
  pending: '審核中',
};

const statusBadgeVariant: Record<ProductStatus, 'success' | 'default' | 'warning'> = {
  active: 'success',
  inactive: 'default',
  pending: 'warning',
};

type FilterStatus = 'all' | ProductStatus;

const ITEMS_PER_PAGE = 5;

export default function MerchantProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: categories[0],
    price: '',
    originalPrice: '',
    stock: '',
    image: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      setError(false);
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      const list: Product[] = (data.products || []).map((p: any) => {
        const decrypted = p._e ? deobfuscateProduct(p) : p;
        return {
          id: p.id,
          name: decrypted.name,
          description: decrypted.description || '',
          category: p.category || '',
          price: decrypted.price || 0,
          originalPrice: decrypted.originalPrice || decrypted.price || 0,
          stock: p.stock ?? 0,
          status: p.status || 'pending',
          image: p.image || '',
        };
      });
      setProducts(list);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: categories[0],
      price: '',
      originalPrice: '',
      stock: '',
      image: '',
    });
  };

  const openAddModal = () => {
    setEditingProduct(null);
    resetForm();
    setIsProductModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price.toString(),
      originalPrice: product.originalPrice.toString(),
      stock: product.stock.toString(),
      image: product.image,
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.price || !formData.stock) return;

    setSaving(true);
    try {
      const body = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseInt(formData.price),
        originalPrice: parseInt(formData.originalPrice) || parseInt(formData.price),
        stock: parseInt(formData.stock),
        status: editingProduct?.status || 'pending',
        image: formData.image || `product-${Date.now()}`,
      };

      if (editingProduct) {
        const res = await fetch('/api/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingProduct.id, ...body }),
        });
        if (!res.ok) throw new Error('Failed to update');
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Failed to create');
      }

      await fetchProducts();
      setIsProductModalOpen(false);
      resetForm();
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/products?id=${productToDelete.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      await fetchProducts();
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    } catch {
      setError(true);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <MerchantLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">商品管理</h1>
          <Button onClick={openAddModal}>
            <Plus className="w-4 h-4" />
            新增商品
          </Button>
        </div>

        {loading && (
          <Card className="mb-6 p-8 text-center text-gray-400">載入中...</Card>
        )}

        {error && (
          <Card className="mb-6 p-8 text-center text-gray-500">無法載入商品</Card>
        )}

        {!loading && !error && products.length === 0 && (
          <Card className="mb-6 p-12 text-center">
            <p className="text-gray-500 mb-4">尚無商品，立即新增</p>
            <Link href="#" onClick={(e) => { e.preventDefault(); openAddModal(); }}>
              <Button>
                <Plus className="w-4 h-4" /> 新增商品
              </Button>
            </Link>
          </Card>
        )}

        {!loading && !error && products.length > 0 && (
          <>
            <Card className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4 p-4">
                <div className="flex-1">
                  <Input
                    placeholder="搜尋商品..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    icon={<Search className="w-4 h-4" />}
                  />
                </div>
                <div className="flex gap-2">
                  {(['all', 'active', 'inactive', 'pending'] as FilterStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setFilterStatus(status);
                        setCurrentPage(1);
                      }}
                      className={cn(
                        'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                        filterStatus === status
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-200'
                      )}
                    >
                      {status === 'all' ? '全部' : statusLabels[status as ProductStatus]}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            <Card padding="none">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-4 text-sm font-medium text-gray-600">商品</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">分類</th>
                      <th className="text-right p-4 text-sm font-medium text-gray-600">價格</th>
                      <th className="text-right p-4 text-sm font-medium text-gray-600">庫存</th>
                      <th className="text-center p-4 text-sm font-medium text-gray-600">狀態</th>
                      <th className="text-right p-4 text-sm font-medium text-gray-600">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center p-8 text-gray-400">找不到商品</td>
                      </tr>
                    ) : (
                      paginatedProducts.map((product) => (
                        <tr
                          key={product.id}
                          className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-50 flex-shrink-0">
                                <img
                                  src={`https://picsum.photos/seed/${product.image}/100/100`}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{product.name}</p>
                                <p className="text-sm text-gray-400 line-clamp-1 max-w-xs">{product.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-gray-600">{product.category}</td>
                          <td className="p-4 text-right">
                            <p className="font-medium text-gray-900">{formatPrice(product.price)}</p>
                            {product.originalPrice > product.price && (
                              <p className="text-sm text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <span
                              className={cn(
                                'font-medium',
                                product.stock === 0
                                  ? 'text-red-500'
                                  : product.stock < 5
                                  ? 'text-amber-500'
                                  : 'text-gray-900'
                              )}
                            >
                              {product.stock}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <Badge variant={statusBadgeVariant[product.status]}>
                              {statusLabels[product.status]}
                            </Badge>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => openEditModal(product)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => openDeleteModal(product)}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    上一頁
                  </Button>
                  <span className="text-sm text-gray-600">第 {currentPage} / {totalPages} 頁</span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    下一頁
                  </Button>
                </div>
              )}
            </Card>
          </>
        )}

        <Modal
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          title={editingProduct ? '編輯商品' : '新增商品'}
          size="lg"
        >
          <div className="flex flex-col gap-4">
            <Input
              label="商品名稱"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="請輸入商品名稱"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-900">商品描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="請輸入商品描述"
                rows={3}
                className={cn(
                  'w-full px-3 py-2 rounded-md border border-gray-200 bg-white',
                  'text-gray-900 placeholder:text-gray-400',
                  'transition-all duration-150',
                  'focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20'
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="價格"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0"
              />
              <Input
                label="原價"
                type="number"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-900">分類</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={cn(
                    'w-full h-10 px-3 rounded-md border border-gray-200 bg-white',
                    'text-gray-900',
                    'transition-all duration-150',
                    'focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20'
                  )}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <Input
                label="庫存"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-900">商品圖片</label>
              <div
                className={cn(
                  'border-2 border-dashed border-gray-200 rounded-lg p-8',
                  'flex flex-col items-center justify-center gap-2',
                  'text-gray-400 hover:border-pink-400 transition-colors cursor-pointer'
                )}
              >
                <ImageIcon className="w-8 h-8" />
                <p className="text-sm">點擊或拖曳上傳圖片</p>
                <p className="text-xs">支援 JPG, PNG 格式</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setIsProductModalOpen(false)}>
                取消
              </Button>
              <Button className="flex-1" onClick={handleSaveProduct} disabled={saving}>
                {saving ? '儲存中...' : '儲存'}
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="刪除商品"
          size="sm"
        >
          <div className="flex flex-col gap-4">
            <p className="text-gray-600">
              確定要刪除「<span className="font-medium text-gray-900">{productToDelete?.name}</span>」嗎？
              此操作無法撤銷。
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>
                取消
              </Button>
              <Button className="flex-1" onClick={handleDeleteProduct} disabled={deleting}>
                {deleting ? '刪除中...' : '刪除'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </MerchantLayout>
  );
}