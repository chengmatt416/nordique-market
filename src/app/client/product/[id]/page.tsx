'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Button, Badge } from '@/components/ui';
import { formatPrice, cn, calculateDiscount } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, Minus, Plus, Truck, Shield, RotateCcw } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

const sampleProduct = {
  id: '1',
  name: '北歐簡約陶瓷花瓶',
  price: 1299,
  originalPrice: 1999,
  rating: 4.8,
  reviews: 236,
  stock: true,
  description: '採用優質陶瓷素材，簡約的北歐風格設計，適合各種室內裝潢風格。精細的手工製作，每一件都是獨一無二的藝術品。適用於客廳、臥室或書房，為您的空間增添優雅的氣息。',
  specs: [
    { label: '材質', value: '優質陶瓷' },
    { label: '尺寸', value: '高 25cm x 寬 12cm' },
    { label: '重量', value: '約 800g' },
    { label: '產地', value: '中國' },
    { label: '保固', value: '6 個月' },
  ],
  images: ['vase-1', 'vase-2', 'vase-3', 'vase-4', 'vase-5'],
};

const reviews = [
  { id: 1, user: '林小姐', rating: 5, date: '2024-01-15', content: '非常漂亮的花瓶，和我家裝修風格很搭！包裝也很用心，沒有任何損壞。' },
  { id: 2, user: '王小明', rating: 4, date: '2024-01-10', content: '質量很好，物流也很快。就是希望能有多一點顏色可以選擇。' },
  { id: 3, user: '陳小姐', rating: 5, date: '2024-01-05', content: '性價比很高，已經回購第二個了！' },
  { id: 4, user: '張先生', rating: 5, date: '2024-01-01', content: '送禮也很合適，朋友很喜歡！' },
];

const similarProducts = [
  { id: '2', name: '純手工羊毛抱枕', price: 899, originalPrice: 1499, rating: 4.9, image: 'pillow-2' },
  { id: '3', name: '實木多功能收納架', price: 2599, originalPrice: 3299, rating: 4.7, image: 'shelf-3' },
  { id: '4', name: 'LED智能北歐桌燈', price: 1899, originalPrice: 2499, rating: 4.6, image: 'lamp-4' },
  { id: '6', name: '創意幾何地毯', price: 2199, originalPrice: 2999, rating: 4.5, image: 'rug-6' },
];

const sizes = ['S', 'M', 'L', 'XL'];
const colors = ['黑色', '白色', '藍色'];

