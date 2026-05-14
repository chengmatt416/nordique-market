'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Button, Card, Badge } from '@/components/ui';
import { formatPrice, cn, calculateDiscount } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, Clock, Sparkles, ShoppingBag, Zap, ArrowRight } from 'lucide-react';
import { BrandConfig } from '@/config/brand';

const iconMap: Record<string, React.ReactNode> = {
  ShoppingBag: <ShoppingBag className="w-6 h-6" />,
  Zap: <Zap className="w-6 h-6" />,
  Heart: <Heart className="w-6 h-6" />,
  Sparkles: <Sparkles className="w-6 h-6" />,
  Dumbbell: <Zap className="w-6 h-6" />,
  Apple: <ShoppingBag className="w-6 h-6" />,
};

const sampleProducts = [
  { id: '1', name: '北歐簡約陶瓷花瓶', price: 1299, originalPrice: 1999, rating: 4.8, reviews: 236, image: 'vase-1', sold: 456 },
  { id: '2', name: '純手工羊毛抱枕', price: 899, originalPrice: 1499, rating: 4.9, reviews: 189, image: 'pillow-2', sold: 234 },
  { id: '3', name: '實木多功能收納架', price: 2599, originalPrice: 3299, rating: 4.7, reviews: 156, image: 'shelf-3', sold: 189 },
  { id: '4', name: 'LED智能北歐桌燈', price: 1899, originalPrice: 2499, rating: 4.6, reviews: 98, image: 'lamp-4', sold: 156 },
  { id: '5', name: '極簡純棉床組', price: 3299, originalPrice: 4599, rating: 4.9, reviews: 312, image: 'bed-5', sold: 98 },
  { id: '6', name: '創意幾何地毯', price: 2199, originalPrice: 2999, rating: 4.5, reviews: 145, image: 'rug-6', sold: 167 },
  { id: '7', name: '質感皮革收納盒', price: 799, originalPrice: 1199, rating: 4.7, reviews: 203, image: 'box-7', sold: 345 },
  { id: '8', name: '不鏽鋼保溫水瓶', price: 599, originalPrice: 899, rating: 4.8, reviews: 427, image: 'bottle-8', sold: 567 },
];

function ProductCard({ product, index }: { product: typeof sampleProducts[0]; index: number }) {
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
          <div className="relative aspect-square overflow-hidden bg-[var(--secondary)]">
            <img
              src={`https://picsum.photos/seed/${product.image}/400/400`}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute top-2 left-2">
              <Badge variant="error" className="text-xs font-semibold">{discount}% OFF</Badge>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2"
            >
              <button
                onClick={(e) => { e.preventDefault(); }}
                className="p-2 bg-white rounded-full hover:bg-white/90 transition-colors"
              >
                <Heart className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); }}
                className="p-2 bg-white rounded-full hover:bg-white/90 transition-colors"
              >
                <ShoppingCart className="w-5 h-5 text-[var(--primary)]" />
              </button>
            </motion.div>
          </div>
          <div className="p-3">
            <h3 className="font-medium text-[var(--text-primary)] truncate text-sm leading-tight">
              {product.name}
            </h3>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-lg font-bold text-[var(--primary)]">{formatPrice(product.price)}</span>
              <span className="text-xs text-[var(--text-muted)] line-through">{formatPrice(product.originalPrice)}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-[var(--warning)] text-[var(--warning)]" />
                <span className="text-xs text-[var(--text-secondary)]">{product.rating}</span>
              </div>
              <span className="text-xs text-[var(--text-muted)]">已售 {product.sold}</span>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

export default function HomePage() {
  const [countdown, setCountdown] = useState({ h: 11, m: 59, s: 59 });

  return (
    <ClientLayout>
      <div className="space-y-8">
        <section className="relative bg-gradient-to-br from-[var(--primary)] via-[var(--primary)] to-[#2d2d4a] text-white rounded-2xl p-8 md:p-12 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-[var(--accent)] rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-[var(--accent-secondary)] rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <Badge variant="accent" className="mb-4 bg-white/20 text-white border-0">
              <Sparkles className="w-3 h-3 mr-1" /> 新品上架
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              探索精選商品
            </h1>
            <p className="text-white/80 text-lg mb-6 max-w-lg">
              從北歐設計美學中尋找靈感，為您的家居生活注入簡約與舒適的完美平衡
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/search">
                <Button variant="secondary" className="bg-white text-[var(--primary)] hover:bg-white/90">
                  開始選購
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[var(--primary)]">
                  開店當老闆
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">商品分類</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-6 md:overflow-visible">
            {BrandConfig.categories.map((category, index) => (
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
                    <div className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center',
                      category.color === 'accent' ? 'bg-[var(--accent)]/20 text-[var(--primary)]' : 'bg-[var(--accent-secondary)]/20 text-[var(--primary)]'
                    )}>
                      {iconMap[category.icon] || <ShoppingBag className="w-6 h-6" />}
                    </div>
                    <span className="text-sm font-medium text-[var(--text-primary)] whitespace-nowrap">
                      {category.name}
                    </span>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        <Card padding="md" className="bg-gradient-to-r from-[var(--accent)]/10 via-[var(--accent)]/5 to-[var(--accent-secondary)]/10 border border-[var(--accent)]/30">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[var(--accent)] flex items-center justify-center">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  限時閃購
                  <Badge variant="error" className="text-xs">只剩 12 小時</Badge>
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">精選商品最低 5 折起</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[`${countdown.h}`, `${countdown.m}`, `${countdown.s}`].map((t, i) => (
                  <span key={i} className="bg-[var(--primary)] text-white px-3 py-2 rounded-lg font-mono font-bold text-lg min-w-[48px] text-center">
                    {t.padStart(2, '0')}
                  </span>
                ))}
              </div>
              <Link href="/search">
                <Button size="sm">搶購</Button>
              </Link>
            </div>
          </div>
        </Card>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">熱門商品</h2>
            <Link href="/search" className="text-sm text-[var(--accent)] hover:underline flex items-center gap-1">
              查看全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sampleProducts.slice(0, 4).map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">為您推薦</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sampleProducts.slice(4).map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </section>
      </div>
    </ClientLayout>
  );
}