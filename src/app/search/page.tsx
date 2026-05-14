'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, X, Clock, Star, ShoppingCart, SlidersHorizontal } from 'lucide-react';
import { Button, Badge, Card } from '@/components/ui';
import { formatPrice, cn } from '@/lib/utils';
import { BrandConfig } from '@/config/brand';

const recentSearches = ['陶瓷花瓶', '北歐桌燈', '羊毛抱枕'];

const allCategories = BrandConfig.categories.map((c) => c.name);

const allProducts = [
  { id: '1', name: '北歐簡約陶瓷花瓶', price: 1299, originalPrice: 1999, rating: 4.8, reviews: 236, image: 'vase-1', category: '家居' },
  { id: '2', name: '純手工羊毛抱枕', price: 899, originalPrice: 1499, rating: 4.9, reviews: 189, image: 'pillow-2', category: '家居' },
  { id: '3', name: '實木多功能收納架', price: 2599, originalPrice: 3299, rating: 4.7, reviews: 156, image: 'shelf-3', category: '家居' },
  { id: '4', name: 'LED智能北歐桌燈', price: 1899, originalPrice: 2499, rating: 4.6, reviews: 98, image: 'lamp-4', category: '電子產品' },
  { id: '5', name: '極簡純棉床組', price: 3299, originalPrice: 4599, rating: 4.9, reviews: 312, image: 'bed-5', category: '家居' },
  { id: '6', name: '創意幾何地毯', price: 2199, originalPrice: 2999, rating: 4.5, reviews: 145, image: 'rug-6', category: '家居' },
  { id: '7', name: '質感皮革收納盒', price: 799, originalPrice: 1199, rating: 4.7, reviews: 203, image: 'box-7', category: '家居' },
  { id: '8', name: '不鏽鋼保溫水瓶', price: 599, originalPrice: 899, rating: 4.8, reviews: 427, image: 'bottle-8', category: '時尚' },
  { id: '9', name: '北歐風格掛鐘', price: 1599, originalPrice: 2199, rating: 4.6, reviews: 167, image: 'clock-9', category: '家居' },
  { id: '10', name: '多功能事務箱', price: 699, originalPrice: 999, rating: 4.4, reviews: 112, image: 'organizer-10', category: '時尚' },
  { id: '11', name: '輕量羽絨外套', price: 2899, originalPrice: 3899, rating: 4.7, reviews: 234, image: 'jacket-11', category: '時尚' },
  { id: '12', name: '智能手環Pro', price: 1999, originalPrice: 2499, rating: 4.5, reviews: 456, image: 'band-12', category: '電子產品' },
];

const sortOptions = [
  { value: 'recommended', label: '推薦' },
  { value: 'newest', label: '最新' },
  { value: 'price-low', label: '價格低到高' },
  { value: 'price-high', label: '價格高到低' },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<typeof allProducts>([]);
  const [sortBy, setSortBy] = useState('recommended');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = () => {
    setHasSearched(true);
    let filtered = allProducts;
    if (query.trim()) {
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
    }
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((p) => selectedCategories.includes(p.category));
    }
    if (minPrice) {
      filtered = filtered.filter((p) => p.price >= Number(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter((p) => p.price <= Number(maxPrice));
    }
    switch (sortBy) {
      case 'price-low': filtered.sort((a, b) => a.price - b.price); break;
      case 'price-high': filtered.sort((a, b) => b.price - a.price); break;
      case 'newest': filtered.sort((a, b) => b.id.localeCompare(a.id)); break;
      default: break;
    }
    setResults(filtered);
  };

  const handleRecentSearch = (term: string) => {
    setQuery(term);
    setHasSearched(true);
    const filtered = allProducts.filter((p) => p.name.toLowerCase().includes(term.toLowerCase()));
    setResults(filtered);
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="搜尋商品..."
              className="w-full h-12 pl-10 pr-4 bg-white border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)]"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-[var(--text-muted)]" />
              </button>
            )}
          </div>
          <Button onClick={handleSearch} className="h-12 px-6">搜尋</Button>
          <Button variant="ghost" onClick={() => setShowFilters(!showFilters)} className="h-12 px-3 md:hidden">
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
        </div>

        {!hasSearched ? (
          <div className="space-y-6">
            <Card padding="md">
              <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" /> 最近搜尋
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleRecentSearch(term)}
                    className="px-3 py-1.5 bg-[var(--secondary)] rounded-full text-sm hover:bg-[var(--accent)]/20 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </Card>

            <div>
              <h3 className="text-lg font-semibold mb-4">分類</h3>
              <div className="flex flex-wrap gap-3">
                {allCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategories([cat]); setHasSearched(true); setResults(allProducts.filter((p) => p.category === cat)); }}
                    className="px-4 py-2 bg-white border border-[var(--border)] rounded-lg hover:border-[var(--accent)] transition-colors"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">熱門商品</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {allProducts.slice(0, 8).map((product) => (
                  <Link key={product.id} href={`/client/product/${product.id}`}>
                    <Card hover padding="none" className="overflow-hidden">
                      <div className="aspect-square">
                        <img src={`https://picsum.photos/seed/${product.image}/400/400`} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-base font-bold text-[var(--primary)] mt-1">{formatPrice(product.price)}</p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex gap-6">
            <div className={`${showFilters ? 'block' : 'hidden'} md:block w-64 flex-shrink-0 space-y-4`}>
              <Card padding="md">
                <h4 className="font-medium mb-3">分類</h4>
                <div className="space-y-2">
                  {allCategories.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                        className="rounded border-[var(--border)]"
                      />
                      <span className="text-sm">{cat}</span>
                    </label>
                  ))}
                </div>
              </Card>

              <Card padding="md">
                <h4 className="font-medium mb-3">價格區間</h4>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="最低"
                    className="w-full px-3 py-2 border border-[var(--border)] rounded text-sm"
                  />
                  <span className="self-center">-</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="最高"
                    className="w-full px-3 py-2 border border-[var(--border)] rounded text-sm"
                  />
                </div>
              </Card>

              <Button onClick={handleSearch} className="w-full">套用篩選</Button>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-[var(--text-secondary)]">找到 {results.length} 件商品</p>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-[var(--border)] rounded text-sm bg-white"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {results.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {results.map((product) => (
                    <Link key={product.id} href={`/client/product/${product.id}`}>
                      <Card hover padding="none" className="overflow-hidden">
                        <div className="relative aspect-square">
                          <img src={`https://picsum.photos/seed/${product.image}/400/400`} alt={product.name} className="w-full h-full object-cover" />
                          <Badge className="absolute top-2 left-2" variant="error">
                            {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                          </Badge>
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-base font-bold text-[var(--primary)]">{formatPrice(product.price)}</span>
                            <span className="text-xs text-[var(--text-muted)] line-through">{formatPrice(product.originalPrice)}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 fill-[var(--warning)] text-[var(--warning)]" />
                            <span className="text-xs text-[var(--text-secondary)]">{product.rating} ({product.reviews})</span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-[var(--text-secondary)]">找不到符合條件的商品</p>
                  <Button variant="ghost" onClick={() => { setQuery(''); setHasSearched(false); setSelectedCategories([]); }} className="mt-4">
                    清除搜尋
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
}