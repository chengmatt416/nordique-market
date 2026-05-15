import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, isFirebaseConfigured } from '@/lib/firebase/admin';
import { requireAdminAuth } from '@/lib/admin-check';

export async function GET() {
  try {
    if (!isFirebaseConfigured().ok) {
      return NextResponse.json(getDefaultBrand());
    }
    const db = getAdminDb();
    const doc = await db.collection('settings').doc('brand').get();
    return NextResponse.json(doc.exists ? doc.data() : getDefaultBrand());
  } catch (e) {
    console.error('GET /api/brand error:', e);
    return NextResponse.json(getDefaultBrand());
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authCheck = await requireAdminAuth(request);
    if (authCheck instanceof NextResponse) return authCheck;

    if (!isFirebaseConfigured().ok) {
      return NextResponse.json({ error: 'Firebase not configured' }, { status: 503 });
    }
    const db = getAdminDb();
    const body = await request.json();
    const clean = JSON.parse(JSON.stringify(body));
    delete clean.updatedAt;
    await db.collection('settings').doc('brand').set({
      ...clean,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('PUT /api/brand error:', e);
    return NextResponse.json({ error: 'Failed to save brand settings', detail: String(e) }, { status: 500 });
  }
}

function getDefaultBrand() {
  return {
    name: process.env.NEXT_PUBLIC_BRAND_NAME || '',
    tagline: '',
    description: '',
    logo: '',
    contactEmail: '',
    contactPhone: '',
    contactAddress: '',
    facebookUrl: '',
    instagramUrl: '',
    lineId: '',
    footerTagline: '',
    heroTitle: '',
    heroSubtitle: '',
    ctaPrimaryLabel: '',
    ctaSecondaryLabel: '',
    features: [],
    categories: [],
    helpContent: JSON.stringify([
      { question: '如何下單購買商品？', answer: '瀏覽商品頁面，選擇喜歡的商品加入購物車，點擊結帳後填寫收件資訊並選擇付款方式，確認訂單即可完成購買。' },
      { question: '支援哪些付款方式？', answer: '我們支援信用卡（VISA、MasterCard、JCB）、銀行轉帳、超商代碼繳費、Apple Pay 及 Google Pay 等多種付款方式。' },
      { question: '配送需要多少時間？', answer: '一般商品下單後 1-3 個工作天內出貨，配送時間約 2-5 個工作天。實際到貨時間依地區及物流狀況而異。' },
      { question: '退換貨的條件是什麼？', answer: '商品到貨後享有 7 天鑑賞期（猶豫期）。商品須保持全新狀態、包裝完整且不影響二次銷售，即可申請退換貨。' },
      { question: '如何註冊帳戶？', answer: '點擊頁面右上角的「登入」按鈕，您可使用 Google 帳號快速登入，系統將自動為您建立帳戶。' },
    ]),
    privacyContent: JSON.stringify([
      {
        title: '資訊收集',
        content: '我們可能會收集以下類型的資訊：個人識別資訊（包括但不限於您的姓名、電子郵件地址、聯絡電話、收件地址等），這些資訊主要在您註冊帳戶、下單購買或聯繫客服時收集。交易資訊：包括您的購買紀錄、付款方式、配送資訊等，用於處理訂單及提供客戶服務。裝置與使用資訊：包括您的 IP 位址、瀏覽器類型、作業系統、瀏覽時間及頁面瀏覽紀錄等。',
      },
      {
        title: '資訊使用',
        content: '我們收集的資訊將用於以下目的：提供與維護服務、改善使用者體驗、行銷與推廣（在取得您同意的情況下）、以及法律遵循。我們不會將您的個人資訊出售給第三方。',
      },
      {
        title: '資訊保護',
        content: '我們採取多項安全措施以保護您的個人資訊：資料加密（所有敏感資訊在傳輸過程中均使用 SSL/TLS 加密技術保護）、存取控制（僅有經授權的員工才能存取您的個人資訊）、以及安全監控。',
      },
      {
        title: 'Cookie 政策',
        content: '我們使用 Cookie 及類似技術以提升您的瀏覽體驗：必要 Cookie 維持網站基本運作所需，分析 Cookie 幫助我們了解使用者互動，廣告 Cookie 用於展示更相關的廣告內容。您可透過瀏覽器設定管理或停用 Cookie。',
      },
      {
        title: '您的權利',
        content: '根據個人資料保護相關法規，您享有以下權利：查詢及閱覽權、補充及更正權、停止蒐集處理或利用、刪除權、以及資料可攜權。如欲行使上述權利，請透過客服管道與我們聯繫。',
      },
    ]),
    termsContent: JSON.stringify([
      {
        title: '帳戶註冊',
        content: '使用本服務前，您可能需要註冊帳戶。註冊時，您同意提供準確、完整且最新的個人資訊，妥善保管您的帳戶密碼及登入資訊，您須年滿 20 歲或已取得法定代理人同意。如發現任何未經授權使用您帳戶的情況，請立即通知我們。',
      },
      {
        title: '購買條款',
        content: '所有價格均以新台幣（TWD）標示，包含營業稅。我們保留修改價格及更正定價錯誤的權利。付款完成後視為訂單成立。訂單成立後如需取消或修改，請立即聯繫客服。若商品已進入出貨程序，可能無法取消訂單。',
      },
      {
        title: '智慧財產權',
        content: '本網站及其所有內容（包括但不限於文字、圖片、標誌、圖示、音訊、影片、軟體、設計及版面配置）均為本公司或其授權人的智慧財產，受中華民國著作權法、商標法及其他相關法律保護。未經授權不得複製、修改、散布或以其他方式利用本網站內容。',
      },
      {
        title: '免責聲明',
        content: '在適用法律允許的最大範圍內，本服務及其內容係基於「現狀」及「可提供性」原則提供，不做任何明示或默示的保證，包括但不限於適銷性、特定用途適用性及非侵權性的默示保證。',
      },
      {
        title: '條款變更',
        content: '本公司保留隨時修改本服務條款的權利。修改後的條款將於網站上公布時生效。若您在條款變更生效後繼續使用本服務，即表示您同意接受修改後的條款。準據法與管轄法院：本服務條款的解釋與適用，以中華民國法律為準據法。',
      },
    ]),
    contactExtraInfo: '',
  };
}