# Firebase 設定指南

## 快速設定（5分鐘）

### 1. 建立 Firebase 專案

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 點擊「新增專案」
3. 輸入名稱：`aura-market`（或您喜歡的名字）
4. 點擊「建立專案」（可暫時跳過 Google Analytics）

### 2. 啟用 Google 登入

1. 左側選單：「建構」→「Authentication」→「開始使用」
2. 點擊「Sign-in method」分頁
3. 找到「Google」，點擊啟用
4. 選擇一個 Google 電子郵件作為公開聯絡人
5. 點擊「儲存」

### 3. 建立 Firestore 資料庫

1. 左側選單：「建構」→「Firestore Database」→「建立資料庫」
2. 選擇「測試模式」（無須設定安全性規則，適合開發）
3. 選擇地點：建議選擇 `asia-east1`（臺灣）
4. 點擊「啟用」

### 4. 複製設定金鑰

1. 點擊左上角齒輪 → 「專案設定」
2. 滾動到「您的應用程式」區塊
3. 點擊「新增應用程式」（Web 圖示 `</>`）
4. 輸入暱稱，不勾選 Firebase Hosting
5. 點擊「註冊應用程式」
6. 複製 `firebaseConfig` 物件

### 5. 設定環境變數

在專案根目錄建立 `.env.local`：

```env
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123

# Firebase Admin Configuration (伺服器端用，不要公開)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADAN...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

### 6. 取得 Firebase Admin 私密金鑰

1. Firebase Console → 齒輪 → 「專案設定」
2. 切換到「服務帳戶」分頁
3. 點擊「產生新的私密金鑰」
4. 下載 JSON 檔案
5. 開啟檔案，複製：
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`（需要將換行換成 `\n`）

### 7. 在本機測試

```bash
cd nordique-market
cp .env.example .env.local
# 編輯 .env.local，填入您的金鑰
npm run dev
```

### 8. 部署到 Vercel

1. Vercel Dashboard → 您的專案 → Settings → Environment Variables
2. 新增所有 `NEXT_PUBLIC_FIREBASE_*` 變數
3. 新增所有 `FIREBASE_*` 變數
4. Redeploy

---

## 詳細設定（可選）

### 啟用 Firebase Storage（用於上傳圖片）

1. 左側選單：「建構」→「Storage」→「開始使用」
2. 選擇「測試模式」
3. 選擇地點，點擊「完成」

### 設定 Firestore 安全規則（正式環境）

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 用戶只能讀取自己的資料
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // 商品：所有人可讀，商家可寫
    match /products/{productId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null;
    }

    // 訂單：用戶只能讀取自己的訂單
    match /orders/{orderId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 執行初始化腳本（可選）

建立預設管理員和範例資料：

```bash
# 在專案根目錄執行
node scripts/setup-firebase.js
```

預設帳號：
- 管理員：admin@aura-market.com / Admin123!
- 商家：merchant@aura-market.com / Merchant123!

---

## 常見問題

### Q: 出現 "auth/invalid-api-key" 錯誤
A: 檢查 `.env.local` 中的 `NEXT_PUBLIC_FIREBASE_API_KEY` 是否正確

### Q: 出現 "auth/user-disabled" 錯誤
A: 在 Firebase Console > Authentication > Users 確認用戶未被停用

### Q: 無法寫入 Firestore
A: 確認已啟用 Firestore Database，且在測試模式下或設定了正確的安全規則

### Q: Vercel 部署後無法運作
A: 確認已在 Vercel 設定所有環境變數，然後重新部署

---

## 開發完成後

1. 將 `.env.local` 加入 `.gitignore`
2. 設定正式的 Firestore 安全規則
3. 啟用 Firebase Hosting（可選）
4. 設定付款方式（如果要接受付款）