'use client';
import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';

const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || '';

interface BrandContact {
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  contactExtraInfo: string;
}

export default function ContactPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [brand, setBrand] = useState<BrandContact>({
    contactEmail: '',
    contactPhone: '',
    contactAddress: '',
    contactExtraInfo: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/brand')
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          setBrand({
            contactEmail: data.contactEmail || '',
            contactPhone: data.contactPhone || '',
            contactAddress: data.contactAddress || '',
            contactExtraInfo: data.contactExtraInfo || '',
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    await new Promise((r) => setTimeout(r, 800));
    setSubmitted(true);
    setSubmitting(false);
    showToast('訊息已送出！我們將盡快回覆您。', 'success');
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

      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">聯絡客服</h1>
          <p className="text-gray-500 mb-10">如有任何問題或建議，歡迎與我們聯繫，我們將盡快為您服務。</p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl border border-gray-200 p-10 text-center"
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">訊息已送出！</h2>
                  <p className="text-gray-500 mb-6">感謝您的來信，我們將於 1-2 個工作天內回覆您。</p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: '', email: '', subject: '', message: '' });
                    }}
                    className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    發送新訊息
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          姓名 <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="請輸入您的姓名"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          電子郵件 <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="your@email.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        主旨 <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="請輸入主旨"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        訊息內容 <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        required
                        rows={5}
                        placeholder="請描述您的問題或建議..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full h-12 flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <span className="animate-pulse">發送中...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          送出訊息
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="space-y-5">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">電子郵件</h3>
                    <p className="text-sm text-gray-500">{brand.contactEmail || '尚未設定'}</p>
                    <p className="text-xs text-gray-400 mt-1">24 小時內回覆</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">客服專線</h3>
                    <p className="text-sm text-gray-500">{brand.contactPhone || '尚未設定'}</p>
                    <p className="text-xs text-gray-400 mt-1">週一至週五 09:00-18:00</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">公司地址</h3>
                    <p className="text-sm text-gray-500">{brand.contactAddress || '尚未設定'}</p>
                  </div>
                </div>
              </div>

              {brand.contactExtraInfo && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">其他資訊</h3>
                  <p className="text-sm text-gray-500 whitespace-pre-line">{brand.contactExtraInfo}</p>
                </div>
              )}

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">客服時間</h3>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex justify-between">
                    <span>週一至週五</span>
                    <span>09:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>週六</span>
                    <span>10:00 - 17:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>週日及國定假日</span>
                    <span className="text-gray-400">休息</span>
                  </div>
                </div>
              </div>
            </div>
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