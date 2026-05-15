'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Input } from '@/components/ui';
import { CheckCircle, Copy, ExternalLink, AlertCircle, ChevronRight, ChevronDown, Key, Database, Shield, Server, ClipboardCheck } from 'lucide-react';

type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

interface ServerConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

interface AllConfig {
  client: FirebaseConfig;
  server: ServerConfig;
}

const STORAGE_KEY = 'nordique-firebase-config';

const defaultClientConfig: FirebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

const defaultServerConfig: ServerConfig = {
  projectId: '',
  clientEmail: '',
  privateKey: '',
};

function loadConfig(): AllConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    return null;
  }
  return null;
}

function saveConfig(config: AllConfig) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export default function FirebaseSetupPage() {
  const [step, setStep] = useState<Step>(1);
  const [clientConfig, setClientConfig] = useState<FirebaseConfig>(defaultClientConfig);
  const [serverConfig, setServerConfig] = useState<ServerConfig>(defaultServerConfig);
  const [configured, setConfigured] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadConfig();
    if (saved) {
      setClientConfig(saved.client);
      setServerConfig(saved.server);
      setConfigured(true);
    }
  }, []);

  const handleSaveClient = () => {
    const all: AllConfig = { client: clientConfig, server: serverConfig };
    saveConfig(all);
    setConfigured(true);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  const handleSaveServer = () => {
    const all: AllConfig = { client: clientConfig, server: serverConfig };
    saveConfig(all);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const { initializeApp } = await import('firebase/app');
      const { getAuth } = await import('firebase/auth');
      const { getFirestore } = await import('firebase/firestore');
      const app = initializeApp(clientConfig);
      getAuth(app);
      getFirestore(app);
      setTestResult('success');
    } catch {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const getVercelEnvVars = () => {
    const lines = [
      'NEXT_PUBLIC_FIREBASE_API_KEY=' + clientConfig.apiKey,
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=' + clientConfig.authDomain,
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID=' + clientConfig.projectId,
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=' + clientConfig.storageBucket,
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=' + clientConfig.messagingSenderId,
      'NEXT_PUBLIC_FIREBASE_APP_ID=' + clientConfig.appId,
      'FIREBASE_PROJECT_ID=' + serverConfig.projectId,
      'FIREBASE_CLIENT_EMAIL=' + serverConfig.clientEmail,
      'FIREBASE_PRIVATE_KEY=' + serverConfig.privateKey,
    ];
    return lines.join('\n');
  };

  const steps = [
    { id: 1 as Step, label: '建立 Firebase 專案', icon: Key },
    { id: 2 as Step, label: '啟用 Authentication', icon: Shield },
    { id: 3 as Step, label: '建立 Firestore 資料庫', icon: Database },
    { id: 4 as Step, label: '輸入設定金鑰', icon: ClipboardCheck },
    { id: 5 as Step, label: '設定伺服器金鑰', icon: Server },
    { id: 6 as Step, label: '完成', icon: CheckCircle },
  ];

  const sidebar = (
    <nav className="space-y-1">
      {steps.map((s, i) => {
        const isActive = step === s.id;
        const isComplete = step > s.id;
        const Icon = s.icon;
        return (
          <button
            key={s.id}
            onClick={() => setStep(s.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              isActive
                ? 'bg-indigo-50 text-indigo-600 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : isComplete
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {isComplete ? <CheckCircle className="w-4 h-4" /> : s.id}
            </span>
            <span className="text-sm">{s.label}</span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Firebase 設定嚮導</h1>
          <p className="text-sm text-gray-600 mt-1">按照步驟完成 Firebase 專案設定並儲存環境變數</p>
        </div>

        {/* Connection Status */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                configured ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
            <span className="text-sm text-gray-600">
              {configured ? '已設定' : '尚未設定'}
            </span>
          </div>
          {configured && (
            <Button variant="outline" size="sm" onClick={handleTestConnection} loading={testing}>
              測試連線
            </Button>
          )}
          {testResult === 'success' && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> 連線成功
            </span>
          )}
          {testResult === 'error' && (
            <span className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> 連線失敗
            </span>
          )}
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-56 shrink-0 hidden md:block">
            <Card padding="md">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                步驟
              </div>
              {sidebar}
            </Card>
          </aside>

          {/* Mobile step selector */}
          <div className="md:hidden w-full mb-4">
            <Card padding="md" className="w-full">
              <div className="flex items-center gap-3 flex-wrap">
                {steps.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStep(s.id)}
                    className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                      step === s.id
                        ? 'bg-indigo-600 text-white'
                        : step > s.id
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step > s.id ? <CheckCircle className="w-4 h-4" /> : s.id}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <Card padding="lg">
                  {step === 1 && (
                    <Step1Content />
                  )}
                  {step === 2 && (
                    <Step2Content />
                  )}
                  {step === 3 && (
                    <Step3Content />
                  )}
                  {step === 4 && (
                    <Step4Content
                      config={clientConfig}
                      onChange={setClientConfig}
                      onSave={handleSaveClient}
                      showSaved={showSaved}
                      configured={configured}
                    />
                  )}
                  {step === 5 && (
                    <Step5Content
                      config={serverConfig}
                      onChange={setServerConfig}
                      onSave={handleSaveServer}
                      showSaved={showSaved}
                      configured={configured}
                    />
                  )}
                  {step === 6 && (
                    <Step6Content
                      clientConfig={clientConfig}
                      serverConfig={serverConfig}
                      getVercelEnvVars={getVercelEnvVars}
                      copyToClipboard={copyToClipboard}
                      copied={copied}
                    />
                  )}
                </Card>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

function Step1Content() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">步驟 1：建立 Firebase 專案</h2>
      <div className="space-y-4 text-sm text-gray-600">
        <ol className="list-decimal list-inside space-y-2">
          <li>前往 Firebase 控制台建立新專案</li>
          <li>輸入專案名稱（例如：Nordique Market）</li>
          <li>選擇是否啟用 Google Analytics（建議啟用）</li>
          <li>點擊「建立專案」並等待完成</li>
        </ol>
        <a
          href="https://console.firebase.google.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-medium"
        >
          開啟 Firebase 控制台 <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <div className="mt-6 flex justify-end">
          <Button onClick={() => {
            const el = document.querySelector('[data-step]');
            if (el) el.dispatchEvent(new Event('next-step'));
          }}>
            下一步 <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Step2Content() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">步驟 2：啟用 Authentication</h2>
      <div className="space-y-4 text-sm text-gray-600">
        <ol className="list-decimal list-inside space-y-2">
          <li>在 Firebase 控制台左側選單中，點擊「Authentication」</li>
          <li>點擊「開始使用」按鈕</li>
          <li>在「登入方式」分頁中，選擇需要的登入提供者（Email/Password、Google 等）</li>
          <li>啟用 Email/Password 提供者</li>
          <li>如需要，啟用 Google 登入並設定 OAuth 同意畫面</li>
        </ol>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">注意事項</p>
              <p className="text-amber-700 mt-1">
                確保已在 Firebase 專案中設定授權網域（Authorized Domains），加入你的應用程式網址
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step3Content() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">步驟 3：建立 Firestore 資料庫</h2>
      <div className="space-y-4 text-sm text-gray-600">
        <ol className="list-decimal list-inside space-y-2">
          <li>在 Firebase 控制台左側選單中，點擊「Firestore Database」</li>
          <li>點擊「建立資料庫」按鈕</li>
          <li>選擇「以測試模式啟動」（開發階段）或「以正式版模式啟動」</li>
          <li>選擇資料庫位置（建議選擇 asia-east1 台灣或相近區域）</li>
          <li>點擊「啟用」完成建立</li>
        </ol>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-amber-800">安全規則</p>
              <p className="text-amber-700 mt-1">
                測試模式會在 30 天後過期。上線前請務必設定適當的 Firestore 安全規則。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step4Content({
  config,
  onChange,
  onSave,
  showSaved,
  configured,
}: {
  config: FirebaseConfig;
  onChange: (c: FirebaseConfig) => void;
  onSave: () => void;
  showSaved: boolean;
  configured: boolean;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">步驟 4：輸入設定金鑰</h2>
      <p className="text-sm text-gray-600 mb-6">
        在 Firebase 控制台 &gt; 專案設定 &gt; 一般設定 中找到以下設定值，並貼到對應欄位中。
      </p>
      <div className="space-y-4">
        <Input
          label="API Key"
          value={config.apiKey}
          onChange={(e) => onChange({ ...config, apiKey: e.target.value })}
          placeholder="AIzaSy..."
        />
        <Input
          label="Auth Domain"
          value={config.authDomain}
          onChange={(e) => onChange({ ...config, authDomain: e.target.value })}
          placeholder="my-project.firebaseapp.com"
        />
        <Input
          label="Project ID"
          value={config.projectId}
          onChange={(e) => onChange({ ...config, projectId: e.target.value })}
          placeholder="my-project-id"
        />
        <Input
          label="Storage Bucket"
          value={config.storageBucket}
          onChange={(e) => onChange({ ...config, storageBucket: e.target.value })}
          placeholder="my-project.appspot.com"
        />
        <Input
          label="Messaging Sender ID"
          value={config.messagingSenderId}
          onChange={(e) => onChange({ ...config, messagingSenderId: e.target.value })}
          placeholder="123456789"
        />
        <Input
          label="App ID"
          value={config.appId}
          onChange={(e) => onChange({ ...config, appId: e.target.value })}
          placeholder="1:123456789:web:abc123"
        />
      </div>
      <div className="mt-6 flex items-center gap-3">
        <Button onClick={onSave}>儲存設定</Button>
        {showSaved && (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" /> 已儲存
          </span>
        )}
        {configured && !showSaved && (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" /> 已設定
          </span>
        )}
      </div>
    </div>
  );
}

function Step5Content({
  config,
  onChange,
  onSave,
  showSaved,
  configured,
}: {
  config: ServerConfig;
  onChange: (c: ServerConfig) => void;
  onSave: () => void;
  showSaved: boolean;
  configured: boolean;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">步驟 5：設定伺服器金鑰</h2>
      <p className="text-sm text-gray-600 mb-6">
        在 Firebase 控制台 &gt; 專案設定 &gt; 服務帳戶 中產生新的私密金鑰，並輸入以下欄位。這些值將用於伺服器端 Admin SDK。
      </p>
      <div className="space-y-4">
        <Input
          label="Project ID"
          value={config.projectId}
          onChange={(e) => onChange({ ...config, projectId: e.target.value })}
          placeholder="my-project-id"
        />
        <Input
          label="Client Email"
          value={config.clientEmail}
          onChange={(e) => onChange({ ...config, clientEmail: e.target.value })}
          placeholder="firebase-adminsdk-xxxxx@my-project.iam.gserviceaccount.com"
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Private Key</label>
          <textarea
            value={config.privateKey}
            onChange={(e) => onChange({ ...config, privateKey: e.target.value })}
            placeholder="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
            rows={5}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-y"
          />
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">安全性提醒</p>
              <p className="text-amber-700 mt-1 text-sm">
                私密金鑰是敏感資訊，請勿提交到版本控制系統（Git）。這些值只會儲存在你的瀏覽器 localStorage 中，不會上傳到任何伺服器。
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex items-center gap-3">
        <Button onClick={onSave}>儲存設定</Button>
        {showSaved && (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" /> 已儲存
          </span>
        )}
        {configured && !showSaved && (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" /> 已設定
          </span>
        )}
      </div>
    </div>
  );
}

function Step6Content({
  clientConfig,
  serverConfig,
  getVercelEnvVars,
  copyToClipboard,
  copied,
}: {
  clientConfig: FirebaseConfig;
  serverConfig: ServerConfig;
  getVercelEnvVars: () => string;
  copyToClipboard: (text: string, label: string) => void;
  copied: string | null;
}) {
  const envVars = getVercelEnvVars();

  const clientComplete = Object.values(clientConfig).every(Boolean);
  const serverComplete = Object.values(serverConfig).every(Boolean);
  const allComplete = clientComplete && serverComplete;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">步驟 6：完成設定</h2>

      {/* Status Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                clientComplete ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
            <span className="text-sm font-medium text-gray-900">客戶端設定</span>
          </div>
          <div className="space-y-1 text-xs text-gray-600">
            <div>API Key: {clientConfig.apiKey ? '已設定' : '尚未設定'}</div>
            <div>Auth Domain: {clientConfig.authDomain ? '已設定' : '尚未設定'}</div>
            <div>Project ID: {clientConfig.projectId ? '已設定' : '尚未設定'}</div>
            <div>Storage Bucket: {clientConfig.storageBucket ? '已設定' : '尚未設定'}</div>
            <div>Messaging Sender ID: {clientConfig.messagingSenderId ? '已設定' : '尚未設定'}</div>
            <div>App ID: {clientConfig.appId ? '已設定' : '尚未設定'}</div>
          </div>
        </div>
        <div className="border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                serverComplete ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
            <span className="text-sm font-medium text-gray-900">伺服器設定</span>
          </div>
          <div className="space-y-1 text-xs text-gray-600">
            <div>Project ID: {serverConfig.projectId ? '已設定' : '尚未設定'}</div>
            <div>Client Email: {serverConfig.clientEmail ? '已設定' : '尚未設定'}</div>
            <div>Private Key: {serverConfig.privateKey ? '已設定' : '尚未設定'}</div>
          </div>
        </div>
      </div>

      {allComplete && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-900">所有設定已完成！</p>
              <p className="text-sm text-green-700 mt-1">
                Firebase 設定已儲存到瀏覽器中。請將下方的環境變數複製到 Vercel 專案設定中。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Vercel Env Vars */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Vercel 環境變數</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(envVars, 'vercel')}
          >
            {copied === 'vercel' ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-green-500" /> 已複製
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> 複製全部
              </>
            )}
          </Button>
        </div>
        <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
          {envVars}
        </pre>
      </div>

      {/* Manual instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">如何在 Vercel 設定環境變數</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
          <li>前往 Vercel 專案儀表板</li>
          <li>點擊「Settings」 &gt;「Environment Variables」</li>
          <li>將上方所有變數逐個新增到 Vercel</li>
          <li>選擇環境範圍（Production、Preview、Development）</li>
          <li>點擊「Save」儲存</li>
          <li>重新部署專案使變數生效</li>
        </ol>
        <a
          href="https://vercel.com/docs/projects/environment-variables"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-medium text-sm mt-3"
        >
          Vercel 環境變數文件 <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">請勿將金鑰提交到 Git</p>
            <p className="text-sm text-amber-700 mt-1">
              確保 <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-800 text-xs">.env.local</code> 和
              <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-800 text-xs"> serviceAccount.json</code> 已在
              <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-800 text-xs">.gitignore</code> 中。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}