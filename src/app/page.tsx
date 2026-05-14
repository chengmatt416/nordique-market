'use client';

import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { Shield, Truck, Headphones, CreditCard, ShoppingBag, Zap, Heart, Leaf } from 'lucide-react';
import { BrandConfig } from '@/config/brand';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield,
  Truck,
  Headphones,
  CreditCard,
  ShoppingBag,
  Zap,
  Heart,
  Leaf,
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const categories = [
  { name: '時尚', icon: ShoppingBag, color: 'bg-[var(--accent)]' },
  { name: '電子產品', icon: Zap, color: 'bg-[var(--accent-secondary)]' },
  { name: '家居', icon: Heart, color: 'bg-[var(--accent)]' },
  { name: '美妝', icon: Leaf, color: 'bg-[var(--accent-secondary)]' },
  { name: '運動', icon: Zap, color: 'bg-[var(--accent)]' },
  { name: '食品', icon: Leaf, color: 'bg-[var(--accent-secondary)]' },
];

const socialLinks = [
  { name: 'Facebook', href: BrandConfig.social.facebook },
  { name: 'Instagram', href: BrandConfig.social.instagram },
  { name: 'LINE', href: `https://line.me/ti/p/${BrandConfig.social.line}` },
];

const footerLinks = BrandConfig.footer;

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--secondary)]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <span className="absolute inset-0 blur-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] opacity-30 rounded-lg"></span>
<span className="relative text-2xl font-bold text-[var(--primary)] bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
                {BrandConfig.name}
              </span>
          </motion.div>
          <motion.nav
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-6"
          >
            <Link
              href="/auth/signin"
              className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
            >
              登入
            </Link>
            <Link
              href="/auth/signin"
              className="h-10 px-5 bg-[var(--primary)] text-white rounded-[var(--radius-sm)] flex items-center justify-center hover:brightness-110 transition-all"
            >
              開始銷售
            </Link>
          </motion.nav>
        </div>
      </header>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.span
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="inline-block px-4 py-2 bg-[var(--accent)]/20 text-[var(--primary)] rounded-full text-sm font-medium mb-6"
            >
              {BrandConfig.tagline}
            </motion.span>
            <motion.h1
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-6xl font-bold text-[var(--primary)] mb-6 leading-tight"
            >
              探索美好生活
              <br />
              <span className="text-[var(--accent)]">從這裡開始</span>
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-lg text-[var(--text-secondary)] mb-10 max-w-xl mx-auto"
            >
              精選來自北歐的優質商品，為您打造簡約舒適的家居生活體驗
            </motion.p>
            <motion.div variants={fadeInUp} transition={{ duration: 0.6 }} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signin"
                className="h-12 px-8 bg-[var(--primary)] text-white rounded-[var(--radius-sm)] flex items-center justify-center hover:brightness-110 transition-all text-lg font-medium"
              >
                登入
              </Link>
              <Link
                href="/auth/signin"
                className="h-12 px-8 border-2 border-[var(--primary)] text-[var(--primary)] rounded-[var(--radius-sm)] flex items-center justify-center hover:bg-[var(--primary)] hover:text-white transition-all text-lg font-medium"
              >
                開始銷售
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {BrandConfig.features.map((feature, index) => {
              const IconComponent = iconMap[feature.icon];
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  transition={{ duration: 0.6 }}
                  className="p-6 bg-[var(--secondary)] rounded-[var(--radius-lg)] hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-[var(--accent)]/20 rounded-[var(--radius-md)] flex items-center justify-center mb-4">
                    {IconComponent && <IconComponent className="w-6 h-6 text-[var(--primary)]" />}
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--primary)] mb-2">{feature.title}</h3>
                  <p className="text-[var(--text-secondary)] text-sm">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)] mb-4">
              探索商品分類
            </h2>
            <p className="text-[var(--text-secondary)]">尋找您喜愛的商品</p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {categories.map((category, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                transition={{ duration: 0.6 }}
                className="group cursor-pointer"
              >
                <div className="aspect-square rounded-[var(--radius-lg)] bg-white p-6 flex flex-col items-center justify-center gap-4 shadow-sm hover:shadow-md transition-all group-hover:-translate-y-1">
                  <div className={`w-14 h-14 ${category.color} rounded-full flex items-center justify-center`}>
                    <category.icon className="w-7 h-7 text-[var(--primary)]" />
                  </div>
                  <span className="text-[var(--text-primary)] font-medium">{category.name}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6 bg-[var(--primary)]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              為什麼選擇 {BrandConfig.name}？
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              我們致力於提供最優質的購物體驗，讓每一位顧客都能享受北歐簡約生活的美好
            </p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
          >
            {[
              { title: BrandConfig.stats.customers, subtitle: '滿意顧客' },
              { title: BrandConfig.stats.merchants, subtitle: '優質商家' },
              { title: BrandConfig.stats.products, subtitle: '精選商品' },
            ].map((stat, index) => (
              <motion.div key={index} variants={fadeInUp} transition={{ duration: 0.6 }} className="text-white">
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.title}</div>
                <div className="text-white/70">{stat.subtitle}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <footer className="bg-white border-t border-[var(--border)] py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            <div className="lg:col-span-2">
              <div className="text-2xl font-bold text-[var(--primary)] mb-4">{BrandConfig.name}</div>
              <p className="text-[var(--text-secondary)] mb-6 max-w-sm">
                帶給您北歐極簡美學的購物體驗
              </p>
              <div className="flex gap-4">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="w-10 h-10 bg-[var(--secondary)] rounded-full flex items-center justify-center hover:bg-[var(--accent)] transition-colors"
                  >
                    <span className="text-sm font-medium text-[var(--text-primary)]">{link.name[0]}</span>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-[var(--primary)] mb-4">公司</h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[var(--primary)] mb-4">支援</h4>
              <ul className="space-y-3">
                {footerLinks.support.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[var(--primary)] mb-4">法律</h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-[var(--border)] text-center text-[var(--text-muted)] text-sm">
            © {new Date().getFullYear()} {BrandConfig.name}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}