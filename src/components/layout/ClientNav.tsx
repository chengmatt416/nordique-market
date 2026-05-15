'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, ShoppingCart, User, Menu, X } from 'lucide-react';
import Link from 'next/link';

export function ClientNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/client/home" className="text-lg font-bold text-gray-900 tracking-tight">
            AURA
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋商品..."
                className="w-full h-9 pl-9 pr-3 text-sm bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
          </form>

          <div className="flex items-center gap-1">
            <Link href="/search" className="p-2 text-gray-500 hover:text-gray-900 transition-colors md:hidden">
              <Search className="w-5 h-5" />
            </Link>
            <Link href="/client/cart" className="p-2 text-gray-500 hover:text-gray-900 transition-colors relative">
              <ShoppingCart className="w-5 h-5" />
            </Link>
            <Link href="/auth/signin" className="p-2 text-gray-500 hover:text-gray-900 transition-colors">
              <User className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-500 hover:text-gray-900 transition-colors md:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 bg-white"
          >
            <div className="p-4 space-y-2">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜尋商品..."
                    className="w-full h-10 pl-9 pr-3 text-sm bg-gray-100 border-0 rounded-lg"
                  />
                </div>
              </form>
              <Link href="/client/home" className="block py-2 text-sm text-gray-600">首頁</Link>
              <Link href="/search" className="block py-2 text-sm text-gray-600">商品分類</Link>
              <Link href="/client/cart" className="block py-2 text-sm text-gray-600">購物車</Link>
              <Link href="/client/orders" className="block py-2 text-sm text-gray-600">我的訂單</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}