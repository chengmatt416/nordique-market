# Nordique Market - 電商平台規格書

## 1. Concept & Vision

一個融合北歐極簡美學與亞洲電商高效機能的平台。設計語言取北歐「功能即美」的理念，刪除一切多餘裝飾，讓商品本身說話。操作體驗順暢無阻，每個動畫都有其存在的理由。支援客戶、商家、管理員三種角色，從京東/淘寶吸取高效率，從蝦皮吸取社交電商元素。

## 2. Design Language

### Aesthetic Direction
北歐斯堪地納維亞風格：大量留白、柔和色調、精緻細節、功能導向。借鑒 Muji、IKEA、Hem 的設計語言。

### Color Palette
```css
--primary: #1A1A2E;        /* 深靛藍 - 主文字、按鈕 */
--secondary: #F7F7F9;      /* 雲白 - 背景 */
--accent: #E8B4B8;          /* 玫瑰粉 - 強調、hover */
--accent-secondary: #A8D8EA; /* 天空藍 - 次要強調 */
--surface: #FFFFFF;         /* 純白 - 卡片 */
--text-primary: #1A1A2E;
--text-secondary: #6B6B7B;
--text-muted: #9B9BA5;
--border: #E8E8EC;
--success: #4CAF50;
--warning: #FFC107;
--error: #E53935;
```

### Typography
- Headings: `Inter`, weight 600-700, tracking -0.02em
- Body: `Inter`, weight 400-500
- CJK: `Noto Sans TC`, fallback to system

### Spatial System
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96px
- Border radius: 4px (buttons), 8px (cards), 16px (modals), 24px (large containers)
- Max content width: 1280px

### Motion Philosophy
- Duration: 150ms (micro), 250ms (standard), 400ms (emphasis)
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
- 頁面轉換：淡入淡出 + 輕微上滑 (translateY: 8px → 0)
- 按鈕回饋：scale 0.98 → 1，背景色過渡
- 卡片懸停：陰影加深 + translateY -2px
- 載入狀態：骨架屏 + 漸變動畫

## 3. Layout & Structure

### 總體架構
```
├── / (Landing Page)
├── /auth/signin (通用登入)
├── /client/* (客戶端)
│   ├── /home (首頁)
│   ├── /search (搜尋頁)
│   ├── /product/:id (商品頁)
│   ├── /cart (購物車)
│   ├── /checkout (結帳)
│   ├── /orders (我的訂單)
│   ├── /profile (個人資料)
│   └── /onboarding (客戶 onboarding)
├── /merchant/* (商家端)
│   ├── /dashboard (營業仪表板)
│   ├── /products (商品管理)
│   ├── /orders (訂單管理)
│   ├── /analytics (數據分析)
│   ├── /settings (商店設定)
│   └── /onboarding (商家 onboarding)
├── /admin/* (管理端)
│   ├── /dashboard (系統仪表板)
│   ├── /users (用戶管理)
│   ├── /merchants (商家管理)
│   ├── /products (商品審核)
│   ├── /orders (訂單監控)
│   └── /onboarding (管理員 onboarding)
```

### 響應式策略
- Mobile: < 640px (單欄, bottom nav)
- Tablet: 640px - 1024px (雙欄, sidebar)
- Desktop: > 1024px (多欄, full nav)

## 4. Features & Interactions

### 客戶端功能

#### 首頁
- 搜尋列 (即時建議，支援模糊匹配)
- 分類導航 (水平滾動)
- 限時特賣倒數計時
- 推薦商品网格 (根據瀏覽/購買歷史)
- 直播入口

#### 商品頁
- 圖片畫廊 (支援放大、縮圖切換)
- 規格選項 (顏色、尺寸等)
- 數量選擇器
- 評價星等顯示 + 詳細評價列表
- 相似商品推薦
- 卖家信息卡片
- 加入購物車 / 立即購買

#### 購物車
- 多店舖整合
- 優惠券應用
- 運費計算
- 全選 / 批量刪除

#### 結帳流程
- 地址管理 (新增/編輯/刪除)
- 付款方式選擇
- 訂單摘要
- 優惠碼輸入

#### 用戶系統
- Google 登入
- 個人資料編輯
- 收藏商品
- 瀏覽足跡
- 我的評價

### 商家端功能

#### 儀表板
- 今日銷售額
- 待處理訂單
- 商品訪問量
- 銷售趨勢圖表

#### 商品管理
- 商品列表 (篩選、排序)
- 新增/編輯商品
- 規格與庫存管理
- 商品上下架
- 圖片上傳 (Firebase Storage)

