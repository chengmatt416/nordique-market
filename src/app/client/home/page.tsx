'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Button, Card, Badge, ProductCardSkeleton } from '@/components/ui';
import { formatPrice, cn, calculateDiscount } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, Clock, Sparkles, ShoppingBag, Zap, Dumbbell, Apple } from 'lucide-react';
import { BrandConfig } from '@/config/brand';

const iconMap: Record<string, React.ReactNode> = {
  ShoppingBag: <ShoppingBag className="w-6 h-6" />,
  Zap: <Zap className="w-6 h-6" />,
  Heart: <Heart className="w-6 h-6" />,
  Sparkles: <Sparkles className="w-6 h-6" />,
  Dumbbell: <Dumbbell className="w-6 h-6" />,
  Apple: <Apple className="w-6 h-6" />,
};

const sampleProducts = [
  { id: '1', name: '北歐簡約陶瓷花瓶', price: 1299, originalPrice: 1999, rating: 4.8, reviews: 236, image: 'vase-1' },
  { id: '2', name: '純手工羊毛抱枕', price: 899, originalPrice: 1499, rating: 4.9, reviews: 189, image: 'pillow-2' },
  { id: '3', name: '實木多功能收納架', price: 2599, originalPrice: 3299, rating: 4.7, reviews: 156, image: 'shelf-3' },
  { id: '4', name: 'LED智能北歐桌燈', price: 1899, originalPrice: 2499, rating: 4.6, reviews: 98, image: 'lamp-4' },
  { id: '5', name: '極簡純棉床組', price: 3299, originalPrice: 4599, rating: 4.9, reviews: 312, image: 'bed-5' },
  { id: '6', name: '創意幾何地毯', price: 2199, originalPrice: 2999, rating: 4.5, reviews: 145, image: 'rug-6' },
  { id: '7', name: '質感皮革收納盒', price: 799, originalPrice: 1199, rating: 4.7, reviews: 203, image: 'box-7' },
  { id: '8', name: '不鏽鋼保溫水瓶', price: 599, originalPrice: 899, rating: 4.8, reviews: 427, image: 'bottle-8' },
];

function ProductCard({ product, index }: { product: typeof sampleProducts[0]; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const discount = calculateDiscount(product.originalPrice, product.price);
  const imageUrl = `https://picsum.photos/seed/${product.image}/400/400`;

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
          className="overflow-hidden group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative aspect-square overflow-hidden">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <Badge className="absolute top-2 left-2" variant="error">
              {discount}% OFF
            </Badge>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="absolute inset-0 bg-black/40 flex items-center justify-center"
            >
              <Button
                variant="primary"
                size="sm"
                className="bg-white text-[var(--primary)] hover:bg-white/90"
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                <ShoppingCart className="w-4 h-4" />
                加入購物車
              </Button>
            </motion.div>
            <button
              className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full hover:bg-white transition-colors"
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              <Heart className="w-4 h-4 text-[var(--text-secondary)]" />
            </button>
          </div>
          <div className="p-3">
            <h3 className="font-medium text-[var(--text-primary)] truncate mb-1">
              {product.name}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-bold text-[var(--primary)]">
                {formatPrice(product.price)}
              </span>
              <span className="text-sm text-[var(--text-muted)] line-through">
                {formatPrice(product.originalPrice)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-[var(--warning)] text-[var(--warning)]" />
              <span className="text-sm text-[var(--text-secondary)]">
                {product.rating} ({product.reviews})
              </span>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

export default function HomePage() {
  const [countdown, setCountdown] = useState('11:59:59');

  return (
    <ClientLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <section className="relative bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/80 text-white rounded-[var(--radius-lg)] p-8 md:p-12 mb-8 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--accent)] rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <Badge variant="accent" className="mb-4 bg-white/20 text-white">
              <Sparkles className="w-3 h-3 mr-1" />
              新品上架
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              探索精選商品
            </h1>
            <p className="text-white/80 text-lg mb-6 max-w-lg">
              從北歐設計美學中尋找靈感，為您的家居生活注入簡約與舒適的完美平衡
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" className="bg-white text-[var(--primary)] hover:bg-white/90">
                開始選購
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[var(--primary)]">
                了解更多
              </Button>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">商品分類</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-6 md:overflow-visible scrollbar-hide">
            {BrandConfig.categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card
                  hover
                  padding="md"
                  className="flex flex-col items-center gap-2 min-w-[120px] md:min-w-0 cursor-pointer"
                >
                  <div className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center',
                    category.color === 'accent' ? 'bg-[var(--accent)]/10 text-[var(--primary)]' : 'bg-[var(--accent-secondary)]/10 text-[var(--primary)]'
                  )}>
                    {iconMap[category.icon] || <ShoppingBag className="w-6 h-6" />}
                  </div>
                  <span className="text-sm font-medium text-[var(--text-primary)] whitespace-nowrap">
                    {category.name}
                  </span>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <Card padding="md" className="bg-gradient-to-r from-[var(--accent)]/20 to-[var(--accent-secondary)]/20 border-[var(--accent)]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[var(--accent)] flex items-center justify-center">
                  <Clock className="w-6 h-6 text-[var(--primary)]" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                    限時閃購
                    <Badge variant="error" className="text-xs">只剩 12 小時</Badge>
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">精選商品最低 5 折起</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-[var(--primary)] text-white px-3 py-2 rounded-lg font-mono font-bold">
                  {countdown}
                </div>
                <Button variant="primary" size="sm">
                  搶購
                </Button>
              </div>
            </div>
          </Card>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">熱門商品</h2>
            <Link href="/search" className="text-sm text-[var(--accent)] hover:underline">
              查看全部
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sampleProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </section>
      </motion.div>
    </ClientLayout>
  );
}