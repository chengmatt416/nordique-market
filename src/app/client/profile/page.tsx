'use client';

import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import { User, Mail, Shield, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, role, signOut } = useAuth();

  return (
    <ClientLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">個人資料</h1>

        <Card padding="lg">
          <div className="flex items-center gap-4 mb-6">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                <User className="w-8 h-8 text-indigo-600" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{user?.displayName || '未設定'}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 font-medium mt-1 inline-block">
                {role === 'customer' ? '顧客' : role === 'merchant' ? '商家' : role === 'admin' ? '管理員' : '訪客'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">電子郵件</p>
                <p className="text-sm text-gray-900">{user?.email || '未設定'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Shield className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">角色</p>
                <p className="text-sm text-gray-900">
                  {role === 'customer' ? '顧客' : role === 'merchant' ? '商家' : role === 'admin' ? '管理員' : '訪客'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            {role === 'customer' && (
              <Link href="/auth/signin?redirect=/onboarding/merchant"
                className="block w-full text-center py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                成為商家
              </Link>
            )}
            {role === 'merchant' && (
              <Link href="/merchant/dashboard"
                className="block w-full text-center py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                前往商家後台
              </Link>
            )}
            {role === 'admin' && (
              <Link href="/admin/dashboard"
                className="block w-full text-center py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                前往管理後台
              </Link>
            )}
            <button onClick={() => { signOut(); window.location.href = '/'; }}
              className="flex items-center justify-center gap-2 w-full py-2.5 border border-gray-200 rounded-lg text-sm text-red-600 hover:bg-gray-50">
              <LogOut className="w-4 h-4" /> 登出
            </button>
          </div>
        </Card>
      </div>
    </ClientLayout>
  );
}
