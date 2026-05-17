'use client';
import { useState, useEffect } from 'react';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Button, Badge, Card } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { formatPrice, cn, productImageUrl } from '@/lib/utils';
import { Star, ShoppingCart, Heart, Minus, Plus, Truck, Shield, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { addToCart as addToCartStore } from '@/lib/cart';

interface ProductData {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  images: string[];
  specs?: { label: string; value: string }[];
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  reviews?: { id: number; user: string; rating: number; comment: string; date: string }[];
  stock?: number;
  category?: string;
  merchantName?: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const { showToast } = useToast();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [similarProducts, setSimilarProducts] = useState<{ id: string; name: string; price: number; image: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isFavorited, setIsFavorited] = useState(false);

  const productId = params?.id as string;

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/products');
        if (!res.ok) {
          if (res.status === 503) {
            setError('firebase_not_configured');
          } else {
            setError('fetch_failed');
          }
          return;
        }
        const data = await res.json();
        const products: ProductData[] = data.products || [];
        const found = products.find((p: ProductData) => p.id === productId);
        if (found) {
          setProduct(found);
          setSelectedSize(found.sizes?.[0] || '');
        } else {
          setError('not_found');
        }
        setSimilarProducts(
          products
            .filter((p: ProductData) => p.id !== productId)
            .slice(0, 4)
            .map((p: ProductData) => ({
              id: p.id,
              name: p.name,
              price: p.price,
              image: productImageUrl(p, 400),
            }))
        );
      } catch {
        setError('fetch_failed');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  const addToCart = () => {
    if (product) {
      addToCartStore({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image: productImageUrl(product, 120),
        variant: selectedSize ? `${selectedSize}${colors[selectedColor] ? ' / ' + colors[selectedColor].name : ''}` : colors[selectedColor]?.name,
      });
      showToast(`已加入購物車: ${product.name} x${quantity}`, 'success');
    }
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="min-h-screen bg-gray-50 py-6">
          <div className="mx-auto max-w-6xl px-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-8" />
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="aspect-square bg-gray-200 rounded-xl" />
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-6 bg-gray-200 rounded w-1/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-10 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          </div>
        </div>
      </ClientLayout>
    );
  }

  if (error === 'firebase_not_configured') {
    return (
      <ClientLayout>
        <div className="min-h-screen bg-gray-50 py-6">
          <div className="mx-auto max-w-6xl px-4 text-center py-20">
            <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">資料庫尚未設定</h2>
            <p className="text-gray-600 mb-6">請先完成 Firebase 設定以載入商品資料</p>
            <Link href="/firebase-setup">
              <Button>前往設定</Button>
            </Link>
          </div>
        </div>
      </ClientLayout>
    );
  }

  if (error === 'not_found' || !product) {
    return (
      <ClientLayout>
        <div className="min-h-screen bg-gray-50 py-6">
          <div className="mx-auto max-w-6xl px-4 text-center py-20">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">商品不存在</h2>
            <p className="text-gray-600 mb-6">找不到此商品</p>
            <Link href="/search">
              <Button>瀏覽商品</Button>
            </Link>
          </div>
        </div>
      </ClientLayout>
    );
  }

  const images = product.images?.length ? product.images : [productImageUrl(product, 800)];
  const sizes = product.sizes || [];
  const colors = product.colors || [];
  const specs = product.specs || [];
  const reviews = product.reviews || [];
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

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
                  src={images[selectedImage]}
                  alt={product.name}
                  className="aspect-square w-full object-cover"
                />
              </div>
              <div className="flex gap-2">
                {images.map((img, index) => (
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
                      alt={`${product.name} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{product.name}</h1>

              <div className="mt-3 flex items-center gap-3">
                <span className="text-2xl font-bold text-indigo-600">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-gray-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <Badge className="bg-pink-400 text-white">-{discount}%</Badge>
                  </>
                )}
              </div>

              <p className="mt-3 text-sm text-green-600">
                {product.stock && product.stock > 0 ? '尚有庫存' : '暫時缺貨'}
              </p>

              {/* Size Selector */}
              {sizes.length > 0 && (
              <div className="mt-6">
                <p className="mb-2 text-sm font-medium text-gray-900">
                  尺寸：<span className="text-gray-600">{selectedSize}</span>
                </p>
                <div className="flex gap-2">
                  {sizes.map((size) => (
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
              )}

              {/* Color Selector */}
              {colors.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-gray-900">
                  顏色：<span className="text-gray-600">{colors[selectedColor].name}</span>
                </p>
                <div className="flex gap-3">
                  {colors.map((color, index) => (
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
              )}

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
                ...(specs.length ? [{ key: 'specs', label: '規格資訊' }] : []),
                ...(reviews.length ? [{ key: 'reviews', label: '評價' }] : []),
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
                  <p className="leading-relaxed text-gray-600">{product.description}</p>
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="rounded-xl bg-white p-6">
                  <div className="divide-y divide-gray-100">
                    {specs.map((spec) => (
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
                  {reviews.map((review) => (
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
          {similarProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 text-lg font-bold text-gray-900">你可能也會喜歡</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {similarProducts.map((sp) => (
                <Link key={sp.id} href={`/client/product/${sp.id}`}>
                  <Card className="overflow-hidden rounded-xl bg-white transition-shadow hover:shadow-md">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={sp.image}
                        alt={sp.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-900">{sp.name}</p>
                      <p className="mt-1 text-sm font-semibold text-indigo-600">
                        {formatPrice(sp.price)}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
          )}
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