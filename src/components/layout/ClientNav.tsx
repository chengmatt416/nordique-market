'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, ShoppingCart, User, Menu, X, LogOut, Store, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

export function ClientNav() {
  const { user, role, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

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

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-indigo-600" />
                    </div>
                  )}
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.displayName || '用戶'}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link href="/client/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <ShoppingCart className="w-4 h-4" /> 我的訂單
                        </Link>
                        <Link href="/client/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <User className="w-4 h-4" /> 個人資料
                        </Link>
                        {role === 'merchant' && (
                          <Link href="/merchant/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            <Store className="w-4 h-4" /> 商家後台
                          </Link>
                        )}
                        {role === 'admin' && (
                          <Link href="/admin/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            <Store className="w-4 h-4" /> 管理後台
                          </Link>
                        )}
                        {role === 'customer' && (
                          <Link href="/auth/signin?redirect=/onboarding/merchant" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            <Store className="w-4 h-4" /> 成為商家
                          </Link>
                        )}
                      </div>
                      <div className="border-t border-gray-100 py-1">
                        <button onClick={() => { signOut(); setUserMenuOpen(false); window.location.href = '/'; }} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                          <LogOut className="w-4 h-4" /> 登出
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/auth/signin" className="p-2 text-gray-500 hover:text-gray-900 transition-colors">
                <User className="w-5 h-5" />
              </Link>
            )}

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
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜尋商品..." className="w-full h-10 pl-9 pr-3 text-sm bg-gray-100 border-0 rounded-lg" />
                </div>
              </form>
              <Link href="/client/home" className="block py-2 text-sm text-gray-600">首頁</Link>
              <Link href="/search" className="block py-2 text-sm text-gray-600">商品分類</Link>
              <Link href="/client/cart" className="block py-2 text-sm text-gray-600">購物車</Link>
              <Link href="/client/orders" className="block py-2 text-sm text-gray-600">我的訂單</Link>
              {user ? (
                <button onClick={() => { signOut(); setMobileMenuOpen(false); window.location.href = '/'; }}
                  className="block py-2 text-sm text-red-600">登出</button>
              ) : (
                <Link href="/auth/signin" className="block py-2 text-sm text-gray-600">登入</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
