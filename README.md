# AURA - 北歐極簡美學電商平台

一個融合北歐極簡美學與現代電商機能的平台。

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定 Firebase

前往 [Firebase Console](https://console.firebase.google.com/) 建立專案，並複製您的設定到環境變數：

```bash
cp .env.example .env.local
```

編輯 `.env.local`：

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. 設定 Firebase Authentication

1. 在 Firebase Console 啟用 Authentication
2. 啟用「Google」登入方式
3. 設定授權網域（加入你的本機網域和正式網域）

### 4. 設定 Firestore Database

建立以下集合：
- `users` - 用戶資料
- `products` - 商品資料
- `orders` - 訂單資料
- `merchants` - 商家資料
- `categories` - 分類資料

### 5. 啟動開發伺服器

```bash
npm run dev
```

## 自訂品牌

修改 `src/config/brand.ts` 即可更改所有品牌相關資訊：

```typescript
export const BrandConfig = {
  name: 'YOUR_BRAND_NAME',
  displayName: 'Your Brand Display Name',
  tagline: 'Your tagline here',
  // ... 其他設定
};
```

## 專案結構

```
src/
├── app/                    # Next.js App Router 頁面
│   ├── auth/              # 認證相關頁面
│   ├── client/            # 客戶端頁面
│   ├── merchant/          # 商家端頁面
│   ├── admin/             # 管理端頁面
│   └── onboarding/       # 各角色引導頁面
├── components/
│   ├── ui/               # UI 元件庫
│   └── layout/           # 版面元件
├── lib/
│   └── firebase/         # Firebase 設定
└── config/
    └── brand.ts          # 品牌設定
```

## 部署到 Vercel

1. Fork 此專案到 GitHub
2. 在 Vercel 中 import 專案
3. 設定環境變數
4. Deploy

或使用 Vercel CLI：

```bash
npm i -g vercel
vercel
```

## 功能

### 客戶端
- 商品搜尋與分類瀏覽
- 購物車與結帳
- 訂單追蹤
- 個人資料管理

### 商家端
- 商品管理
- 訂單處理
- 銷售數據分析
- 商店設定

### 管理端
- 用戶管理
- 商家審核
- 商品審核
- 訂單監控

## 技術棧

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Deployment**: Vercel