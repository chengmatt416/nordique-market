'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, Star, SlidersHorizontal, TrendingUp } from 'lucide-react';
import { Button, Badge, Card, ProductCardSkeleton } from '@/components/ui';
import { formatPrice, cn } from '@/lib/utils';
import { deobfuscate, deobfuscatePrice, deobfuscateProduct } from '@/lib/crypto';
import { BrandConfig } from '@/config/brand';

type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  category: string;
};

type SearchCategory = {
  name: string;
  count: number;
};

const sortOptions = [
  { value: 'relevance', label: '相關度' },
  { value: 'price-asc', label: '價格由低到高' },
  { value: 'price-desc', label: '價格由高到低' },
  { value: 'rating', label: '評價最高' },
  { value: 'reviews', label: '評論最多' },
];

const RECENT_SEARCHES_KEY = 'recentSearches';

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addRecentSearch(query: string) {
  if (typeof window === 'undefined') return;
  try {
    let searches = getRecentSearches();
    searches = [query, ...searches.filter((s) => s !== query)].slice(0, 8);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
  } catch {
    // localStorage not available
  }
}

function removeRecentSearch(query: string) {
  if (typeof window === 'undefined') return;
  try {
    const searches = getRecentSearches().filter((s) => s !== query);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
  } catch {
    // localStorage not available
  }
}

