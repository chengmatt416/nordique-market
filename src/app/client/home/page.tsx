'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Button, Card, Badge } from '@/components/ui';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { formatPrice, cn, calculateDiscount, productImageUrl } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, Clock, Sparkles, ShoppingBag, Zap, ArrowRight, AlertTriangle } from 'lucide-react';
import { deobfuscateProduct } from '@/lib/crypto';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  images: string[];
  sold: number;
}

const categories = [
  { name: '時尚', icon: 'ShoppingBag' },
  { name: '電子', icon: 'Zap' },
  { name: '家居', icon: 'Heart' },
  { name: '美妝', icon: 'Sparkles' },
  { name: '運動', icon: 'ShoppingBag' },
  { name: '食品', icon: 'ShoppingBag' },
] as const;

const iconMap: Record<string, React.ReactNode> = {
  ShoppingBag: <ShoppingBag className="w-6 h-6" />,
  Zap: <Zap className="w-6 h-6" />,
  Heart: <Heart className="w-6 h-6" />,
  Sparkles: <Sparkles className="w-6 h-6" />,
};

function ProductCard({ product, index }: { product: Product; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const discount = calculateDiscount(product.originalPrice, product.price);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/client/product/${product.id}`}>
        <Card
          hover
          padding="none"
          className="overflow-hidden group bg-white"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            <img
              src={productImageUrl(product, 400)}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {discount > 0 && (
              <div className="absolute top-2 left-2">
                <Badge variant="error" className="text-xs font-semibold">{discount}% OFF</Badge>
              </div>
            )}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2"
            >
              <button
                onClick={(e) => { e.preventDefault(); }}
                className="p-2 bg-white rounded-full hover:bg-white/90 transition-colors"
              >
                <Heart className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); }}
                className="p-2 bg-white rounded-full hover:bg-white/90 transition-colors"
              >
                <ShoppingCart className="w-5 h-5 text-indigo-600" />
              </button>
            </motion.div>
          </div>
          <div className="p-3">
            <h3 className="font-medium text-gray-900 truncate text-sm leading-tight">
              {product.name}
            </h3>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-lg font-bold text-indigo-600">{formatPrice(product.price)}</span>
              {product.originalPrice > product.price && (
                <span className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
              )}
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="text-xs text-gray-500">{product.rating.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({product.reviewCount})</span>
              </div>
              <span className="text-xs text-gray-400">已售 {product.sold}</span>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
      <p className="text-gray-500 text-lg mb-4">尚無商品</p>
      <Link href="/firebase-setup">
        <Button>前往 Firebase 設定</Button>
      </Link>
    </div>
  );
}

function ErrorBanner() {
  return (
    <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-amber-800">Firebase 尚未設定</p>
        <p className="text-xs text-amber-600 mt-0.5">請先完成 Firebase 設定以載入商品資料</p>
      </div>
      <Link href="/firebase-setup">
        <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100">
          前往設定
        </Button>
      </Link>
    </div>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flashSale, setFlashSale] = useState<{ active: boolean; title: string; subtitle: string; endTime: string } | null>(null);
  const [merchantEnabled, setMerchantEnabled] = useState(true);
  const [fatalError, setFatalError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const [prodRes, brandRes] = await Promise.all([
          fetch('/api/products').catch(() => null),
          fetch('/api/brand').catch(() => null),
        ]);
        if (prodRes?.ok) {
          const data = await prodRes.json();
          const raw = data.products || [];
          setProducts(Array.isArray(raw) ? raw.map((p: any) => p._e ? deobfuscateProduct(p) : p) : []);
        } else if (prodRes?.status === 503) {
          setError('firebase_not_configured');
        } else {
          setError('fetch_failed');
        }
        if (brandRes?.ok) {
          const brand = await brandRes.json();
          if (brand?.flashSale?.active) {
            setFlashSale(brand.flashSale);
          }
          if (brand.merchantSignupEnabled !== undefined) {
            setMerchantEnabled(brand.merchantSignupEnabled === 'true');
          }
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'unknown';
        setError('fetch_failed');
        setFatalError(msg);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (fatalError) {
    return (
      <ClientLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">頁面載入錯誤</h2>
          <p className="text-gray-600 mb-2">{fatalError}</p>
          <button onClick={() => window.location.reload()} className="text-indigo-600 hover:underline text-sm">重新整理</button>
        </div>
      </ClientLayout>
    );
  }

  const featuredProducts = products.slice(0, 4);
  const recommendedProducts = products.slice(4, 8);

  return (
    <ClientLayout>
      <div className="space-y-8">

        <section className="relative bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-2xl p-8 md:p-12 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-pink-400 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-pink-400 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <Badge variant="accent" className="mb-4 bg-white/20 text-white border-0">
              <Sparkles className="w-3 h-3 mr-1" /> 新品上架
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              探索精選商品
            </h1>
            <p className="text-white/80 text-lg mb-6 max-w-lg">
               從設計美學中尋找靈感，為您的家居生活注入簡約與舒適的完美平衡
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/search">
                <Button variant="secondary" className="bg-white text-indigo-600 hover:bg-white/90">
                  開始選購
                </Button>
              </Link>
              {merchantEnabled && (
              <Link href="/auth/signin?role=merchant">
                <Button variant="outline" className="border border-white/30 text-white hover:bg-white hover:text-indigo-600">
                  開店當老闆
                </Button>
              </Link>
              )}
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">商品分類</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-6 md:overflow-visible">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/search?category=${category.name}`}>
                  <Card
                    hover
                    padding="md"
                    className="flex flex-col items-center gap-2 min-w-[100px] cursor-pointer text-center"
                  >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-indigo-50 text-indigo-600">
                      {iconMap[category.icon] || <ShoppingBag className="w-6 h-6" />}
                    </div>
                    <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                      {category.name}
                    </span>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {flashSale?.active && (
        <Card padding="md" className="bg-pink-50 border-pink-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-pink-400 flex items-center justify-center">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  {flashSale.title || '限時閃購'}
                  <Badge variant="error" className="text-xs">限時優惠</Badge>
                </h3>
                <p className="text-sm text-gray-500">{flashSale.subtitle || ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/search">
                <Button size="sm">搶購</Button>
              </Link>
            </div>
          </div>
        </Card>
        )}

        {error === 'firebase_not_configured' && (
          <section>
            <ErrorBanner />
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">熱門商品</h2>
            <Link href="/search" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
              查看全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            ) : featuredProducts.length === 0 ? (
              <div className="col-span-2 md:col-span-4">
                <EmptyState />
              </div>
            ) : (
              featuredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))
            )}
          </div>
        </section>

        {!loading && recommendedProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">為您推薦</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendedProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </section>
        )}

      </div>
    </ClientLayout>
  );
}