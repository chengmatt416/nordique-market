'use client';

import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import {
  Shield,
  Truck,
  Headphones,
  CreditCard,
  ShoppingBag,
  Search,
  Heart,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const features = [
  { icon: Shield, title: '安全支付', desc: '多重加密保護' },
  { icon: Truck, title: '快速配送', desc: '全台快速到貨' },
  { icon: Headphones, title: '24/7 客服', desc: '隨時為您服務' },
  { icon: CreditCard, title: '便捷付款', desc: '多種支付方式' },
];

const categories = [
  { name: '時尚', icon: ShoppingBag },
  { name: '電子產品', icon: Search },
  { name: '家居', icon: Heart },
  { name: '美妝', icon: Heart },
  { name: '運動', icon: TrendingUp },
  { name: '食品', icon: ShoppingBag },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-bold text-gray-900 tracking-tight"
          >
            AURA
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/search"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              商品
            </Link>
            <Link
              href="/auth/signin"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              登入
            </Link>
            <Link href="/auth/signin">
              <Button variant="primary" size="sm" className="rounded-lg">
                開始銷售
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-6xl mx-auto text-center"
        >
          <motion.div variants={fadeInUp} className="mb-4">
            <Badge variant="accent">探索北歐光環，感受純淨生活之美</Badge>
          </motion.div>
          <motion.h1
            variants={fadeInUp}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight tracking-tight"
          >
            探索美好生活
            <br />
            <span className="text-pink-400">從這裡開始</span>
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="text-base text-gray-500 mb-8 max-w-md mx-auto"
          >
            精選來自北歐的優質商品，為您打造簡約舒適的家居生活體驗
          </motion.p>
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link href="/search">
              <Button size="lg" className="bg-gray-900 hover:bg-gray-800 rounded-lg">
                開始選購
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline" size="lg" className="rounded-lg">
                商家入駐
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {features.map((f) => (
              <motion.div key={f.title} variants={fadeInUp}>
                <Card className="bg-gray-50 border-gray-200">
                  <f.icon className="w-5 h-5 text-gray-900 mb-3" />
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    {f.title}
                  </h3>
                  <p className="text-xs text-gray-500">{f.desc}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">商品分類</h2>
            <p className="text-sm text-gray-500">探索各類精選商品</p>
          </motion.div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/search?category=${encodeURIComponent(cat.name)}`}
              >
                <div className="aspect-square bg-white rounded-xl p-4 flex flex-col items-center justify-center gap-2 border border-gray-200 hover:border-pink-300 hover:shadow-sm transition-all cursor-pointer">
                  <cat.icon className="w-6 h-6 text-gray-500" />
                  <span className="text-xs font-medium text-gray-700">
                    {cat.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gray-900">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            AURA 為您服務
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto mb-2">
            超過 50,000+ 位滿意顧客
          </p>
          <p className="text-gray-400 max-w-lg mx-auto mb-8">
            200+ 家優質商家，5,000+ 件精選商品
          </p>
          <Link href="/search">
            <Button
              size="lg"
              className="bg-white text-gray-900 hover:opacity-90 rounded-lg"
            >
              開始購物
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div>
              <span className="text-xl font-bold text-gray-900">AURA</span>
              <p className="text-sm text-gray-500 mt-2 max-w-xs">
                帶給您北歐極簡美學的購物體驗
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">支援</h4>
                <ul className="space-y-2 text-gray-500">
                  <li>幫助中心</li>
                  <li>聯絡客服</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">法律</h4>
                <ul className="space-y-2 text-gray-500">
                  <li>隱私權政策</li>
                  <li>服務條款</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} AURA. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}