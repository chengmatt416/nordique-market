'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, Badge, Button, Modal } from '@/components/ui';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, MoreVertical, Eye, Loader2, AlertTriangle, Trash2, UserCog } from 'lucide-react';

type TabType = 'all' | 'customer' | 'merchant';

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role?: string;
}

const tabs: { key: TabType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'customer', label: '顧客' },
  { key: 'merchant', label: '商家' },
];

function getInitials(name: string): string {
  return name.slice(0, 2) || '?';
}

const roleColors: Record<string, string> = {
  customer: 'bg-blue-500',
  merchant: 'bg-pink-500',
  admin: 'bg-purple-500',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [newRole, setNewRole] = useState('customer');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/users');
      if (!res.ok) {
        if (res.status === 503) { setError('firebase_not_configured'); return; }
        throw new Error('無法載入');
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      setError('載入失敗');
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter((user) => {
    const role = user.role || 'customer';
    const matchesTab = activeTab === 'all' || role === activeTab;
    const name = (user.displayName || user.email || '').toLowerCase();
    const matchesSearch = name.includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const tabCounts = {
    all: users.length,
    customer: users.filter((u) => (u.role || 'customer') === 'customer').length,
    merchant: users.filter((u) => u.role === 'merchant').length,
  };

  async function changeRole(uid: string, role: string) {
    setUpdating(true);
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, role }),
      });
      setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, role } : u)));
      if (selectedUser?.uid === uid) setSelectedUser({ ...selectedUser, role });
      setRoleModalOpen(false);
    } catch {}
    setUpdating(false);
  }

  async function deleteUser(uid: string) {
    setUpdating(true);
    try {
      await fetch(`/api/users?uid=${uid}`, { method: 'DELETE' });
      setUsers((prev) => prev.filter((u) => u.uid !== uid));
      setDeleteModalOpen(false);
      setSelectedUser(null);
    } catch {}
    setUpdating(false);
  }

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
          <p className="text-gray-600">請先完成 Firebase 設定以管理用戶</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-gray-900 font-medium mb-2">載入失敗</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchUsers}>重試</Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">用戶管理</h1>
            <p className="text-sm text-gray-600 mt-1">管理所有註冊用戶與商家</p>
          </div>
        </div>

        <Card padding="none">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-lg">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      'px-4 py-2 text-sm font-medium rounded-md transition-all duration-150',
                      activeTab === tab.key
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    {tab.label}
                    <span className={cn('ml-1.5 text-xs px-1.5 py-0.5 rounded-full', activeTab === tab.key ? 'bg-indigo-600/10 text-indigo-600' : 'bg-gray-200')}>
                      {tabCounts[tab.key]}
                    </span>
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜尋名稱或電子郵件..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 h-10 pl-10 pr-4 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">用戶</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">電子郵件</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">角色</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">UID</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredUsers.map((user) => {
                    const role = user.role || 'customer';
                    return (
                      <motion.tr
                        key={user.uid}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium', roleColors[role] || 'bg-gray-500')}>
                              {user.photoURL ? (
                                <img src={user.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
                              ) : (
                                getInitials(user.displayName || user.email)
                              )}
                            </div>
                            <span className="font-medium text-gray-900">{user.displayName || '未設定'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                        <td className="py-3 px-4">
                          <Badge variant={role === 'merchant' ? 'accent' : role === 'admin' ? 'warning' : 'default'}>
                            {role === 'customer' ? '顧客' : role === 'merchant' ? '商家' : '管理員'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-400 font-mono">{user.uid.slice(0, 12)}...</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end relative">
                            <button
                              onClick={() => setOpenDropdownId(openDropdownId === user.uid ? null : user.uid)}
                              className="p-1.5 rounded-md hover:bg-gray-50 transition-colors"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-600" />
                            </button>
                            <AnimatePresence>
                              {openDropdownId === user.uid && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-10"
                                >
                                  <button
                                    onClick={() => { setSelectedUser(user); setIsDetailModalOpen(true); setOpenDropdownId(null); }}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-900 hover:bg-gray-50"
                                  >
                                    <Eye className="w-4 h-4" /> 查看詳情
                                  </button>
                                  <button
                                    onClick={() => { setSelectedUser(user); setNewRole(user.role || 'customer'); setRoleModalOpen(true); setOpenDropdownId(null); }}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-900 hover:bg-gray-50"
                                  >
                                    <UserCog className="w-4 h-4" /> 變更角色
                                  </button>
                                  <button
                                    onClick={() => { setSelectedUser(user); setDeleteModalOpen(true); setOpenDropdownId(null); }}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                                  >
                                    <Trash2 className="w-4 h-4" /> 刪除用戶
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="py-12 text-center text-gray-600">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>找不到符合條件的用戶</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="用戶詳情" size="md">
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={cn('w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold', roleColors[selectedUser.role || 'customer'])}>
                {selectedUser.photoURL ? (
                  <img src={selectedUser.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(selectedUser.displayName || selectedUser.email)
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedUser.displayName || '未設定'}</h3>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
                <Badge variant={selectedUser.role === 'merchant' ? 'accent' : selectedUser.role === 'admin' ? 'warning' : 'default'} className="mt-1">
                  {selectedUser.role === 'customer' ? '顧客' : selectedUser.role === 'merchant' ? '商家' : '管理員'}
                </Badge>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600">UID</p>
              <p className="text-sm font-mono text-gray-900 break-all">{selectedUser.uid}</p>
            </div>
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button variant="outline" className="flex-1" onClick={() => { setNewRole(selectedUser.role || 'customer'); setRoleModalOpen(true); }}>
                <UserCog className="w-4 h-4 mr-1" /> 變更角色
              </Button>
              <Button className="flex-1 bg-red-500 hover:bg-red-600" onClick={() => { setDeleteModalOpen(true); }}>
                <Trash2 className="w-4 h-4 mr-1" /> 刪除用戶
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={roleModalOpen} onClose={() => setRoleModalOpen(false)} title="變更角色" size="sm">
        {selectedUser && (
          <div className="space-y-4">
            <p className="text-gray-600">
              變更 <span className="font-medium text-gray-900">{selectedUser.displayName || selectedUser.email}</span> 的角色：
            </p>
            <div className="space-y-2">
              {[
                { value: 'customer', label: '顧客' },
                { value: 'merchant', label: '商家' },
                { value: 'admin', label: '管理員' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="role" value={opt.value} checked={newRole === opt.value}
                    onChange={() => setNewRole(opt.value)} className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm text-gray-900">{opt.label}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setRoleModalOpen(false)}>取消</Button>
              <Button onClick={() => changeRole(selectedUser.uid, newRole)} loading={updating}>確認</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="刪除用戶" size="sm">
        {selectedUser && (
          <div className="space-y-4">
            <p className="text-gray-600">
              確定要刪除用戶「<span className="font-medium text-gray-900">{selectedUser.displayName || selectedUser.email}</span>」嗎？此操作無法復原。
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>取消</Button>
              <Button onClick={() => deleteUser(selectedUser.uid)} loading={updating} className="bg-red-500 hover:bg-red-600">確認刪除</Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
