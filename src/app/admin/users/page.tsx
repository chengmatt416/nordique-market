'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, Badge, Button, Input, Modal } from '@/components/ui';
import { formatDate, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, MoreVertical, UserX, UserCheck, Eye } from 'lucide-react';

type Role = '顧客' | '商家';
type Status = '正常' | '停權';
type TabType = '全部' | '顧客' | '商家';

interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: Status;
  joinDate: string;
  orders: number;
  totalSpent: number;
  avatarColor: string;
}

const users: User[] = [
  { id: 1, name: '王小明', email: 'wang.xiaoming@gmail.com', role: '顧客', status: '正常', joinDate: '2024-01-15', orders: 12, totalSpent: 45600, avatarColor: 'bg-blue-500' },
  { id: 2, name: '李佳怡', email: 'li.jiayi@yahoo.com.tw', role: '商家', status: '正常', joinDate: '2024-01-10', orders: 89, totalSpent: 0, avatarColor: 'bg-pink-500' },
  { id: 3, name: '張志偉', email: 'chang.chihwei@msn.com', role: '顧客', status: '正常', joinDate: '2024-01-08', orders: 5, totalSpent: 12800, avatarColor: 'bg-purple-500' },
  { id: 4, name: '陳雅惠', email: 'chen.yahui@pchome.com.tw', role: '商家', status: '停權', joinDate: '2024-01-05', orders: 34, totalSpent: 0, avatarColor: 'bg-rose-500' },
  { id: 5, name: '林建志', email: 'lin.jianzhi@gmail.com', role: '顧客', status: '正常', joinDate: '2024-01-03', orders: 23, totalSpent: 78900, avatarColor: 'bg-emerald-500' },
  { id: 6, name: '黃怡君', email: 'huang.yijun@hotmail.com', role: '顧客', status: '停權', joinDate: '2023-12-28', orders: 8, totalSpent: 24500, avatarColor: 'bg-amber-500' },
  { id: 7, name: '周杰倫', email: 'zhou.jielun@gmail.com', role: '商家', status: '正常', joinDate: '2023-12-20', orders: 156, totalSpent: 0, avatarColor: 'bg-cyan-500' },
  { id: 8, name: '吳淑芬', email: 'wu.shufen@yahoo.com.tw', role: '顧客', status: '正常', joinDate: '2023-12-15', orders: 3, totalSpent: 5600, avatarColor: 'bg-indigo-500' },
  { id: 9, name: '孫大偉', email: 'sun.dawei@gmail.com', role: '顧客', status: '正常', joinDate: '2023-12-10', orders: 17, totalSpent: 42300, avatarColor: 'bg-teal-500' },
  { id: 10, name: '曾雅琪', email: 'zeng.yaqi@livemail.com', role: '商家', status: '正常', joinDate: '2023-12-05', orders: 67, totalSpent: 0, avatarColor: 'bg-violet-500' },
];

