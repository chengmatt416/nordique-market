'use client';

import { useState } from 'react';
import { MerchantLayout } from '@/components/layout/MerchantLayout';
import { Card, Badge, Button, Input, Modal } from '@/components/ui';
import { formatPrice, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit, Trash2, ImageIcon } from 'lucide-react';

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

const initialProducts: Product[] = [
  {
    id: '1',
    name: '北歐簡約大理石時鐘',
    description: '採用進口白色大理石，線條簡潔優雅，適合現代家居風格',
    category: '時鐘',
    price: 2880,
    originalPrice: 3500,
    stock: 15,
    status: 'active',
    image: 'clock-1',
  },
  {
    id: '2',
    name: '實木書架',
    description: '北美進口白橡木，保留自然紋理，簡約北歐設計',
    category: '家具',
    price: 5600,
    originalPrice: 6800,
    stock: 8,
    status: 'active',
    image: 'shelf-1',
  },
  {
    id: '3',
    name: '羊毛北歐地毯',
    description: '100%純羊毛編織，柔軟舒適，圖案優雅大方',
    category: '地毯',
    price: 4200,
    originalPrice: 5000,
    stock: 0,
    status: 'inactive',
    image: 'rug-1',
  },
  {
    id: '4',
    name: '設計師款陶瓷花瓶',
    description: '手工製作的藝術陶瓷，啞光質感，自然色澤',
    category: '裝飾品',
    price: 1280,
    originalPrice: 1500,
    stock: 23,
    status: 'pending',
    image: 'vase-1',
  },
  {
    id: '5',
    name: 'LED北歐壁燈',
    description: '暖白光LED光源，金屬與木材結合，營造溫馨氛圍',
    category: '燈具',
    price: 1980,
    originalPrice: 2400,
    stock: 12,
    status: 'active',
    image: 'lamp-1',
  },
  {
    id: '6',
    name: '極簡皮革扶手椅',
    description: '頭層牛皮搭配實木框架，人體工學設計',
    category: '家具',
    price: 12800,
    originalPrice: 15000,
    stock: 3,
    status: 'active',
    image: 'chair-1',
  },
  {
    id: '7',
    name: '木質收納盒套裝',
    description: '實木與布藝結合，多功能收納整理',
    category: '收納',
    price: 880,
    originalPrice: 1100,
    stock: 30,
    status: 'inactive',
    image: 'box-1',
  },
  {
    id: '8',
    name: '創意幾何掛鉤組',
    description: '黃銅材質，幾何造型，方便實用又美觀',
    category: '五金配件',
    price: 560,
    originalPrice: 700,
    stock: 45,
    status: 'pending',
    image: 'hook-1',
  },
];

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
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: categories[0],
    price: '',
    originalPrice: '',
    stock: '',
    image: '',
  });

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

  const handleSaveProduct = () => {
    if (!formData.name || !formData.price || !formData.stock) return;

    const newProduct: Product = {
      id: editingProduct?.id || Date.now().toString(),
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
      setProducts(products.map((p) => (p.id === editingProduct.id ? newProduct : p)));
    } else {
      setProducts([newProduct, ...products]);
    }

    setIsProductModalOpen(false);
    resetForm();
  };

  const openDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteProduct = () => {
    if (productToDelete) {
      setProducts(products.filter((p) => p.id !== productToDelete.id));
    }
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  return (
    <MerchantLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">商品管理</h1>
          <Button onClick={openAddModal}>
            <Plus className="w-4 h-4" />
            新增商品
          </Button>
        </div>

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
                    'px-4 py-2 rounded-[var(--radius-sm)] text-sm font-medium transition-colors',
                    filterStatus === status
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--secondary)] text-[var(--text-secondary)] hover:bg-[var(--border)]'
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
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">
                    商品
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-secondary)]">
                    分類
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-[var(--text-secondary)]">
                    價格
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-[var(--text-secondary)]">
                    庫存
                  </th>
                  <th className="text-center p-4 text-sm font-medium text-[var(--text-secondary)]">
                    狀態
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-[var(--text-secondary)]">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-[var(--text-muted)]">
                      找不到商品
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--secondary)]/50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-[var(--radius-sm)] overflow-hidden bg-[var(--secondary)] flex-shrink-0">
                            <img
                              src={`https://picsum.photos/seed/${product.image}/100/100`}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-[var(--text-primary)]">{product.name}</p>
                            <p className="text-sm text-[var(--text-muted)] line-clamp-1 max-w-xs">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-[var(--text-secondary)]">{product.category}</td>
                      <td className="p-4 text-right">
                        <p className="font-medium text-[var(--text-primary)]">
                          {formatPrice(product.price)}
                        </p>
                        {product.originalPrice > product.price && (
                          <p className="text-sm text-[var(--text-muted)] line-through">
                            {formatPrice(product.originalPrice)}
                          </p>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <span
                          className={cn(
                            'font-medium',
                            product.stock === 0
                              ? 'text-[var(--error)]'
                              : product.stock < 5
                              ? 'text-[var(--warning)]'
                              : 'text-[var(--text-primary)]'
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(product)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteModal(product)}
                          >
                            <Trash2 className="w-4 h-4 text-[var(--error)]" />
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
            <div className="flex items-center justify-center gap-2 p-4 border-t border-[var(--border)]">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                上一頁
              </Button>
              <span className="text-sm text-[var(--text-secondary)]">
                第 {currentPage} / {totalPages} 頁
              </span>
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
              <label className="text-sm font-medium text-[var(--text-primary)]">商品描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="請輸入商品描述"
                rows={3}
                className={cn(
                  'w-full px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white',
                  'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                  'transition-all duration-150',
                  'focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20'
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
                <label className="text-sm font-medium text-[var(--text-primary)]">分類</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={cn(
                    'w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white',
                    'text-[var(--text-primary)]',
                    'transition-all duration-150',
                    'focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20'
                  )}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
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
              <label className="text-sm font-medium text-[var(--text-primary)]">商品圖片</label>
              <div
                className={cn(
                  'border-2 border-dashed border-[var(--border)] rounded-[var(--radius-md)] p-8',
                  'flex flex-col items-center justify-center gap-2',
                  'text-[var(--text-muted)] hover:border-[var(--accent)] transition-colors cursor-pointer'
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
              <Button className="flex-1" onClick={handleSaveProduct}>
                儲存
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
            <p className="text-[var(--text-secondary)]">
              確定要刪除「<span className="font-medium text-[var(--text-primary)]">{productToDelete?.name}</span>」嗎？
              此操作無法撤銷。
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>
                取消
              </Button>
              <Button className="flex-1" onClick={handleDeleteProduct}>
                刪除
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </MerchantLayout>
  );
}