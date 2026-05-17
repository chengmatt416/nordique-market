'use client';

import { useState, useEffect } from 'react';
import { MerchantLayout } from '@/components/layout/MerchantLayout';
import { Card, Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Store, CreditCard, Truck, Save, Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

const shippingMethods = [
  { id: '7-11', label: '7-11 超商取貨' },
  { id: 'family', label: '全家 超商取貨' },
  { id: 'cat', label: '黑貓宅急便' },
  { id: 'post', label: '郵局' },
];

export default function MerchantSettings() {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [baseFee, setBaseFee] = useState('60');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const [selectedShipping, setSelectedShipping] = useState<string[]>([]);
  const [logo, setLogo] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/brand');
        if (res.ok) {
          const data = await res.json();
          if (data && !data.error) {
            setStoreName(data.storeName || '');
            setDescription(data.description || '');
            setEmail(data.contactEmail || '');
            setPhone(data.contactPhone || '');
          }
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const toggleShipping = (id: string) => {
    setSelectedShipping((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/brand', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName,
          description,
          contactEmail: email,
          contactPhone: phone,
          shippingMethods: selectedShipping,
          baseFee,
        }),
      });
      showToast('設定已成功儲存', 'success');
    } catch {
      showToast('儲存失敗', 'error');
    }
    setSaving(false);
  };

  return (
    <MerchantLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">商店設定</h1>
          <Button variant="primary" onClick={handleSave} loading={saving}>
            <Save className="w-4 h-4 mr-2" />
            儲存設定
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card padding="none">
            <div className="p-4 border-b border-gray-200 flex items-center gap-2">
              <Store className="w-5 h-5 text-pink-400" />
              <h2 className="font-semibold text-gray-900">商店資訊</h2>
            </div>
            <div className="p-4 space-y-4">
              <Input
                label="商店名稱"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="輸入商店名稱"
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-900">商店描述</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="簡單描述您的商店"
                  rows={3}
                  className={cn(
                    'w-full px-3 py-2 rounded-md border border-gray-200 bg-white',
                    'text-gray-900 placeholder:text-gray-400',
                    'transition-all duration-150 resize-none',
                    'focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20'
                  )}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-900">商店標誌</label>
                <div className="flex items-center gap-4">
                  {logo && (
                    <img src={logo} alt="商店標誌" className="w-16 h-16 rounded-full object-cover border border-gray-200" />
                  )}
                  <label className="flex-1 border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center gap-1 hover:border-pink-400 transition-colors cursor-pointer">
                    {uploading ? (
                      <Loader2 className="w-6 h-6 text-pink-400 animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6 text-gray-400" />
                    )}
                    <p className="text-xs text-gray-500">{uploading ? '上傳中...' : '點擊上傳圖片'}</p>
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
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
                          const snapshot = await uploadBytesResumable(ref(storage, path), file);
                          const url = await getDownloadURL(snapshot.ref);
                          setLogo(url);
                        }
                      } catch {}
                      setUploading(false);
                    }} />
                  </label>
                </div>
              </div>
            </div>
          </Card>

          <Card padding="none">
            <div className="p-4 border-b border-gray-200 flex items-center gap-2">
              <Store className="w-5 h-5 text-pink-400" />
              <h2 className="font-semibold text-gray-900">聯絡資訊</h2>
            </div>
            <div className="p-4 space-y-4">
              <Input
                label="電子郵件"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@example.com"
              />
              <Input
                label="聯絡電話"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="02-XXXX-XXXX"
              />
            </div>
          </Card>

          <Card padding="none">
            <div className="p-4 border-b border-gray-200 flex items-center gap-2">
              <Truck className="w-5 h-5 text-pink-400" />
              <h2 className="font-semibold text-gray-900">物流設定</h2>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-900 mb-3 block">配送方式</label>
                <div className="space-y-2">
                  {shippingMethods.map((method) => (
                    <label
                      key={method.id}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-md border transition-all cursor-pointer',
                        selectedShipping.includes(method.id)
                          ? 'border-pink-400 bg-pink-50'
                          : 'border-gray-200 hover:border-pink-400/50'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selectedShipping.includes(method.id)}
                        onChange={() => toggleShipping(method.id)}
                        className="w-4 h-4 rounded border-gray-200 text-pink-400 focus:ring-pink-400"
                      />
                      <span className="text-sm text-gray-900">{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Input
                label="基本運費"
                type="number"
                value={baseFee}
                onChange={(e) => setBaseFee(e.target.value)}
                placeholder="60"
              />
            </div>
          </Card>

          <Card padding="none">
            <div className="p-4 border-b border-gray-200 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-pink-400" />
              <h2 className="font-semibold text-gray-900">收款設定</h2>
            </div>
            <div className="p-4 space-y-4">
              <Input
                label="銀行名稱"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="銀行名稱"
              />
              <Input
                label="帳戶號碼"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="XXXX-XXXX-XXXX-XXXX"
              />
            </div>
          </Card>
        </div>
      </div>
    </MerchantLayout>
  );
}