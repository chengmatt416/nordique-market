'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Shield, Cookie, Eye, Server, Users } from 'lucide-react';

const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || '';

interface PrivacySection {
  title: string;
  content: string;
}

const defaultSections: PrivacySection[] = [
  {
    title: '資訊收集',
    content: `當您使用 ${brandName} 的服務時，我們可能會收集以下類型的資訊：

個人識別資訊：包括但不限於您的姓名、電子郵件地址、聯絡電話、收件地址等。

交易資訊：包括您的購買紀錄、付款方式、配送資訊等。

裝置與使用資訊：包括您的 IP 位址、瀏覽器類型、作業系統、瀏覽時間及頁面瀏覽紀錄等。

若您選擇不提供必要的個人資訊，可能無法完整使用我們的某些服務。`,
  },
  {
    title: '資訊使用',
    content: `我們收集的資訊將用於以下目的：

提供與維護服務：處理您的訂單、配送商品、提供客戶支援及帳戶管理等。

改善使用者體驗：分析使用行為以優化網站設計、商品推薦及服務流程。

行銷與推廣：在取得您同意的情況下，向您發送促銷活動及個人化推薦。

我們不會將您的個人資訊出售給第三方。`,
  },
  {
    title: '資訊保護',
    content: `${brandName} 採取多項安全措施以保護您的個人資訊：

資料加密：所有敏感資訊在傳輸過程中均使用 SSL/TLS 加密技術保護。

存取控制：僅有經授權的員工才能存取您的個人資訊。

安全監控：我們持續監控系統安全性，定期進行安全評估及漏洞掃描。`,
  },
  {
    title: 'Cookie 政策',
    content: `我們使用 Cookie 及類似技術以提升您的瀏覽體驗：

必要 Cookie：維持網站基本運作所需。

分析 Cookie：幫助我們了解使用者如何與網站互動。

廣告 Cookie：用於向您展示更相關的廣告內容。

您可透過瀏覽器設定管理或停用 Cookie。繼續使用我們的網站即表示您同意我們使用 Cookie。`,
  },
  {
    title: '您的權利',
    content: `根據個人資料保護相關法規，您享有以下權利：

查詢及閱覽權：查詢及請求閱覽我們所持有的您的個人資料。

補充及更正權：若您的個人資料有誤或不完整，可請求補充或更正。

刪除權：請求刪除您的個人資料，惟依法令規定所必須者不在此限。

如欲行使上述權利，請透過客服管道與我們聯繫。`,
  },
];

const iconMap: Record<string, any> = {
  '資訊收集': Eye,
  '資訊使用': Users,
  '資訊保護': Shield,
  'Cookie 政策': Cookie,
  '您的權利': Users,
};

export default function PrivacyPolicyPage() {
  const [sections, setSections] = useState<PrivacySection[]>(defaultSections);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/brand')
      .then((r) => r.json())
      .then((data) => {
        if (data?.privacyContent) {
          try {
            const parsed = JSON.parse(data.privacyContent);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSections(parsed);
              return;
            }
          } catch {}
        }
        setSections(defaultSections);
      })
      .catch(() => {
        setSections(defaultSections);
      })
      .finally(() => setLoading(false));
  }, []);

  const getIcon = (title: string) => {
    const Icon = iconMap[title] || Shield;
    return <Icon className="w-5 h-5 text-gray-700" />;
  };

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">隱私權政策</h1>
          <p className="text-gray-500 mb-2">
            {brandName} 致力於保護您的個人隱私與資料安全
          </p>
          <p className="text-sm text-gray-400 mb-10">最後更新日期：2024 年 1 月</p>

          <div className="space-y-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-sm text-gray-600 leading-relaxed">
                歡迎使用 {brandName} 的服務。我們深知個人資訊對您的重要性，並承諾依據《個人資料保護法》及相關法規，妥善保護及管理您的個人資料。請仔細閱讀以下隱私權政策，以了解我們如何收集、使用及保護您的資訊。
              </p>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-400">載入中...</div>
            ) : (
              sections.map((section, idx) => (
                <section key={idx} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    {getIcon(section.title)}
                    <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>
                </section>
              ))
            )}
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-gray-500 mb-4">如有任何隱私權相關問題，歡迎與我們聯繫</p>
            <Link
              href="/support/contact"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              聯絡我們
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