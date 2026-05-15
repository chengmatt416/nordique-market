'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button, Card, Input } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { motion } from 'framer-motion';
import { Save, RefreshCw, Plus, Trash2 } from 'lucide-react';

interface BrandSettings {
  name: string;
  tagline: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  facebookUrl: string;
  instagramUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  ctaPrimaryLabel: string;
  ctaSecondaryLabel: string;
  footerTagline: string;
  helpContent: string;
  privacyContent: string;
  termsContent: string;
  contactExtraInfo: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface ContentSection {
  title: string;
  content: string;
}

const defaultSettings: BrandSettings = {
  name: '',
  tagline: '',
  description: '',
  contactEmail: '',
  contactPhone: '',
  contactAddress: '',
  facebookUrl: '',
  instagramUrl: '',
  heroTitle: '',
  heroSubtitle: '',
  ctaPrimaryLabel: '',
  ctaSecondaryLabel: '',
  footerTagline: '',
  helpContent: '[]',
  privacyContent: '[]',
  termsContent: '[]',
  contactExtraInfo: '',
};

function safeParseJSON<T>(json: string, fallback: T): T {
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) return parsed as T;
    return fallback;
  } catch {
    return fallback;
  }
}

export default function BrandManagerPage() {
  const [settings, setSettings] = useState<BrandSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [privacySections, setPrivacySections] = useState<ContentSection[]>([]);
  const [termsSections, setTermsSections] = useState<ContentSection[]>([]);

  useEffect(() => {
    fetch('/api/brand')
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          const merged = { ...defaultSettings, ...data };
          setSettings(merged);
          setFaqItems(safeParseJSON<FAQItem[]>(merged.helpContent, []));
          setPrivacySections(safeParseJSON<ContentSection[]>(merged.privacyContent, []));
          setTermsSections(safeParseJSON<ContentSection[]>(merged.termsContent, []));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const syncJSONFields = (
    settingsOverride?: Partial<BrandSettings>,
    faq?: FAQItem[],
    privacy?: ContentSection[],
    terms?: ContentSection[]
  ) => {
    const base = settingsOverride ? { ...settings, ...settingsOverride } : settings;
    setSettings({
      ...base,
      helpContent: JSON.stringify(faq ?? faqItems),
      privacyContent: JSON.stringify(privacy ?? privacySections),
      termsContent: JSON.stringify(terms ?? termsSections),
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...settings };
      delete (payload as any).features;
      delete (payload as any).categories;
      const res = await fetch('/api/brand', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showToast('品牌設定已儲存', 'success');
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data?.error || `儲存失敗 (${res.status})`, 'error');
      }
    } catch {
      showToast('無法連線到伺服器', 'error');
    } finally {
      setSaving(false);
    }
  };

  const update = (key: keyof BrandSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const addFaq = () => {
    const next = [...faqItems, { question: '', answer: '' }];
    setFaqItems(next);
    syncJSONFields(undefined, next);
  };

  const updateFaq = (idx: number, field: keyof FAQItem, value: string) => {
    const next = faqItems.map((item, i) => (i === idx ? { ...item, [field]: value } : item));
    setFaqItems(next);
    syncJSONFields(undefined, next);
  };

  const removeFaq = (idx: number) => {
    const next = faqItems.filter((_, i) => i !== idx);
    setFaqItems(next);
    syncJSONFields(undefined, next);
  };

  const addPrivacySection = () => {
    const next = [...privacySections, { title: '', content: '' }];
    setPrivacySections(next);
    syncJSONFields(undefined, undefined, next);
  };

  const updatePrivacySection = (idx: number, field: keyof ContentSection, value: string) => {
    const next = privacySections.map((s, i) => (i === idx ? { ...s, [field]: value } : s));
    setPrivacySections(next);
    syncJSONFields(undefined, undefined, next);
  };

  const removePrivacySection = (idx: number) => {
    const next = privacySections.filter((_, i) => i !== idx);
    setPrivacySections(next);
    syncJSONFields(undefined, undefined, next);
  };

  const addTermsSection = () => {
    const next = [...termsSections, { title: '', content: '' }];
    setTermsSections(next);
    syncJSONFields(undefined, undefined, undefined, next);
  };

  const updateTermsSection = (idx: number, field: keyof ContentSection, value: string) => {
    const next = termsSections.map((s, i) => (i === idx ? { ...s, [field]: value } : s));
    setTermsSections(next);
    syncJSONFields(undefined, undefined, undefined, next);
  };

  const removeTermsSection = (idx: number) => {
    const next = termsSections.filter((_, i) => i !== idx);
    setTermsSections(next);
    syncJSONFields(undefined, undefined, undefined, next);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-gray-400 py-12 text-center">載入中...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">品牌設定</h1>
          <Button onClick={handleSave} loading={saving}>
            <Save className="w-4 h-4 mr-1" /> 儲存設定
          </Button>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          在此頁面設定品牌資訊，無需修改程式碼。修改會即時顯示在網站上。
          <br />
          <strong>品牌名稱</strong>也可以在環境變數 <code>NEXT_PUBLIC_BRAND_NAME</code> 中設定。
        </p>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card padding="md">
            <h2 className="text-lg font-semibold mb-4">基本資訊</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="品牌名稱"
                value={settings.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="輸入你的品牌名稱"
              />
              <Input
                label="標語 (Tagline)"
                value={settings.tagline}
                onChange={(e) => update('tagline', e.target.value)}
                placeholder="簡短的品牌標語"
              />
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700 block mb-1">品牌描述</label>
              <textarea
                value={settings.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder="輸入品牌描述..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm"
              />
            </div>
          </Card>

          <Card padding="md">
            <h2 className="text-lg font-semibold mb-4">首頁 Hero 區塊</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Hero 標題"
                value={settings.heroTitle}
                onChange={(e) => update('heroTitle', e.target.value)}
                placeholder="例如：探索美好生活"
              />
              <Input
                label="Hero 副標題"
                value={settings.heroSubtitle}
                onChange={(e) => update('heroSubtitle', e.target.value)}
                placeholder="簡短描述"
              />
              <Input
                label="主要按鈕文字"
                value={settings.ctaPrimaryLabel}
                onChange={(e) => update('ctaPrimaryLabel', e.target.value)}
                placeholder="例如：開始選購"
              />
              <Input
                label="次要按鈕文字"
                value={settings.ctaSecondaryLabel}
                onChange={(e) => update('ctaSecondaryLabel', e.target.value)}
                placeholder="例如：商家入駐"
              />
            </div>
          </Card>

          <Card padding="md">
            <h2 className="text-lg font-semibold mb-4">聯絡資訊</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                value={settings.contactEmail}
                onChange={(e) => update('contactEmail', e.target.value)}
                placeholder="contact@example.com"
              />
              <Input
                label="電話"
                value={settings.contactPhone}
                onChange={(e) => update('contactPhone', e.target.value)}
                placeholder="02-1234-5678"
              />
              <Input
                label="地址"
                value={settings.contactAddress}
                onChange={(e) => update('contactAddress', e.target.value)}
                placeholder="台北市..."
              />
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700 block mb-1">其他聯絡資訊</label>
              <textarea
                value={settings.contactExtraInfo}
                onChange={(e) => update('contactExtraInfo', e.target.value)}
                placeholder="額外的聯絡資訊或備註..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm"
              />
            </div>
          </Card>

          <Card padding="md">
            <h2 className="text-lg font-semibold mb-4">社群連結</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Facebook URL"
                value={settings.facebookUrl}
                onChange={(e) => update('facebookUrl', e.target.value)}
                placeholder="https://facebook.com/..."
              />
              <Input
                label="Instagram URL"
                value={settings.instagramUrl}
                onChange={(e) => update('instagramUrl', e.target.value)}
                placeholder="https://instagram.com/..."
              />
            </div>
          </Card>

          <Card padding="md">
            <h2 className="text-lg font-semibold mb-4">頁尾設定</h2>
            <Input
              label="頁尾標語"
              value={settings.footerTagline}
              onChange={(e) => update('footerTagline', e.target.value)}
              placeholder="頁尾顯示的簡短說明"
            />
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">FAQ 管理（幫助中心）</h2>
              <button
                onClick={addFaq}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-500 text-white text-xs font-medium rounded-lg hover:bg-indigo-600 transition-colors"
              >
                <Plus className="w-3 h-3" /> 新增問題
              </button>
            </div>
            {faqItems.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">尚無 FAQ 項目，點擊上方按鈕新增</p>
            ) : (
              <div className="space-y-4">
                {faqItems.map((item, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="text-xs font-medium text-gray-400">問題 #{idx + 1}</span>
                      <button
                        onClick={() => removeFaq(idx)}
                        className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">問題</label>
                        <input
                          value={item.question}
                          onChange={(e) => updateFaq(idx, 'question', e.target.value)}
                          placeholder="輸入常見問題..."
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">答案</label>
                        <textarea
                          value={item.answer}
                          onChange={(e) => updateFaq(idx, 'answer', e.target.value)}
                          placeholder="輸入答案..."
                          rows={3}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">隱私權政策內容</h2>
              <button
                onClick={addPrivacySection}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-500 text-white text-xs font-medium rounded-lg hover:bg-indigo-600 transition-colors"
              >
                <Plus className="w-3 h-3" /> 新增段落
              </button>
            </div>
            {privacySections.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">尚無隱私權政策段落，點擊上方按鈕新增</p>
            ) : (
              <div className="space-y-4">
                {privacySections.map((section, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="text-xs font-medium text-gray-400">段落 #{idx + 1}</span>
                      <button
                        onClick={() => removePrivacySection(idx)}
                        className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">標題</label>
                        <input
                          value={section.title}
                          onChange={(e) => updatePrivacySection(idx, 'title', e.target.value)}
                          placeholder="輸入段落標題..."
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">內容</label>
                        <textarea
                          value={section.content}
                          onChange={(e) => updatePrivacySection(idx, 'content', e.target.value)}
                          placeholder="輸入段落內容..."
                          rows={4}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">服務條款內容</h2>
              <button
                onClick={addTermsSection}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-500 text-white text-xs font-medium rounded-lg hover:bg-indigo-600 transition-colors"
              >
                <Plus className="w-3 h-3" /> 新增段落
              </button>
            </div>
            {termsSections.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">尚無服務條款段落，點擊上方按鈕新增</p>
            ) : (
              <div className="space-y-4">
                {termsSections.map((section, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="text-xs font-medium text-gray-400">段落 #{idx + 1}</span>
                      <button
                        onClick={() => removeTermsSection(idx)}
                        className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">標題</label>
                        <input
                          value={section.title}
                          onChange={(e) => updateTermsSection(idx, 'title', e.target.value)}
                          placeholder="輸入段落標題..."
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">內容</label>
                        <textarea
                          value={section.content}
                          onChange={(e) => updateTermsSection(idx, 'content', e.target.value)}
                          placeholder="輸入段落內容..."
                          rows={4}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="flex gap-3">
            <Button onClick={handleSave} loading={saving} size="lg">
              <Save className="w-4 h-4 mr-2" /> 儲存設定
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" /> 重設
            </Button>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}