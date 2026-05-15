'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { BrandConfig } from '@/config/brand';

const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || 'AURA';

interface QA {
  q: string;
  a: string;
}

interface FAQSection {
  title: string;
  icon: string;
  items: QA[];
}

const faqSections: FAQSection[] = [
  {
    title: '購物指南',
    icon: '🛍️',
    items: [
      { q: '如何下單購買商品？', a: '瀏覽商品頁面，選擇喜歡的商品加入購物車，點擊結帳後填寫收件資訊並選擇付款方式，確認訂單即可完成購買。' },
      { q: '如何查詢商品詳情？', a: '點擊商品圖片或名稱進入商品詳情頁面，您可以查看商品規格、材質、尺寸及用戶評價等資訊。' },
      { q: '商品加入購物車後可以保留多久？', a: '加入購物車的商品在庫存充足的情況下會為您保留 2 小時，建議您盡快完成結帳。' },
    ],
  },
  {
    title: '付款問題',
    icon: '💳',
    items: [
      { q: '支援哪些付款方式？', a: '我們支援信用卡（VISA、MasterCard、JCB）、銀行轉帳、超商代碼繳費、Apple Pay 及 Google Pay 等多種付款方式。' },
      { q: '付款失敗該怎麼辦？', a: '請先確認您的卡片資訊是否正確，或檢查網路連線是否穩定。若問題持續，建議您聯繫發卡銀行或更換其他付款方式。' },
      { q: '如何申請發票？', a: '訂單成立後系統將自動開立電子發票，您可在訂單明細中查看及下載。如需統編，請於結帳時填寫。' },
    ],
  },
  {
    title: '配送與物流',
    icon: '🚚',
    items: [
      { q: '配送需要多少時間？', a: '一般商品下單後 1-3 個工作天內出貨，配送時間約 2-5 個工作天。實際到貨時間依地區及物流狀況而異。' },
      { q: '運費如何計算？', a: '全站消費滿 NT$499 即享免運費。未滿免運門檻則依配送方式收取運費，一般宅配 NT$80，超商取貨 NT$60。' },
      { q: '可以指定配送時間嗎？', a: '目前提供平日及假日配送選項，您可在結帳時選擇希望的配送時段。物流人員將盡量配合，但無法保證精確時間。' },
      { q: '如何查詢配送進度？', a: '出貨後系統會發送通知至您的註冊信箱，您可在訂單詳情頁面查看即時物流狀態及追蹤號碼。' },
    ],
  },
  {
    title: '退換貨政策',
    icon: '🔄',
    items: [
      { q: '退換貨的條件是什麼？', a: '商品到貨後享有 7 天鑑賞期（猶豫期）。商品須保持全新狀態、包裝完整且不影響二次銷售，即可申請退換貨。' },
      { q: '如何申請退換貨？', a: '登入您的帳戶，前往「我的訂單」頁面，選擇需退換貨的訂單並點擊「申請退換貨」，依照指示填寫原因並提交即可。' },
      { q: '退貨運費由誰負擔？', a: '如因商品瑕疵、寄錯商品等原因退貨，運費由我們承擔。若因個人因素（如不喜歡、買錯）退貨，運費需由您自行負擔。' },
      { q: '退款需要多久時間？', a: '收到退貨商品並確認無誤後，將於 7-14 個工作天內完成退款。退款將退回原付款方式，實際入帳時間依各銀行作業而異。' },
    ],
  },
  {
    title: '帳戶問題',
    icon: '👤',
    items: [
      { q: '如何註冊帳戶？', a: '點擊頁面右上角的「登入」按鈕，您可使用 Google 帳號快速登入，系統將自動為您建立帳戶。' },
      { q: '忘記密碼怎麼辦？', a: '目前使用 Google 帳號登入無需密碼。若您使用其他方式註冊，請點擊「忘記密碼」並依指示重設。' },
      { q: '如何修改個人資料？', a: '登入後前往「我的帳戶」頁面，您可修改個人頭像、暱稱、聯絡電話及常用收件地址等資訊。' },
      { q: '如何刪除帳戶？', a: '如需刪除帳戶，請聯繫客服人員。我們將核實您的身份後協助處理，帳戶刪除後所有相關資料將一併清除。' },
    ],
  },
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (sectionIdx: number, itemIdx: number) => {
    const key = `${sectionIdx}-${itemIdx}`;
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

  const filteredSections = faqSections
    .map((section, si) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          !searchQuery ||
          item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.a.toLowerCase().includes(searchQuery.toLowerCase())
      ),
      sectionIdx: si,
    }))
    .filter((section) => section.items.length > 0);

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
            {filteredSections.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">找不到相關問題，請試試其他關鍵字</p>
              </div>
            ) : (
              filteredSections.map((section) => (
                <section key={section.sectionIdx}>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span>{section.icon}</span>
                    {section.title}
                  </h2>
                  <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                    {section.items.map((item, itemIdx) => {
                      const key = `${section.sectionIdx}-${itemIdx}`;
                      const isExpanded = expandedItems.has(key);
                      return (
                        <div key={itemIdx}>
                          <button
                            onClick={() => toggleItem(section.sectionIdx, itemIdx)}
                            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                          >
                            <span className="text-sm font-medium text-gray-900 pr-4">{item.q}</span>
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
                                  {item.a}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))
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
          © {new Date().getFullYear()} {brandName}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}