function ProductCardItem({ product }: { product: Product }) {
  return (
    <Link href={`/client/product/${product.id}`}>
      <Card hover padding="none" className="overflow-hidden group">
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          <img
            src={product.images?.[0] || `https://picsum.photos/seed/${product.id}/400/400`}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="absolute top-2 left-2">
              <Badge variant="accent">
                -{Math.round((1 - product.price / product.originalPrice) * 100)}%
              </Badge>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs text-gray-600">{product.rating}</span>
            <span className="text-xs text-gray-400">· {product.reviewCount} 則評論</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-base font-bold text-gray-900">{formatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultCategories, setResultCategories] = useState<SearchCategory[]>([]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const categories = BrandConfig.categories;

  useEffect(() => {
    inputRef.current?.focus();
    setRecentSearches(getRecentSearches());
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}&limit=6`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.products)) {
        setSuggestions(
          data.products.map((item: Record<string, unknown>) => {
            const id = String(item.id ?? '');
            const decrypted = item._e ? deobfuscateProduct(item) : item;
            return {
              id,
              name: String(decrypted.name ?? ''),
              price: Number(decrypted.price ?? 0),
              originalPrice: decrypted.originalPrice != null ? Number(decrypted.originalPrice) : undefined,
              rating: Number(item.rating ?? 0),
              reviewCount: Number(item.reviewCount ?? item.review_count ?? 0),
              images: Array.isArray(item.images) ? item.images.map(String) : [],
              category: String(item.category ?? ''),
            };
          })
        );
        setShowSuggestions(true);
      }
    } catch {
      // Silently fail for suggestions
    }
  }, []);

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 300);
    },
    [fetchSuggestions]
  );

  const performSearch = useCallback(async () => {
    setError(null);
    setLoading(true);
    setShowSuggestions(false);
    setHasSearched(true);

    if (query.trim()) {
      addRecentSearch(query.trim());
      setRecentSearches(getRecentSearches());
    }

    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (selectedCategories.length === 1) params.set('category', selectedCategories[0]);
      if (priceMin) params.set('minPrice', priceMin);
      if (priceMax) params.set('maxPrice', priceMax);
      params.set('limit', '50');

      const res = await fetch(`/api/search?${params.toString()}`);

      if (res.status === 503) {
        setError('Firebase 尚未設定，請先完成 Firebase Admin 憑證設定。');
        setProducts([]);
        setTotalResults(0);
        setResultCategories([]);
        return;
      }

      if (!res.ok) throw new Error('API error');

      const data = await res.json();
      let results: Product[] = [];

      if (Array.isArray(data.products)) {
        results = data.products.map((item: Record<string, unknown>) => {
          const id = String(item.id ?? '');
          const decrypted = item._e ? deobfuscateProduct(item) : item;
          return {
            id,
            name: String(decrypted.name ?? ''),
            price: Number(decrypted.price ?? 0),
            originalPrice: decrypted.originalPrice != null ? Number(decrypted.originalPrice) : undefined,
            rating: Number(item.rating ?? 0),
            reviewCount: Number(item.reviewCount ?? item.review_count ?? 0),
            images: Array.isArray(item.images) ? item.images.map(String) : [],
            category: String(item.category ?? ''),
          };
        });
      }

      if (selectedCategories.length > 1) {
        results = results.filter((p) => selectedCategories.includes(p.category));
      }

      if (priceMin) {
        const min = Number(priceMin);
        if (!isNaN(min)) results = results.filter((p) => p.price >= min);
      }
      if (priceMax) {
        const max = Number(priceMax);
        if (!isNaN(max)) results = results.filter((p) => p.price <= max);
      }

      switch (sortBy) {
        case 'price-asc':
          results.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          results.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          results.sort((a, b) => b.rating - a.rating);
          break;
        case 'reviews':
          results.sort((a, b) => b.reviewCount - a.reviewCount);
          break;
        default:
          break;
      }

      setTotalResults(data.total ?? results.length);
      setProducts(results);
      setResultCategories(Array.isArray(data.categories) ? data.categories : []);
    } catch {
      setError('無法載入商品');
      setProducts([]);
      setTotalResults(0);
      setResultCategories([]);
    } finally {
      setLoading(false);
    }
  }, [query, selectedCategories, priceMin, priceMax, sortBy]);

  const handleSearch = (value: string) => {
    setQuery(value);
    setHasSearched(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      performSearch();
    }
  };

  const handleSuggestionClick = (suggestion: Product) => {
    setQuery(suggestion.name);
    setShowSuggestions(false);
    setHasSearched(true);
  };

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );
  };

  const clearAll = () => {
    setQuery('');
    setHasSearched(false);
    setSelectedCategories([]);
    setPriceMin('');
    setPriceMax('');
    setSortBy('relevance');
    setProducts([]);
    setSuggestions([]);
    setShowSuggestions(false);
    setTotalResults(0);
    setResultCategories([]);
    setError(null);
    inputRef.current?.focus();
  };

  const activeCategories = selectedCategories;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-900 tracking-tight">
            {BrandConfig.name}
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/client/home" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              首頁
            </Link>
            <Link href="/auth/signin" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              登入
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative mb-6" ref={suggestionsRef}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="搜尋商品、品牌、類別..."
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (suggestions.length > 0 && !hasSearched) setShowSuggestions(true);
              }}
              className="w-full h-14 pl-12 pr-12 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
            {query && (
              <button
                onClick={clearAll}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && !hasSearched && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden z-40"
                >
                  <div className="p-1">
                    <p className="px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      搜尋建議
                    </p>
                    {suggestions.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSuggestionClick(item)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                      >
                        <TrendingUp className="w-4 h-4 text-gray-400 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs text-gray-400">{item.category}</p>
                        </div>
                        <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                          {formatPrice(item.price)}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!hasSearched ? (
            <>
              {recentSearches.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <h2 className="text-sm font-medium text-gray-600">最近搜尋</h2>
                    <button
                      onClick={() => {
                        localStorage.removeItem(RECENT_SEARCHES_KEY);
                        setRecentSearches([]);
                      }}
                      className="ml-auto text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      清除全部
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((item) => (
                      <span key={item} className="relative group">
                        <button
                          onClick={() => handleSearch(item)}
                          className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm hover:bg-pink-50 hover:text-pink-600 transition-colors"
                        >
                          {item}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRecentSearch(item);
                            setRecentSearches(getRecentSearches());
                          }}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-gray-300 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-4">瀏覽分類</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {categories.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => {
                        setSelectedCategories([cat.name]);
                        setHasSearched(true);
                      }}
                      className="p-4 rounded-xl border border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm transition-all text-center"
                    >
                      <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                      <p className="text-xs text-gray-400 mt-1">探索商品</p>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex gap-6">
              <div className="hidden lg:block w-56 shrink-0">
                <div className="sticky top-[88px]">
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">商品分類</h3>
                    <div className="space-y-2.5">
                      {(resultCategories.length > 0 ? resultCategories : categories).map((cat) => {
                        const name = 'name' in cat ? (cat as SearchCategory).name : (cat as any).name;
                        const count = 'count' in cat ? (cat as SearchCategory).count : undefined;
                        const slug = name;
                        return (
                          <label key={slug} className="flex items-center gap-2.5 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={activeCategories.includes(slug)}
                              onChange={() => toggleCategory(slug)}
                              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-600 group-hover:text-gray-900 flex-1">{name}</span>
                            {count !== undefined && (
                              <span className="text-xs text-gray-400">{count}</span>
                            )}
                          </label>
                        );
                      })}
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">價格範圍</h4>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="最低"
                          value={priceMin}
                          onChange={(e) => setPriceMin(e.target.value)}
                          className="w-full h-9 px-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                        <span className="text-gray-400 text-sm shrink-0">–</span>
                        <input
                          type="number"
                          placeholder="最高"
                          value={priceMax}
                          onChange={(e) => setPriceMax(e.target.value)}
                          className="w-full h-9 px-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <Button className="w-full mt-4" size="sm" onClick={performSearch}>
                      套用篩選
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600">
                    共 <span className="font-medium text-gray-900">{totalResults}</span> 項結果
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="lg:hidden flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      篩選
                    </button>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="h-9 px-3 pr-8 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none cursor-pointer"
                    >
                      {sortOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {resultCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {resultCategories.map((cat) => (
                      <button
                        key={cat.name}
                        onClick={() => toggleCategory(cat.name)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-xs transition-colors',
                          activeCategories.includes(cat.name)
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        )}
                      >
                        {cat.name} ({cat.count})
                      </button>
                    ))}
                  </div>
                )}

                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="lg:hidden mb-4"
                  >
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">商品分類</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {categories.map((cat) => {
                          const slug = cat.name;
                          return (
                            <button
                              key={slug}
                              onClick={() => toggleCategory(slug)}
                              className={cn(
                                'px-3 py-1.5 rounded-full text-sm transition-colors',
                                activeCategories.includes(slug)
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              )}
                            >
                              {cat.name}
                            </button>
                          );
                        })}
                      </div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">價格範圍</h4>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="最低"
                          value={priceMin}
                          onChange={(e) => setPriceMin(e.target.value)}
                          className="w-full h-9 px-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                        <span className="text-gray-400 text-sm shrink-0">–</span>
                        <input
                          type="number"
                          placeholder="最高"
                          value={priceMax}
                          onChange={(e) => setPriceMax(e.target.value)}
                          className="w-full h-9 px-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                      <Button className="w-full mt-4" size="sm" onClick={performSearch}>
                        套用篩選
                      </Button>
                    </div>
                  </motion.div>
                )}

                {loading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <ProductCardSkeleton key={i} />
                    ))}
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Search className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{error}</h3>
                    <p className="text-sm text-gray-500 mb-6">請稍後再試或聯絡客服</p>
                    <Button variant="outline" onClick={performSearch}>重新載入</Button>
                  </div>
                ) : products.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Search className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">找不到符合條件的商品</h3>
                    <p className="text-sm text-gray-500 mb-6">試試其他關鍵字或篩選條件</p>
                    <Button variant="outline" onClick={clearAll}>清除搜尋</Button>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-2 md:grid-cols-3 gap-4"
                  >
                    {products.map((product) => (
                      <ProductCardItem key={product.id} product={product} />
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-8 px-6">
        <div className="max-w-6xl mx-auto text-center text-xs text-gray-400">
          © {new Date().getFullYear()} {BrandConfig.name}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}