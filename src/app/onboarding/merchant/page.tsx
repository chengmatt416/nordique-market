'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Input } from '@/components/ui';
import { BrandConfig } from '@/config/brand';
import { cn } from '@/lib/utils';
import {
  Store,
  Info,
  Upload,
  Phone,
  CreditCard,
  Truck,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  X,
  ImagePlus,
  Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const STEPS = [
  { id: 0, title: '歡迎', icon: Store },
  { id: 1, title: '商店資訊', icon: Info },
  { id: 2, title: '標誌', icon: ImagePlus },
  { id: 3, title: '聯絡方式', icon: Phone },
  { id: 4, title: '物流', icon: Truck },
  { id: 5, title: '審核', icon: CheckCircle },
];

const SHIPPING_METHODS = [
  { id: 'home_delivery', name: '宅配', description: '送貨到府' },
  { id: 'store_pickup', name: '超商取貨', description: '7-11、全家、萊爾富' },
  { id: 'international', name: '國際配送', description: '配送至海外地區' },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
  }),
};

export default function MerchantOnboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState({
    storeName: '',
    storeDescription: '',
    logo: null as string | null,
    email: '',
    phone: '',
    bankAccount: '',
    shippingMethods: [] as string[],
    baseShippingFee: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { getFirebaseApp } = await import('@/lib/firebase/config');
      const app = getFirebaseApp();
      if (app) {
        const { getStorage, ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage');
        const storage = getStorage(app);
        const path = `logos/temp/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytesResumable(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        setFormData((prev) => ({ ...prev, logo: url }));
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev) => ({ ...prev, logo: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const toggleShippingMethod = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      shippingMethods: prev.shippingMethods.includes(id)
        ? prev.shippingMethods.filter((m) => m !== id)
        : [...prev.shippingMethods, id],
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName: formData.storeName,
          description: formData.storeDescription,
          email: formData.email,
          phone: formData.phone,
          bankAccount: formData.bankAccount,
          shippingMethods: formData.shippingMethods,
          baseShippingFee: formData.baseShippingFee,
          role: 'merchant',
        }),
      });
    } catch {}
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.storeName.trim().length >= 2 && formData.storeDescription.trim().length >= 10;
      case 2:
        return true;
      case 3:
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && formData.phone.length >= 8 && formData.bankAccount.length >= 10;
      case 4:
        return formData.shippingMethods.length > 0;
      default:
        return true;
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-600 to-pink-400 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            提交成功！
          </h1>
          <p className="text-gray-600 mb-8">
            您的商店申請已提交審核。我們將在 1-3 個工作天內完成審核，並透過電子郵件通知您結果。
          </p>
          <Button onClick={() => router.push('/')}>
            返回首頁
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="w-full max-w-2xl mx-auto px-6 pt-12 pb-8">
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                  index <= currentStep
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-400'
                )}
              >
                <step.icon className="w-5 h-5" />
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'w-8 h-0.5 mx-1 transition-all duration-300',
                    index < currentStep ? 'bg-indigo-600' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between text-xs text-gray-400 mt-2">
          {STEPS.map((step) => (
            <span key={step.id} className="text-center" style={{ width: '60px' }}>
              {step.title}
            </span>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-32">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {currentStep === 0 && (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-600 to-pink-400 flex items-center justify-center">
                      <Store className="w-12 h-12 text-white" />
                    </div>
                  </motion.div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    開啟您的商店
                  </h1>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    加入 {BrandConfig.name} 平台，觸及更多顧客，提升銷售業績
                  </p>
                  <div className="text-left max-w-md mx-auto space-y-4 mb-8">
                    {[
                      { title: '零成本開始', desc: '無初始費用，只需通過審核即可開店' },
                      { title: '優質客群', desc: '接觸注重品質的高端消費族群' },
                      { title: '簡易管理後台', desc: '輕鬆管理商品、訂單和庫存' },
                      { title: '快速出金服務', desc: '銷售款項快速結算至您的帳戶' },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{item.title}</div>
                          <div className="text-sm text-gray-400">{item.desc}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <Button size="lg" onClick={handleNext}>
                    立即開店
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              )}

              {currentStep === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                    商店資訊
                  </h2>
                  <p className="text-gray-600 mb-6 text-center">
                    設定您的商店名稱和描述
                  </p>
                  <div className="space-y-4">
                    <Input
                      label="商店名稱"
                      placeholder="輸入商店名稱"
                      value={formData.storeName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, storeName: e.target.value }))}
                    />
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-900">
                        商店描述
                      </label>
                      <textarea
                        placeholder="介紹您的商店和品牌理念..."
                        value={formData.storeDescription}
                        onChange={(e) => setFormData((prev) => ({ ...prev, storeDescription: e.target.value }))}
                        className="w-full h-32 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 transition-all duration-150 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 resize-none"
                      />
                      <span className="text-xs text-gray-400">
                        至少 10 個字元
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                    上傳商店標誌
                  </h2>
                  <p className="text-gray-600 mb-6 text-center">
                    為您的商店上傳一個醒目的標誌
                  </p>
                  <Card className="p-8">
                    {formData.logo ? (
                      <div className="relative">
                        <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gray-50">
                          <img
                            src={formData.logo}
                            alt="商店標誌"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          onClick={() => setFormData((prev) => ({ ...prev, logo: null }))}
                          className="absolute top-0 right-1/2 translate-x-12 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:brightness-110"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <p className="text-center text-sm text-gray-400 mt-4">
                          點擊 X 移除圖片
                        </p>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onDrop={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const file = e.dataTransfer.files?.[0];
                          if (file) handleLogoUpload({ target: { files: [file] } } as any);
                        }}
                        className="flex flex-col items-center">
                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                          className="cursor-pointer disabled:opacity-50">
                          <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center hover:border-indigo-600 transition-colors">
                            {uploading ? (
                              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                            ) : (
                              <Upload className="w-10 h-10 text-gray-400" />
                            )}
                          </div>
                        </button>
                        <span className="mt-4 text-sm text-gray-900">
                          {uploading ? '上傳中...' : '點擊或拖曳圖片到此處上傳'}
                        </span>
                        <span className="text-xs text-gray-400 mt-1">
                          支援 JPG、PNG，最大 5MB
                        </span>
                      </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </Card>
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                    聯絡資訊
                  </h2>
                  <p className="text-gray-600 mb-6 text-center">
                    設定商店的聯絡方式以便顧客和平台與您聯繫
                  </p>
                  <div className="space-y-4">
                    <Input
                      label="電子郵件"
                      type="email"
                      placeholder="merchant@example.com"
                      icon={<CreditCard className="w-4 h-4" />}
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    />
                    <Input
                      label="聯絡電話"
                      type="tel"
                      placeholder="0912345678"
                      icon={<Phone className="w-4 h-4" />}
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                    <Input
                      label="銀行帳戶（用於收款）"
                      placeholder="帳戶號碼"
                      icon={<CreditCard className="w-4 h-4" />}
                      value={formData.bankAccount}
                      onChange={(e) => setFormData((prev) => ({ ...prev, bankAccount: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                    物流設定
                  </h2>
                  <p className="text-gray-600 mb-6 text-center">
                    選擇您提供的配送方式
                  </p>
                  <div className="space-y-4 mb-6">
                    {SHIPPING_METHODS.map((method) => (
                      <Card
                        key={method.id}
                        hover
                        onClick={() => toggleShippingMethod(method.id)}
                        className={cn(
                          'p-4 cursor-pointer transition-all',
                          formData.shippingMethods.includes(method.id)
                            ? 'border-indigo-600 bg-indigo-50'
                            : ''
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">
                              {method.name}
                            </div>
                            <div className="text-sm text-gray-400">
                              {method.description}
                            </div>
                          </div>
                          <div
                            className={cn(
                              'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                              formData.shippingMethods.includes(method.id)
                                ? 'border-indigo-600 bg-indigo-600'
                                : 'border-gray-200'
                            )}
                          >
                            {formData.shippingMethods.includes(method.id) && (
                              <CheckCircle className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                  <Input
                    label="基本運費"
                    type="number"
                    placeholder="0"
                    icon={<Truck className="w-4 h-4" />}
                    value={formData.baseShippingFee}
                    onChange={(e) => setFormData((prev) => ({ ...prev, baseShippingFee: e.target.value }))}
                  />
                </div>
              )}

              {currentStep === 5 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                    確認提交
                  </h2>
                  <p className="text-gray-600 mb-6 text-center">
                    請確認您的商店資訊
                  </p>
                  <Card className="p-6 space-y-4">
                    <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                      <div className="w-16 h-16 rounded-full bg-gray-50 overflow-hidden flex-shrink-0">
                        {formData.logo ? (
                          <img src={formData.logo} alt="商店標誌" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Store className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{formData.storeName || '未設定'}</div>
                        <div className="text-sm text-gray-400 line-clamp-2">
                          {formData.storeDescription || '未設定'}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">電子郵件</div>
                        <div className="text-gray-900">{formData.email}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">電話</div>
                        <div className="text-gray-900">{formData.phone}</div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="text-gray-400 text-sm mb-2">配送方式</div>
                      <div className="flex flex-wrap gap-2">
                        {formData.shippingMethods.length > 0 ? (
                          formData.shippingMethods.map((id) => {
                            const method = SHIPPING_METHODS.find((m) => m.id === id);
                            return (
                              <span
                                key={id}
                                className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 text-sm"
                              >
                                {method?.name}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-gray-400">未設定</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">基本運費</span>
                        <span className="font-bold text-gray-900">
                          NT$ {formData.baseShippingFee || 0}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-gray-50 to-transparent">
        <div className="max-w-xl mx-auto flex gap-4">
          {currentStep > 0 && (
            <Button variant="outline" onClick={handleBack} className="flex-1">
              <ArrowLeft className="w-5 h-5" />
              返回
            </Button>
          )}
          {currentStep < 5 ? (
            <Button onClick={handleNext} className="flex-1" disabled={!canProceed()}>
              繼續
              <ArrowRight className="w-5 h-5" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="flex-1" loading={isSubmitting}>
              提交審核
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}