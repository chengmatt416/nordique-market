'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, Badge, Button, Modal } from '@/components/ui';
import { formatDate, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { MessageSquare, Search, Eye, Mail, User, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: { _seconds: number } | string;
}

export default function AdminMessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  async function getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (user) {
      const token = await user.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async function fetchMessages() {
    try {
      setLoading(true);
      setError(null);
      const headers = await getAuthHeaders();
      const res = await fetch('/api/contact', { headers });
      if (!res.ok) {
        if (res.status === 503) { setError('firebase_not_configured'); return; }
        throw new Error('無法載入');
      }
      const data = await res.json();
      setMessages(data.messages || []);
    } catch {
      setError('載入失敗');
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: string) {
    setUpdating(true);
    try {
      await fetch('/api/contact', {
        method: 'PUT',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ id, status: 'read' }),
      });
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'read' } : m));
    } catch {}
    setUpdating(false);
  }

  const filtered = messages.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  const getTs = (ts: { _seconds: number } | string | undefined): string => {
    if (!ts) return '-';
    if (typeof ts === 'string') return formatDate(ts);
    return formatDate(new Date(ts._seconds * 1000));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="ml-3 text-gray-600">載入中...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error === 'firebase_not_configured') {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Firebase 尚未設定</h2>
          <p className="text-gray-600">請先完成 Firebase 設定以接收客服訊息</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">客服訊息</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600">{unreadCount} 封未讀</p>
              )}
            </div>
          </div>
          <Badge variant={unreadCount > 0 ? 'warning' : 'success'}>
            {unreadCount > 0 ? `${unreadCount} 封未讀` : '全部已讀'}
          </Badge>
        </div>

        <Card padding="lg">
          <div className="space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input
                type="text"
                placeholder="搜尋姓名、信箱或主旨..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded border border-gray-200 bg-white text-sm focus:outline-none focus:border-indigo-600"
              />
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>尚無客服訊息</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      'flex items-start gap-4 p-4 rounded-lg border transition-colors cursor-pointer',
                      msg.status === 'unread'
                        ? 'bg-indigo-50 border-indigo-200'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    )}
                    onClick={() => {
                      setSelectedMessage(msg);
                      setShowDetailModal(true);
                      if (msg.status === 'unread') markAsRead(msg.id);
                    }}
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                      msg.status === 'unread' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                    )}>
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn('text-sm', msg.status === 'unread' ? 'font-semibold text-gray-900' : 'font-medium text-gray-900')}>
                          {msg.name}
                        </span>
                        {msg.status === 'unread' && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600" />
                        )}
                      </div>
                      <p className={cn('text-sm mt-0.5 truncate', msg.status === 'unread' ? 'font-medium text-gray-900' : 'text-gray-600')}>
                        {msg.subject}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{getTs(msg.createdAt)}</p>
                    </div>
                    <Eye className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="訊息內容" size="lg">
        {selectedMessage && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Badge variant={selectedMessage.status === 'unread' ? 'warning' : selectedMessage.status === 'replied' ? 'success' : 'default'}>
                {selectedMessage.status === 'unread' ? '未讀' : selectedMessage.status === 'read' ? '已讀' : '已回覆'}
              </Badge>
              <span className="text-sm text-gray-400">{getTs(selectedMessage.createdAt)}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">姓名</p>
                <p className="font-medium text-gray-900">{selectedMessage.name}</p>
              </div>
              <div>
                <p className="text-gray-500">電子郵件</p>
                <p className="font-medium text-gray-900">{selectedMessage.email}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">主旨</p>
              <p className="font-medium text-gray-900">{selectedMessage.subject}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">訊息內容</p>
              <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-gray-900 leading-relaxed">
                {selectedMessage.message}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                <Mail className="w-4 h-4" />
                回覆郵件
              </a>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
