'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { motion } from 'framer-motion';
import { Search, X, Clock, Star, SlidersHorizontal } from 'lucide-react';
import { Button, Badge, Card } from '@/components/ui';
import { formatPrice, cn } from '@/lib/utils';

const recentSearches = ['北歐風沙發', '極簡書桌', '手工陶器', '亞麻襯衫', '藍牙耳機'];

const trendingProducts = [
  { id: 1, name: '極簡實木書桌', price: 4200, image: 101, category: '家具', rating: 4.8, sold: 342 },
  { id: 2, name: '手工編織羊毛毯', price: 1880, image: 102, category: '家居', rating: 4.9, sold: 156 },
  { id: 3, name: '北歐風落地燈', price: 2600, image: 103, category: '家居', rating: 4.7, sold: 89 },
  { id: 4, name: '手工編織帽', price: 980, image: 104, category: '時尚', rating: 4.6, sold: 203 },
  { id: 5, name: '亞麻寬版襯衫', price: 1580, image: 105, category: '時尚', rating: 4.8, sold: 167 },
  { id: 6, name: '藍牙降噪耳機 Pro', price: 3290, image: 106, category: '電子產品', rating: 4.9, sold: 512 },
  { id: 7, name: '天然大豆香氛蠟燭', price: 680, image: 107, category: '家居', rating: 4.5, sold: 421 },
  { id: 8, name: '無線充電板', price: 890, image: 108, category: '電子產品', rating: 4.6, sold: 278 },
  { id: 9, name: '手工皮革托特包', price: 2800, image: 109, category: '時尚', rating: 4.7, sold: 95 },
  { id: 10, name: '陶瓷手沖咖啡壺', price: 1350, image: 110, category: '家居', rating: 4.8, sold: 183 },
  { id: 11, name: '便攜藍牙喇叭', price: 1590, image: 111, category: '電子產品', rating: 4.5, sold: 334 },
  { id: 12, name: '可調節升降茶几', price: 5400, image: 112, category: '家具', rating: 4.9, sold: 67 },
];

const searchResults = [
  { id: 1, name: '極簡實木書桌', price: 4200, originalPrice: 5600, image: 101, category: '家具', rating: 4.8, sold: 342 },
  { id: 2, name: '北歐風落地燈', price: 2600, image: 103, category: '家居', rating: 4.7, sold: 89 },
  { id: 3, name: '藍牙降噪耳機 Pro', price: 3290, originalPrice: 4200, image: 106, category: '電子產品', rating: 4.9, sold: 512 },
  { id: 4, name: '手工編織羊毛毯', price: 1880, image: 102, category: '家居', rating: 4.9, sold: 156 },
  { id: 5, name: '手工皮革托特包', price: 2800, originalPrice: 3600, image: 109, category: '時尚', rating: 4.7, sold: 95 },
  { id: 6, name: '陶瓷手沖咖啡壺', price: 1350, image: 110, category: '家居', rating: 4.8, sold: 183 },
  { id: 7, name: '亞麻寬版襯衫', price: 1580, originalPrice: 1980, image: 105, category: '時尚', rating: 4.8, sold: 167 },
  { id: 8, name: '無線充電板', price: 890, image: 108, category: '電子產品', rating: 4.6, sold: 278 },
  { id: 9, name: '便攜藍牙喇叭', price: 1590, image: 111, category: '電子產品', rating: 4.5, sold: 334 },
  { id: 10, name: '天然大豆香氛蠟燭', price: 680, image: 107, category: '家居', rating: 4.5, sold: 421 },
  { id: 11, name: '可調節升降茶几', price: 5400, image: 112, category: '家具', rating: 4.9, sold: 67 },
  { id: 12, name: '手工編織帽', price: 980, image: 104, category: '時尚', rating: 4.6, sold: 203 },
];

const categories = [
  { id: 'furniture', name: '家具', count: 24 },
  { id: 'home', name: '家居', count: 56 },
  { id: 'fashion', name: '時尚', count: 38 },
  { id: 'electronics', name: '電子產品', count: 31 },
];

const sortOptions = [
  { value: 'relevance', label: '相關度' },
  { value: 'price-asc', label: '價格由低到高' },
  { value: 'price-desc', label: '價格由高到低' },
  { value: 'rating', label: '評價最高' },
  { value: 'sales', label: '銷量最多' },
];

function ProductCard({ product }: { product: typeof searchResults[0] }) {
  return (
    <Link href={`/client/product/${product.id}`}>
      <Card hover padding="none" className="overflow-hidden group">
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          <img
            src={`https://picsum.photos/seed/${product.image}/400/400`}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.originalPrice && (
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
            <span className="text-xs text-gray-400">· 已售{product.sold}</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-base font-bold text-gray-900">{formatPrice(product.price)}</span>
            {product.originalPrice && (
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.trim()) {
      setHasSearched(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      setHasSearched(true);
    }
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const filteredResults = searchResults.filter((product) => {
    if (selectedCategories.length === 0) return true;
    const catMap: Record<string, string> = { furniture: '家具', home: '家居', fashion: '時尚', electronics: '電子產品' };
    return selectedCategories.some((c) => catMap[c] === product.category);
  });

  const clearAll = () => {
    setQuery('');
    setHasSearched(false);
    setSelectedCategories([]);
    setPriceMin('');
    setPriceMax('');
    setSortBy('relevance');
    inputRef.current?.focus();
  };

  return (
    <ClientLayout>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="搜尋商品、品牌、類別..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
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
        </div>

        {!hasSearched ? (
          <>
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <h2 className="text-sm font-medium text-gray-600">最近搜尋</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleSearch(item)}
                    className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm hover:bg-pink-50 hover:text-pink-600 transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-4">熱門商品</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {trendingProducts.map((product) => (
                  <ProductCard key={product.id} product={product as any} />
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
                    {categories.map((cat) => (
                      <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat.id)}
                          onChange={() => toggleCategory(cat.id)}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-600 group-hover:text-gray-900 flex-1">{cat.name}</span>
                        <span className="text-xs text-gray-400">{cat.count}</span>
                      </label>
                    ))}
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

                  <Button className="w-full mt-4" size="sm">
                    套用篩選
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  共 <span className="font-medium text-gray-900">{filteredResults.length}</span> 項結果
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
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => toggleCategory(cat.id)}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-sm transition-colors',
                            selectedCategories.includes(cat.id)
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          )}
                        >
                          {cat.name}
                        </button>
                      ))}
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
                    <Button className="w-full mt-4" size="sm">
                      套用篩選
                    </Button>
                  </div>
                </motion.div>
              )}

              {filteredResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Search className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">找不到相關商品</h3>
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
                  {filteredResults.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </ClientLayout>
  );
}