'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search as SearchIcon, X, Clock, TrendingUp, Star, ShoppingCart } from 'lucide-react';
import { Input, Button, Badge } from '@/components/ui';
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
  const [selectedRating, setSelectedRating] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = () => {
    if (!query.trim()) return;
    setHasSearched(true);
    let filtered = allProducts.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((p) => selectedCategories.includes(p.category));
    }
    if (minPrice) {
      filtered = filtered.filter((p) => p.price >= Number(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter((p) => p.price <= Number(maxPrice));
    }
    if (selectedRating > 0) {
      filtered = filtered.filter((p) => p.rating >= selectedRating);
    }
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => b.id.localeCompare(a.id));
        break;
      default:
        filtered.sort((a, b) => b.reviews - a.reviews);
    }
    setResults(filtered);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    if (hasSearched) {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setMinPrice('');
    setMaxPrice('');
    setSelectedRating(0);
  };

  return (
    <div className="min-h-screen bg-[var(--secondary)]">
      <header className="sticky top-0 z-50 bg-[var(--surface)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-[var(--primary)]">
              {BrandConfig.name}
            </Link>
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                placeholder="搜尋商品..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                icon={<SearchIcon className="w-5 h-5" />}
                className="w-full"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[var(--secondary)] rounded"
                >
                  <X className="w-4 h-4 text-[var(--text-muted)]" />
                </button>
              )}
            </div>
            <Button onClick={handleSearch}>搜尋</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!hasSearched ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {recentSearches.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-[var(--text-muted)]" />
                  <h2 className="text-sm font-medium text-[var(--text-secondary)]">最近搜尋</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search) => (
                    <button
                      key={search}
                      onClick={() => {
                        setQuery(search);
                        setHasSearched(true);
                      }}
                      className="px-3 py-1.5 bg-[var(--surface)] rounded-full text-sm text-[var(--text-secondary)] hover:bg-[var(--border)] transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-[var(--text-muted)]" />
                <h2 className="text-sm font-medium text-[var(--text-secondary)]">熱門分類</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {allCategories.map((category) => (
                  <Link
                    key={category}
                    href={`/search?category=${category}`}
                    className="px-4 py-2 bg-[var(--surface)] rounded-full text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--accent)]/10 transition-colors"
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">探索商品</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {allProducts.slice(0, 6).map((product) => (
                  <Link key={product.id} href={`/client/product/${product.id}`}>
                    <div className="bg-[var(--surface)] rounded-[var(--radius-md)] border border-[var(--border)] overflow-hidden hover:shadow-md transition-shadow">
                      <img
                        src={`https://picsum.photos/seed/${product.image}/400/400`}
                        alt={product.name}
                        className="w-full aspect-square object-cover"
                      />
                      <div className="p-3">
                        <h3 className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-1 my-1">
                          <Star className="w-3 h-3 fill-[var(--warning)] text-[var(--warning)]" />
                          <span className="text-xs text-[var(--text-secondary)]">{product.rating}</span>
                        </div>
                        <span className="text-sm font-bold text-[var(--primary)]">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex gap-6">
            <aside className="hidden md:block w-64 shrink-0">
              <div className="bg-[var(--surface)] rounded-[var(--radius-md)] border border-[var(--border)] p-4 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[var(--text-primary)]">篩選</h3>
                  {(selectedCategories.length > 0 || minPrice || maxPrice || selectedRating > 0) && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-[var(--accent)] hover:underline"
                    >
                      清除全部
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">價格區間</h4>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="最低"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        type="number"
                        className="w-full"
                      />
                      <span className="text-[var(--text-muted)]">-</span>
                      <Input
                        placeholder="最高"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        type="number"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">分類</h4>
                    <div className="space-y-2">
                      {allCategories.map((category) => (
                        <label key={category} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category)}
                            onChange={() => toggleCategory(category)}
                            className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                          />
                          <span className="text-sm text-[var(--text-secondary)]">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">評價</h4>
                    <div className="space-y-2">
                      {[4, 3, 2, 1].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setSelectedRating(selectedRating === rating ? 0 : rating)}
                          className={cn(
                            'flex items-center gap-1 w-full',
                            selectedRating === rating && 'text-[var(--accent)]'
                          )}
                        >
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                'w-4 h-4',
                                i < rating
                                  ? 'fill-[var(--warning)] text-[var(--warning)]'
                                  : 'fill-none text-[var(--border)]'
                              )}
                            />
                          ))}
                          <span className="text-sm text-[var(--text-muted)] ml-1">{rating}星以上</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={handleSearch}
                  >
                    套用篩選
                  </Button>
                </div>
              </div>
            </aside>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-[var(--text-secondary)]">
                  找到 <span className="font-medium text-[var(--text-primary)]">{results.length}</span> 個結果
                </p>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-3 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)] focus:outline-none focus:border-[var(--accent)]"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {results.length === 0 ? (
                <div className="bg-[var(--surface)] rounded-[var(--radius-md)] border border-[var(--border)] p-12 text-center">
                  <SearchIcon className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
                    找不到符合的商品
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-4">
                    試試不同的關鍵字或調整篩選條件
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    清除篩選
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {results.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                    >
                      <Link href={`/client/product/${product.id}`}>
                        <div className="bg-[var(--surface)] rounded-[var(--radius-md)] border border-[var(--border)] overflow-hidden hover:shadow-md transition-shadow group">
                          <div className="relative aspect-square overflow-hidden">
                            <img
                              src={`https://picsum.photos/seed/${product.image}/400/400`}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {product.originalPrice > product.price && (
                              <Badge
                                variant="error"
                                className="absolute top-2 left-2"
                              >
                                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                              </Badge>
                            )}
                          </div>
                          <div className="p-3">
                            <h3 className="text-sm font-medium text-[var(--text-primary)] truncate mb-1">
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-1 mb-2">
                              <Star className="w-3 h-3 fill-[var(--warning)] text-[var(--warning)]" />
                              <span className="text-xs text-[var(--text-secondary)]">
                                {product.rating} ({product.reviews})
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-[var(--primary)]">
                                {formatPrice(product.price)}
                              </span>
                              {product.originalPrice > product.price && (
                                <span className="text-xs text-[var(--text-muted)] line-through">
                                  {formatPrice(product.originalPrice)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}