export default function ProductPage() {
  const params = useParams();
  const { showToast } = useToast();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const discount = calculateDiscount(sampleProduct.originalPrice, sampleProduct.price);
  const imageUrl = (seed: string) => `https://picsum.photos/seed/${seed}/400/400`;

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      showToast('請選擇尺寸和顏色', 'warning');
      return;
    }
    showToast('已加入購物車', 'success');
  };

  const tabs = [
    { id: 'description', label: '商品描述' },
    { id: 'specs', label: '規格資訊' },
    { id: 'reviews', label: '評價' },
  ];

  return (
    <ClientLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-6">
          <Link href="/" className="hover:text-[var(--primary)]">首頁</Link>
          <span>/</span>
          <Link href="/search" className="hover:text-[var(--primary)]">商品</Link>
          <span>/</span>
          <span className="text-[var(--text-primary)]">{sampleProduct.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="space-y-4">
            <div className="relative aspect-square rounded-[var(--radius-lg)] overflow-hidden bg-[var(--secondary)]">
              <img
                src={imageUrl(sampleProduct.images[selectedImage])}
                alt={sampleProduct.name}
                className="w-full h-full object-cover"
              />
              <Badge variant="error" className="absolute top-4 left-4">
                {discount}% OFF
              </Badge>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {sampleProduct.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={cn(
                    'aspect-square rounded-[var(--radius-md)] overflow-hidden border-2 transition-all',
                    selectedImage === idx
                      ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/20'
                      : 'border-transparent hover:border-[var(--border)]'
                  )}
                >
                  <img
                    src={imageUrl(img)}
                    alt={`${sampleProduct.name} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-3">
                {sampleProduct.name}
              </h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'w-4 h-4',
                        i < Math.floor(sampleProduct.rating)
                          ? 'fill-[var(--warning)] text-[var(--warning)]'
                          : 'fill-none text-[var(--border)]'
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-[var(--text-secondary)]">
                  {sampleProduct.rating} ({sampleProduct.reviews} 評價)
                </span>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-[var(--primary)]">
                {formatPrice(sampleProduct.price)}
              </span>
              <span className="text-lg text-[var(--text-muted)] line-through">
                {formatPrice(sampleProduct.originalPrice)}
              </span>
            </div>

            <Badge variant="success" className="text-sm">
              尚有庫存
            </Badge>

            <div className="space-y-4 pt-4 border-t border-[var(--border)]">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  尺寸
                </label>
                <div className="flex gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        'min-w-[48px] h-10 px-3 rounded-[var(--radius-sm)] border transition-all',
                        selectedSize === size
                          ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--primary)] font-medium'
                          : 'border-[var(--border)] hover:border-[var(--accent)]'
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  顏色
                </label>
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        'min-w-[80px] h-10 px-3 rounded-[var(--radius-sm)] border transition-all',
                        selectedColor === color
                          ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--primary)] font-medium'
                          : 'border-[var(--border)] hover:border-[var(--accent)]'
                      )}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  數量
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-[var(--radius-sm)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(99, quantity + 1))}
                    className="w-10 h-10 rounded-[var(--radius-sm)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-5 h-5" />
                加入購物車
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-4"
              >
                <Heart className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--border)]">
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <Truck className="w-4 h-4" />
                <span>快速配送</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <Shield className="w-4 h-4" />
                <span>品質保證</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <RotateCcw className="w-4 h-4" />
                <span>7天退換</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-[var(--border)] mb-6">
          <div className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'pb-3 text-sm font-medium transition-colors border-b-2 -mb-[1px]',
                  activeTab === tab.id
                    ? 'border-[var(--accent)] text-[var(--primary)]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-12">
          {activeTab === 'description' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="prose prose-sm max-w-none text-[var(--text-secondary)] leading-relaxed"
            >
              <p>{sampleProduct.description}</p>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
              <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            </motion.div>
          )}

          {activeTab === 'specs' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <table className="w-full">
                <tbody>
                  {sampleProduct.specs.map((spec, idx) => (
                    <tr key={spec.label} className={cn(idx !== sampleProduct.specs.length - 1 && 'border-b border-[var(--border)]')}>
                      <td className="py-3 text-sm font-medium text-[var(--text-primary)] w-32">
                        {spec.label}
                      </td>
                      <td className="py-3 text-sm text-[var(--text-secondary)]">
                        {spec.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 bg-[var(--surface)] rounded-[var(--radius-md)] border border-[var(--border)]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[var(--text-primary)]">{review.user}</span>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'w-3 h-3',
                              i < review.rating
                                ? 'fill-[var(--warning)] text-[var(--warning)]'
                                : 'fill-none text-[var(--border)]'
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">{review.date}</span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">{review.content}</p>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        <section>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">相似商品</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similarProducts.map((product) => (
              <Link key={product.id} href={`/client/product/${product.id}`}>
                <div className="bg-[var(--surface)] rounded-[var(--radius-md)] border border-[var(--border)] overflow-hidden hover:shadow-md transition-shadow">
                  <img
                    src={imageUrl(product.image)}
                    alt={product.name}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-[var(--text-primary)] truncate mb-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-3 h-3 fill-[var(--warning)] text-[var(--warning)]" />
                      <span className="text-xs text-[var(--text-secondary)]">{product.rating}</span>
                    </div>
                    <span className="text-sm font-bold text-[var(--primary)]">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </motion.div>

      <div className="md:hidden fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-[var(--surface)] via-[var(--surface)] to-transparent z-40">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <span className="text-2xl font-bold text-[var(--primary)]">
              {formatPrice(sampleProduct.price)}
            </span>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="w-5 h-5" />
            加入購物車
          </Button>
        </div>
      </div>
    </ClientLayout>
  );
}