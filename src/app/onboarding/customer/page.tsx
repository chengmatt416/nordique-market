'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card } from '@/components/ui';
import { BrandConfig } from '@/config/brand';
import { cn } from '@/lib/utils';
import { User, Heart, Bell, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  { id: 'fashion', name: '時尚', icon: '👗' },
  { id: 'electronics', name: '電子產品', icon: '📱' },
  { id: 'home', name: '家居', icon: '🏠' },
  { id: 'beauty', name: '美妝', icon: '💄' },
  { id: 'sports', name: '運動', icon: '⚽' },
  { id: 'food', name: '食品', icon: '🍜' },
];

const STEPS = [
  { id: 0, title: '歡迎', icon: User },
  { id: 1, title: '喜好', icon: Heart },
  { id: 2, title: '通知', icon: Bell },
  { id: 3, title: '完成', icon: CheckCircle },
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

export default function CustomerOnboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: true,
    newsletter: false,
  });

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

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id)
        ? prev.filter((c) => c !== id)
        : prev.length < 5
          ? [...prev, id]
          : prev
    );
  };

  const handleComplete = () => {
    router.push('/client/home');
  };

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
                    'w-12 h-0.5 mx-1 transition-all duration-300',
                    index < currentStep ? 'bg-indigo-600' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between text-xs text-gray-400 mt-2">
          {STEPS.map((step) => (
            <span key={step.id} className="w-10 text-center">
              {step.title}
            </span>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-24">
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
                    className="mb-8"
                  >
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-600 to-pink-400 flex items-center justify-center">
                      <User className="w-12 h-12 text-white" />
                    </div>
                  </motion.div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    歡迎加入 {BrandConfig.name}
                  </h1>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                     探索來自世界各地的優質商品，享受便捷的購物體驗。讓我們一起開始您的精緻生活之旅。
                  </p>
                  <Button size="lg" onClick={handleNext}>
                    開始設定
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              )}

              {currentStep === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                    選擇您感興趣的類別
                  </h2>
                  <p className="text-gray-600 mb-6 text-center">
                    選擇 3-5 個類別以獲得個人化推薦
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {CATEGORIES.map((category) => (
                      <Card
                        key={category.id}
                        hover
                        onClick={() => toggleCategory(category.id)}
                        className={cn(
                          'text-center py-6 transition-all relative',
                          selectedCategories.includes(category.id)
                            ? 'border-indigo-600 bg-indigo-50'
                            : ''
                        )}
                      >
                        <div className="text-4xl mb-2">{category.icon}</div>
                        <div className="font-medium text-gray-900">
                          {category.name}
                        </div>
                        {selectedCategories.includes(category.id) && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center"
                          >
                            <CheckCircle className="w-4 h-4 text-white" />
                          </motion.div>
                        )}
                      </Card>
                    ))}
                  </div>
                  <div className="mt-6 text-center text-sm text-gray-400">
                    已選擇 {selectedCategories.length}/5 個類別
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                    通知設定
                  </h2>
                  <p className="text-gray-600 mb-6 text-center">
                    選擇您想要接收的通知類型
                  </p>
                  <div className="space-y-4">
                    {[
                      {
                        key: 'orderUpdates',
                        title: '訂單更新',
                        description: '接收訂單狀態和配送進度通知',
                      },
                      {
                        key: 'promotions',
                        title: '優惠活動',
                        description: '接收限時優惠和促銷活動通知',
                      },
                      {
                        key: 'newsletter',
                        title: '電子報',
                        description: '接收每週精選推薦和最新資訊',
                      },
                    ].map((item) => (
                      <Card key={item.key} className="flex items-center justify-between p-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {item.title}
                          </div>
                          <div className="text-sm text-gray-400">
                            {item.description}
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            setNotifications((prev) => ({
                              ...prev,
                              [item.key]: !prev[item.key as keyof typeof prev],
                            }))
                          }
                          className={cn(
                            'w-14 h-8 rounded-full transition-all duration-300 relative',
                            notifications[item.key as keyof typeof notifications]
                              ? 'bg-indigo-600'
                              : 'bg-gray-200'
                          )}
                        >
                          <motion.div
                            animate={{ x: notifications[item.key as keyof typeof notifications] ? 28 : 4 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            className="w-6 h-6 rounded-full bg-white shadow-md absolute top-1"
                          />
                        </button>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="mb-8"
                  >
                    <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-indigo-600 to-pink-400 flex items-center justify-center">
                      <CheckCircle className="w-16 h-16 text-white" />
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      設定完成！
                    </h2>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                       您的個人化購物體驗已準備就緒。探索心儀的商品，開始您的精緻生活吧！
                    </p>
                    <Button size="lg" onClick={handleComplete}>
                      探索商品
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {currentStep > 0 && currentStep < 3 && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-gray-50 to-transparent">
          <div className="max-w-xl mx-auto flex gap-4">
            <Button variant="outline" onClick={handleBack} className="flex-1">
              <ArrowLeft className="w-5 h-5" />
              返回
            </Button>
            <Button onClick={handleNext} className="flex-1" disabled={currentStep === 1 && selectedCategories.length < 3}>
              繼續
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}