#### 訂單管理
- 訂單列表 (狀態篩選)
- 訂單詳情
- 發貨處理
- 物流單號填寫

#### 數據分析
- 銷售報表
- 商品排行
- 客戶分析

#### 商店設定
- 商店名稱、Logo
- 店鋪描述
- 聯絡資訊
- 運費設定

### 管理端功能

#### 儀表板
- 總用戶數、商家數、商品數
- 今日訂單數、銷售額
- 待審核商品
- 系統狀態

#### 用戶管理
- 用戶列表
- 禁用/啟用帳號
- 用戶詳情

#### 商家管理
- 商家列表
- 商家審核
- 商家保證金

#### 商品審核
- 待審核商品
- 違規商品

#### 訂單監控
- 全平台訂單
- 爭議訂單

## 5. Component Inventory

### Button
- Variants: primary, secondary, outline, ghost
- States: default, hover (+brightness), active (scale 0.98), disabled (opacity 0.5), loading (spinner)
- Sizes: sm (32px), md (40px), lg (48px)

### Input
- States: default, focus (border accent), error (border error), disabled
- With icon support
- Error message below

### Card
- Base: white bg, border, radius 8px, shadow-sm
- Hover: shadow-md, translateY -2px
- Product card: image, title, price, rating

### Modal
- Overlay: black/50 opacity
- Content: white, radius 16px, padding 24px
- Animation: fade in + scale from 0.95

### Toast
- Types: success, error, warning, info
- Position: bottom-right
- Auto dismiss: 4s
- Animation: slide in from right

### Skeleton
- Gradient animation: shimmer effect
- 用于: card, list, profile

### Navigation
- Desktop: horizontal top nav
- Mobile: bottom tab bar
- Sidebar for merchant/admin

## 6. Technical Approach

### Frontend
- Framework: Next.js 14 (App Router)
- Styling: Tailwind CSS
- Animation: Framer Motion
- Icons: Lucide React
- Forms: React Hook Form + Zod

### Backend (Firebase Free Tier)
- Authentication: Firebase Auth (Google Sign-in)
- Database: Firestore
- Storage: Firebase Storage
- Hosting: Vercel

### Firestore Schema

```
users/
  {userId}
    - email, name, photoURL, role (customer|merchant|admin)
    - createdAt, updatedAt
    - onboardingCompleted

customerProfiles/
  {userId}
    - addresses[], favorites[], footprints[]
    - preferences

merchants/
  {userId}
    - storeName, storeLogo, description
    - status (pending|approved|rejected)
    - totalSales, totalOrders
    - rating, createdAt

products/
  {productId}
    - name, description, price, originalPrice
    - images[], category, subcategory
    - merchantId, stock, sold
    - status (pending|active|inactive)
    - rating, reviewCount
    - createdAt, updatedAt

orders/
  {orderId}
    - customerId, merchantId
    - items[], totalAmount, shippingFee
    - status (pending|paid|shipped|delivered|cancelled)
    - shippingAddress, trackingNumber
    - createdAt, updatedAt

categories/
  {categoryId}
    - name, icon, subcategories[]

reviews/
  {reviewId}
    - productId, customerId, merchantId
    - rating, comment, images[]
    - createdAt
```

### API Endpoints (Firebase Functions)
- POST /api/orders - 建立訂單
- POST /api/products - 建立商品
- PUT /api/products/:id - 更新商品
- GET /api/analytics/merchant/:id - 商家數據

### Authentication Flow
1. User clicks "Sign in with Google"
2. Firebase Auth returns credential
3. Check if user exists in Firestore `users` collection
4. If not, redirect to appropriate onboarding based on role selection
5. If yes, redirect to dashboard based on role

### Onboarding Flows

#### Customer Onboarding
1. Welcome screen with value proposition
2. Role selection (Buyer / Seller)
3. Preferences (categories of interest)
4. Notification permissions
5. Complete → Redirect to home

#### Merchant Onboarding
1. Welcome screen
2. Store name and description
3. Store logo upload
4. Bank account / payment info
5. Shipping settings
6. Terms agreement
7. Submit → Pending approval → Dashboard

#### Admin Onboarding
1. Admin code verification
2. Initial admin account setup
3. System configuration
4. Complete → Dashboard

## 7. Deployment

- Frontend: Vercel (Connected to GitHub)
- Backend: Firebase (Auth, Firestore, Storage)
- Environment Variables:
  - NEXT_PUBLIC_FIREBASE_API_KEY
  - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  - NEXT_PUBLIC_FIREBASE_PROJECT_ID
  - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  - NEXT_PUBLIC_FIREBASE_APP_ID