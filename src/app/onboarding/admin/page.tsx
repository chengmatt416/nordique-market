'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Input } from '@/components/ui';
import {
  Shield,
  KeyRound,
  User,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const STEPS = [
  { id: 0, title: '歡迎', icon: Shield },
  { id: 1, title: '驗證', icon: KeyRound },
  { id: 2, title: '設定', icon: User },
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

export default function AdminOnboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [adminCode, setAdminCode] = useState('');
  const [adminCodeError, setAdminCodeError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [formData, setFormData] = useState({
    adminName: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

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

  const verifyAdminCode = async () => {
    setIsVerifying(true);
    setAdminCodeError('');

    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (adminCode.toLowerCase() === 'admin-secret-2024') {
      handleNext();
    } else if (adminCode.length === 0) {
      setAdminCodeError('請輸入管理員驗證碼');
    } else {
      setAdminCodeError('驗證碼不正確，請聯繫系統管理員');
    }
    setIsVerifying(false);
  };

  const handleSetup = async () => {
    if (formData.password.length < 8) {
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSetupComplete(true);
  };

  const canProceedStep1 = () => {
    return formData.adminName.trim().length >= 2 && formData.password.length >= 8 && formData.password === formData.confirmPassword;
  };

  if (isSetupComplete) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
            設定完成！
          </h1>
          <p className="text-[var(--text-secondary)] mb-8">
            管理員帳戶已成功設定。現在您可以登入管理後台開始管理系統。
          </p>
          <Button onClick={() => router.push('/admin')}>
            前往管理後台
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <div className="w-full max-w-lg mx-auto px-6 pt-12 pb-8">
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  index <= currentStep
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--border)] text-[var(--text-muted)]'
                }`}
              >
                <step.icon className="w-5 h-5" />
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`w-16 h-0.5 mx-2 transition-all duration-300 ${
                    index < currentStep ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between text-xs text-[var(--text-muted)] mt-2 px-1">
          {STEPS.map((step) => (
            <span key={step.id} className="text-center" style={{ width: '70px' }}>
              {step.title}
            </span>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-32">
        <div className="w-full max-w-md">
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
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
                      <Shield className="w-12 h-12 text-white" />
                    </div>
                  </motion.div>
                  <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
                    管理員設定
                  </h1>
                  <p className="text-[var(--text-secondary)] mb-8 max-w-sm mx-auto">
                    歡迎使用 AURA 管理系統。此設定精靈將引導您完成管理員帳戶的初始配置。
                  </p>
                  <div className="bg-[var(--surface)] rounded-[var(--radius-md)] p-4 mb-8 text-left">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--warning)]/20 flex items-center justify-center flex-shrink-0">
                        <KeyRound className="w-4 h-4 text-[var(--warning)]" />
                      </div>
                      <div>
                        <div className="font-medium text-[var(--text-primary)] text-sm">
                          安全提示
                        </div>
                        <div className="text-xs text-[var(--text-muted)] mt-1">
                          請妥善保管您的管理員驗證碼，切勿洩露給他人。
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button size="lg" onClick={handleNext}>
                    開始設定
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              )}

              {currentStep === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2 text-center">
                    驗證管理員
                  </h2>
                  <p className="text-[var(--text-secondary)] mb-6 text-center">
                    請輸入您收到的管理員驗證碼
                  </p>
                  <Card className="p-6">
                    <Input
                      label="管理員驗證碼"
                      placeholder="請輸入驗證碼"
                      icon={<KeyRound className="w-4 h-4" />}
                      value={adminCode}
                      onChange={(e) => {
                        setAdminCode(e.target.value);
                        setAdminCodeError('');
                      }}
                      error={adminCodeError}
                    />
                    <Button
                      className="w-full mt-4"
                      onClick={verifyAdminCode}
                      loading={isVerifying}
                    >
                      驗證
                    </Button>
                  </Card>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2 text-center">
                    管理員資料
                  </h2>
                  <p className="text-[var(--text-secondary)] mb-6 text-center">
                    設定您的管理員名稱和初始密碼
                  </p>
                  <div className="space-y-4">
                    <Input
                      label="管理員名稱"
                      placeholder="輸入管理員名稱"
                      icon={<User className="w-4 h-4" />}
                      value={formData.adminName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, adminName: e.target.value }))}
                    />

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-[var(--text-primary)]">
                        密碼
                      </label>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="至少 8 個字元"
                          className="pr-10"
                          value={formData.password}
                          onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {formData.password.length > 0 && formData.password.length < 8 && (
                        <span className="text-xs text-[var(--error)]">
                          密碼長度至少需要 8 個字元
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-[var(--text-primary)]">
                        確認密碼
                      </label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="再次輸入密碼"
                          className="pr-10"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword && (
                        <span className="text-xs text-[var(--error)]">
                          兩次輸入的密碼不相符
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[var(--background)] to-transparent">
        <div className="max-w-md mx-auto flex gap-4">
          {currentStep > 0 && (
            <Button variant="outline" onClick={handleBack} className="flex-1">
              <ArrowLeft className="w-5 h-5" />
              返回
            </Button>
          )}
          {currentStep < 2 ? (
            <Button onClick={handleNext} className="flex-1">
              繼續
              <ArrowRight className="w-5 h-5" />
            </Button>
          ) : (
            <Button onClick={handleSetup} className="flex-1" disabled={!canProceedStep1()}>
              完成設定
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}