function getInitials(name: string): string {
  return name.slice(0, 2);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<TabType>('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  const filteredUsers = users.filter((user) => {
    const matchesTab = activeTab === '全部' || user.role === activeTab;
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const tabCounts: Record<TabType, number> = {
    '全部': users.length,
    '顧客': users.filter((u) => u.role === '顧客').length,
    '商家': users.filter((u) => u.role === '商家').length,
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
    setOpenDropdownId(null);
  };

  const handleToggleStatus = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      user.status = user.status === '正常' ? '停權' : '正常';
    }
    setOpenDropdownId(null);
  };

  const getRoleBadgeVariant = (role: Role) => {
    return role === '顧客' ? 'default' : 'accent';
  };

  const getStatusBadgeVariant = (status: Status) => {
    return status === '正常' ? 'success' : 'error';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">用戶管理</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">管理所有註冊用戶與商家</p>
          </div>
        </div>

        <Card padding="none">
          <div className="p-4 border-b border-[var(--border)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-1 p-1 bg-[var(--secondary)] rounded-lg">
                {(['全部', '顧客', '商家'] as TabType[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'px-4 py-2 text-sm font-medium rounded-md transition-all duration-150',
                      activeTab === tab
                        ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    )}
                  >
                    {tab}
                    <Badge variant={activeTab === tab ? 'default' : 'default'} className="ml-2">
                      {tabCounts[tab]}
                    </Badge>
                  </button>
                ))}
              </div>
              <div className="w-full sm:w-72">
                <Input
                  placeholder="搜尋用戶名稱或電子郵件..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<Search className="w-4 h-4" />}
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    用戶
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    角色
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    狀態
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    加入日期
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[var(--secondary)]/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white font-medium', user.avatarColor)}>
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{user.name}</p>
                          <p className="text-sm text-[var(--text-secondary)]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={getStatusBadgeVariant(user.status)}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-sm text-[var(--text-secondary)]">
                      {formatDate(user.joinDate)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === user.id ? null : user.id)}
                          className="p-2 rounded-lg hover:bg-[var(--secondary)] transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-[var(--text-secondary)]" />
                        </button>
                        <AnimatePresence>
                          {openDropdownId === user.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -5 }}
                              transition={{ duration: 0.1 }}
                              className="absolute right-0 mt-1 w-40 bg-[var(--surface)] rounded-lg shadow-lg border border-[var(--border)] py-1 z-10"
                            >
                              <button
                                onClick={() => handleViewDetails(user)}
                                className="w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--secondary)] flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                查看詳情
                              </button>
                              <button
                                onClick={() => handleToggleStatus(user.id)}
                                className="w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--secondary)] flex items-center gap-2"
                              >
                                {user.status === '正常' ? (
                                  <>
                                    <UserX className="w-4 h-4" />
                                    停權用戶
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-4 h-4" />
                                    啟任用戶
                                  </>
                                )}
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
              <p className="text-[var(--text-secondary)]">找不到符合條件的用戶</p>
            </div>
          )}

          <div className="p-4 border-t border-[var(--border)]">
            <p className="text-sm text-[var(--text-secondary)]">
              顯示 {filteredUsers.length} 筆結果，共 {users.length} 位用戶
            </p>
          </div>
        </Card>

        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="用戶詳情"
          size="lg"
        >
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className={cn('w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-medium', selectedUser.avatarColor)}>
                  {getInitials(selectedUser.name)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">{selectedUser.name}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[var(--secondary)] rounded-lg">
                  <p className="text-sm text-[var(--text-secondary)]">角色</p>
                  <Badge variant={getRoleBadgeVariant(selectedUser.role)} className="mt-1">
                    {selectedUser.role}
                  </Badge>
                </div>
                <div className="p-4 bg-[var(--secondary)] rounded-lg">
                  <p className="text-sm text-[var(--text-secondary)]">狀態</p>
                  <Badge variant={getStatusBadgeVariant(selectedUser.status)} className="mt-1">
                    {selectedUser.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[var(--secondary)] rounded-lg">
                  <p className="text-sm text-[var(--text-secondary)]">訂單數量</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{selectedUser.orders}</p>
                </div>
                <div className="p-4 bg-[var(--secondary)] rounded-lg">
                  <p className="text-sm text-[var(--text-secondary)]">消費金額</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                    {selectedUser.role === '顧客' ? formatCurrency(selectedUser.totalSpent) : '-'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-[var(--secondary)] rounded-lg">
                <p className="text-sm text-[var(--text-secondary)]">加入日期</p>
                <p className="text-base font-medium text-[var(--text-primary)] mt-1">
                  {formatDate(selectedUser.joinDate)}
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--border)]">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsDetailModalOpen(false)}
                >
                  關閉
                </Button>
                <Button
                  variant={selectedUser.status === '正常' ? 'secondary' : 'primary'}
                  className="flex-1"
                  onClick={() => {
                    handleToggleStatus(selectedUser.id);
                    setSelectedUser(
                      users.find((u) => u.id === selectedUser.id) || null
                    );
                  }}
                >
                  {selectedUser.status === '正常' ? '停權用戶' : '啟任用戶'}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}