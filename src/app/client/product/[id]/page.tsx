'use client';
import { useState } from 'react';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Button, Badge, Card } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { formatPrice, cn } from '@/lib/utils';
import { Star, ShoppingCart, Heart, Minus, Plus, Truck, Shield, ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const PRODUCT = {
  id: '1',
  name: 'Nordique 極簡羊毛大衣',
  price: 4580,
  originalPrice: 5980,
  discount: 23,
  stock: 12,
  images: [
    'https://picsum.photos/seed/coat-main/800/800',
    'https://picsum.photos/seed/coat-1/800/800',
    'https://picsum.photos/seed/coat-2/800/800',
    'https://picsum.photos/seed/coat-3/800/800',
    'https://picsum.photos/seed/coat-4/800/800',
  ],
  description:
    '採用100%純羊毛面料，極簡線條設計，寬鬆版型適合層次穿搭。內裡採用絲滑緞面，保暖舒適不顯臃腫。經典翻領與雙排扣設計，展現北歐質感生活美學。',
  specs: [
    { label: '材質', value: '100% 純羊毛' },
    { label: '版型', value: '寬鬆落肩' },
    { label: '重量', value: '約 1.2 kg' },
    { label: '產地', value: '義大利' },
    { label: '洗滌', value: '建議乾洗' },
  ],
  sizes: ['S', 'M', 'L', 'XL'],
  colors: [
    { name: '焦糖棕', hex: '#C4956A' },
    { name: '深墨黑', hex: '#2D2D2D' },
    { name: '燕麥白', hex: '#F5F0E8' },
  ],
  reviews: [
    { id: 1, user: '林小姐', rating: 5, comment: '質感超好，穿起來很挺，非常滿意！', date: '2026-05-10' },
    { id: 2, user: '陳先生', rating: 4, comment: '版型很好看，但運送有點慢。', date: '2026-04-28' },
    { id: 3, user: '黃小姐', rating: 5, comment: '第二次購買了，品質超讚，會繼續回購。', date: '2026-04-15' },
    { id: 4, user: '張先生', rating: 4, comment: '顏色跟照片一樣，布料也很舒服。', date: '2026-03-30' },
  ],
};

const SIMILAR_PRODUCTS = [
  { id: '2', name: '羊毛混紡圍巾', price: 1280, image: 'https://picsum.photos/seed/sim-1/400/400' },
  { id: '3', name: '針織毛帽', price: 890, image: 'https://picsum.photos/seed/sim-2/400/400' },
  { id: '4', name: '皮革手套', price: 1580, image: 'https://picsum.photos/seed/sim-3/400/400' },
  { id: '5', name: '羊毛長襪', price: 420, image: 'https://picsum.photos/seed/sim-4/400/400' },
];

export default function ProductDetailPage() {
  const params = useParams();
  const { showToast } = useToast();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isFavorited, setIsFavorited] = useState(false);

  const addToCart = () => {
    showToast(`已加入購物車: ${PRODUCT.name} x${quantity}`, 'success');
  };

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="mx-auto max-w-6xl px-4">
          {/* Back Button */}
          <Link
            href="/client/products"
            className="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            返回商品列表
          </Link>

          {/* Main Section */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Image Gallery */}
            <div>
              <div className="mb-3 overflow-hidden rounded-xl bg-white">
                <img
                  src={PRODUCT.images[selectedImage]}
                  alt={PRODUCT.name}
                  className="aspect-square w-full object-cover"
                />
              </div>
              <div className="flex gap-2">
                {PRODUCT.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      'h-20 w-20 overflow-hidden rounded-lg border-2 transition-colors',
                      selectedImage === index
                        ? 'border-indigo-600'
                        : 'border-gray-200 hover:border-gray-400'
                    )}
                  >
                    <img
                      src={img}
                      alt={`${PRODUCT.name} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{PRODUCT.name}</h1>

              <div className="mt-3 flex items-center gap-3">
                <span className="text-2xl font-bold text-indigo-600">
                  {formatPrice(PRODUCT.price)}
                </span>
                <span className="text-gray-400 line-through">
                  {formatPrice(PRODUCT.originalPrice)}
                </span>
                <Badge className="bg-pink-400 text-white">-{PRODUCT.discount}%</Badge>
              </div>

              <p className="mt-3 text-sm text-green-600">尚有庫存</p>

              {/* Size Selector */}
              <div className="mt-6">
                <p className="mb-2 text-sm font-medium text-gray-900">
                  尺寸：<span className="text-gray-600">{selectedSize}</span>
                </p>
                <div className="flex gap-2">
                  {PRODUCT.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        'rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors',
                        selectedSize === size
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-gray-200 bg-white text-gray-900 hover:border-gray-400'
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selector */}
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-gray-900">
                  顏色：<span className="text-gray-600">{PRODUCT.colors[selectedColor].name}</span>
                </p>
                <div className="flex gap-3">
                  {PRODUCT.colors.map((color, index) => (
                    <button
                      key={color.hex}
                      onClick={() => setSelectedColor(index)}
                      className={cn(
                        'h-8 w-8 rounded-full border-2 transition-all',
                        selectedColor === index
                          ? 'ring-2 ring-indigo-600 ring-offset-2'
                          : 'border-gray-200'
                      )}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mt-6">
                <p className="mb-2 text-sm font-medium text-gray-900">數量</p>
                <div className="flex items-center gap-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="rounded-l-lg border border-gray-200 bg-white p-3 text-gray-600 hover:bg-gray-50"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="text"
                    value={quantity}
                    readOnly
                    className="w-14 border-y border-gray-200 bg-white py-3 text-center text-sm font-medium text-gray-900"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="rounded-r-lg border border-gray-200 bg-white p-3 text-gray-600 hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <Button
                  onClick={addToCart}
                  className="flex-1 rounded-xl bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-700 sm:flex-none sm:px-10"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  加入購物車
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl border-2 border-gray-200 px-6 py-3 font-medium text-gray-900 hover:bg-gray-50"
                >
                  立即購買
                </Button>
                <button
                  onClick={() => setIsFavorited(!isFavorited)}
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-xl border-2 transition-colors',
                    isFavorited
                      ? 'border-pink-400 bg-pink-50 text-pink-400'
                      : 'border-gray-200 bg-white text-gray-400 hover:text-gray-600'
                  )}
                >
                  <Heart className={cn('h-5 w-5', isFavorited && 'fill-pink-400')} />
                </button>
              </div>

              {/* Delivery Info */}
              <div className="mt-6 space-y-2 rounded-xl bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Truck className="h-4 w-4 text-gray-400" />
                  全台快速配送，3-5天到貨
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4 text-gray-400" />
                  14天鑑賞期，安心退換貨
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="mt-12">
            <div className="flex border-b border-gray-200">
              {[
                { key: 'description', label: '商品描述' },
                { key: 'specs', label: '規格資訊' },
                { key: 'reviews', label: '評價' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'px-6 py-3 text-sm font-medium transition-colors',
                    activeTab === tab.key
                      ? 'border-b-2 border-indigo-600 text-indigo-600'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mt-6">
              {activeTab === 'description' && (
                <div className="rounded-xl bg-white p-6">
                  <p className="leading-relaxed text-gray-600">{PRODUCT.description}</p>
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="rounded-xl bg-white p-6">
                  <div className="divide-y divide-gray-100">
                    {PRODUCT.specs.map((spec) => (
                      <div key={spec.label} className="flex py-3 first:pt-0 last:pb-0">
                        <span className="w-32 text-sm text-gray-400">{spec.label}</span>
                        <span className="text-sm font-medium text-gray-900">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  {PRODUCT.reviews.map((review) => (
                    <Card key={review.id} className="rounded-xl bg-white p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                          {review.user.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{review.user}</p>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  'h-3.5 w-3.5',
                                  i < review.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-gray-200'
                                )}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">{review.date}</span>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-gray-600">
                        {review.comment}
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Similar Products */}
          <div className="mt-12">
            <h2 className="mb-6 text-lg font-bold text-gray-900">你可能也會喜歡</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {SIMILAR_PRODUCTS.map((product) => (
                <Link key={product.id} href={`/client/product/${product.id}`}>
                  <Card className="overflow-hidden rounded-xl bg-white transition-shadow hover:shadow-md">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="mt-1 text-sm font-semibold text-indigo-600">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Floating Cart Button */}
        <div className="fixed bottom-6 right-6 lg:hidden">
          <button
            onClick={addToCart}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700"
          >
            <ShoppingCart className="h-6 w-6" />
          </button>
        </div>
      </div>
    </ClientLayout>
  );
}