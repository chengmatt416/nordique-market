'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown } from 'lucide-react';
import Link from 'next/link';

const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || '';

interface QA {
  question: string;
  answer: string;
}

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [faqItems, setFaqItems] = useState<QA[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/brand')
      .then((r) => r.json())
      .then((data) => {
        if (data?.helpContent) {
          try {
            const parsed = JSON.parse(data.helpContent);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setFaqItems(parsed);
              return;
            }
          } catch {}
        }
        setFaqItems([
          { question: '如何下單購買商品？', answer: '瀏覽商品頁面，選擇喜歡的商品加入購物車，點擊結帳後填寫收件資訊並選擇付款方式，確認訂單即可完成購買。' },
          { question: '如何查詢商品詳情？', answer: '點擊商品圖片或名稱進入商品詳情頁面，您可以查看商品規格、材質、尺寸及用戶評價等資訊。' },
          { question: '商品加入購物車後可以保留多久？', answer: '加入購物車的商品在庫存充足的情況下會為您保留 2 小時，建議您盡快完成結帳。' },
          { question: '支援哪些付款方式？', answer: '我們支援信用卡（VISA、MasterCard、JCB）、銀行轉帳、超商代碼繳費、Apple Pay 及 Google Pay 等多種付款方式。' },
          { question: '付款失敗該怎麼辦？', answer: '請先確認您的卡片資訊是否正確，或檢查網路連線是否穩定。若問題持續，建議您聯繫發卡銀行或更換其他付款方式。' },
        ]);
      })
      .catch(() => {
        setFaqItems([
          { question: '如何下單購買商品？', answer: '瀏覽商品頁面，選擇喜歡的商品加入購物車，點擊結帳後填寫收件資訊並選擇付款方式，確認訂單即可完成購買。' },
          { question: '如何查詢商品詳情？', answer: '點擊商品圖片或名稱進入商品詳情頁面，您可以查看商品規格、材質、尺寸及用戶評價等資訊。' },
          { question: '商品加入購物車後可以保留多久？', answer: '加入購物車的商品在庫存充足的情況下會為您保留 2 小時，建議您盡快完成結帳。' },
          { question: '支援哪些付款方式？', answer: '我們支援信用卡（VISA、MasterCard、JCB）、銀行轉帳、超商代碼繳費、Apple Pay 及 Google Pay 等多種付款方式。' },
          { question: '付款失敗該怎麼辦？', answer: '請先確認您的卡片資訊是否正確，或檢查網路連線是否穩定。若問題持續，建議您聯繫發卡銀行或更換其他付款方式。' },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleItem = (idx: number) => {
    const key = String(idx);
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const filteredItems = faqItems.filter(
    (item) =>
      !searchQuery ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-900 tracking-tight">
            {brandName}
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/search" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              商品
            </Link>
            <Link href="/auth/signin" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              登入
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">幫助中心</h1>
          <p className="text-gray-500 mb-8">我們隨時為您提供協助，請搜尋或瀏覽以下常見問題。</p>

          <div className="relative mb-10">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜尋常見問題..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12 text-gray-400">載入中...</div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">找不到相關問題，請試試其他關鍵字</p>
              </div>
            ) : (
              <section>
                <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                  {filteredItems.map((item, idx) => {
                    const key = String(idx);
                    const isExpanded = expandedItems.has(key);
                    return (
                      <div key={idx}>
                        <button
                          onClick={() => toggleItem(idx)}
                          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-sm font-medium text-gray-900 pr-4">{item.question}</span>
                          <ChevronDown
                            className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">
                                {item.answer}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          <div className="mt-12 text-center p-8 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-600 mb-4">找不到您需要的答案？</p>
            <Link
              href="/support/contact"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              聯絡客服
            </Link>
          </div>
        </motion.div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-8 px-6">
        <div className="max-w-6xl mx-auto text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} {brandName}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}