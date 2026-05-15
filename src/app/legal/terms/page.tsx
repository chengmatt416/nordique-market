'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FileText, ShoppingCart, Shield, AlertTriangle, RefreshCw, UserPlus } from 'lucide-react';

const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || 'AURA';

const sections = [
  {
    id: 'account',
    icon: UserPlus,
    title: '帳戶註冊',
    content: `使用 ${brandName} 的服務前，您可能需要註冊帳戶。註冊時，您同意：

提供準確、完整且最新的個人資訊，並在資訊變更時及時更新。

妥善保管您的帳戶密碼及登入資訊，不得將其提供給他人使用。您帳戶下的所有活動將由您承擔責任。

您須年滿 20 歲，或已取得法定代理人同意，方可註冊並使用本服務。

每個人或法律實體僅能註冊一個帳戶，${brandName} 保留拒絕或終止重複帳戶的權利。

如發現任何未經授權使用您帳戶的情況，請立即通知我們。

${brandName} 保留因違反服務條款、提供不實資訊或涉嫌詐欺等原因，暫停或終止帳戶的權利。`,
  },
  {
    id: 'purchase',
    icon: ShoppingCart,
    title: '購買條款',
    content: `在 ${brandName} 平台上進行購買時，您同意以下條款：

商品資訊：我們努力確保商品資訊的準確性，但不保證描述、圖片或其他內容完全無誤。實際商品可能因螢幕顯示而與圖片略有差異。

價格與付款：所有價格均以新台幣（TWD）標示，包含營業稅。我們保留修改價格及更正定價錯誤的權利。付款完成後視為訂單成立。

訂單確認：提交訂單後，我們將發送訂單確認通知至您的註冊信箱。此通知不代表訂單已被接受，我們保留接受或拒絕訂單的權利。

取消與修改：訂單成立後如需取消或修改，請立即聯繫客服。若商品已進入出貨程序，可能無法取消訂單。

配送風險：商品配送過程中的遺失或損壞風險於商品交付給承運人時轉移至您。如商品送達時有明顯損壞，請立即向配送人員反映並聯繫客服。

退換貨政策：詳細的退換貨規定請參閱幫助中心的退換貨政策頁面。`,
  },
  {
    id: 'intellectual',
    icon: FileText,
    title: '智慧財產權',
    content: `本網站及其所有內容（包括但不限於文字、圖片、標誌、圖示、音訊、影片、軟體、設計及版面配置）均為 ${brandName} 或其授權人的智慧財產，受中華民國著作權法、商標法及其他相關法律保護。

您不得：

未經授權複製、修改、散布、公開傳輸或以其他方式利用本網站內容。

移除或變更任何版權聲明、商標標示或其他權利聲明。

使用任何自動化工具（如爬蟲、機器人）擷取或索引本網站內容。

使用 ${brandName} 的商標或商業外觀，包含在網域名稱、關鍵字廣告或社交媒體帳號中。

我們尊重他人的智慧財產權。如您認為本網站內容侵害了您的權利，請聯繫我們處理。`,
  },
  {
    id: 'disclaimer',
    icon: AlertTriangle,
    title: '免責聲明',
    content: `在適用法律允許的最大範圍內，${brandName} 提供本服務及其內容係基於「現狀」及「可提供性」原則，不做任何明示或默示的保證，包括但不限於：

適銷性、特定用途適用性及非侵權性的默示保證。

服務不中斷、及時、安全或無錯誤的保證。

透過本服務取得的任何產品、服務、資訊或其他資料符合您期望的保證。

平台商家所銷售的商品品質、安全性或合法性。

${brandName} 不對以下情況承擔責任：

因使用或無法使用本服務所造成的任何直接、間接、附帶、特殊或衍生性損害。

駭客攻擊、病毒或其他技術性有害因素導致的損害。

第三方服務或連結網站的內容、隱私政策或行為。

本免責聲明不影響依適用法律無法排除或限制的消費者權益。`,
  },
  {
    id: 'changes',
    icon: RefreshCw,
    title: '條款變更',
    content: `${brandName} 保留隨時修改本服務條款的權利。修改後的條款將於網站上公布時生效。

我們會透過以下方式通知您條款的重大變更：

在網站首頁或相關頁面張貼公告。

發送通知至您的註冊信箱。

透過應用程式內通知提醒您查閱。

若您在條款變更生效後繼續使用本服務，即表示您同意接受修改後的條款。如您不同意變更內容，應立即停止使用本服務。

我們建議您定期查閱本頁面以了解最新的服務條款。本服務條款的歷史版本將不會被保留，請確保您在每次使用前已閱讀最新版本。

準據法與管轄法院：本服務條款的解釋與適用，以中華民國法律為準據法。因本服務條款所生之爭議，雙方同意以臺灣臺北地方法院為第一審管轄法院。

最後更新日期：2024 年 1 月`,
  },
];

export default function TermsOfServicePage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">服務條款</h1>
          <p className="text-gray-500 mb-2">
            使用 {brandName} 前，請仔細閱讀以下條款
          </p>
          <p className="text-sm text-gray-400 mb-10">最後更新日期：2024 年 1 月</p>

          <div className="space-y-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-sm text-gray-600 leading-relaxed">
                歡迎使用 {brandName}（以下簡稱「本服務」）。本服務條款（以下簡稱「本條款」）規範您與 {brandName} 之間的法律關係。使用本服務即表示您已閱讀、理解並同意遵守本條款。如您不同意本條款的任何部分，請勿使用本服務。
              </p>
            </div>

            {sections.map((section) => (
              <section key={section.id} id={section.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <section.icon className="w-5 h-5 text-gray-700" />
                  <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
                </div>
                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-gray-500 mb-4">如有任何條款相關問題，歡迎與我們聯繫</p>
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
          © {new Date().getFullYear()} {brandName}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}