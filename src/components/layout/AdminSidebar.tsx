"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Store,
  Shield,
  Settings,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || '';

interface AdminSidebarProps {
  className?: string;
}

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "儀表板" },
  { href: "/admin/merchants", icon: Store, label: "商家管理" },
  { href: "/admin/users", icon: Users, label: "用戶管理" },
  { href: "/admin/products", icon: Package, label: "商品審核" },
  { href: "/admin/orders", icon: ShoppingCart, label: "訂單管理" },
  { href: "/admin/brand", icon: Settings, label: "品牌設定" },
];

export function AdminSidebar({ className }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-gray-900 text-white/70 transition-all duration-300 z-40",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex flex-col h-full">
        <div
          className={cn(
            "flex items-center h-16 px-4 border-b border-white/10",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          {!collapsed && (
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-pink-400" />
              <span className="text-lg font-bold text-white">{brandName}</span>
            </Link>
          )}
          {collapsed && <Shield className="w-6 h-6 text-pink-400" />}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200",
                  isActive
                    ? "bg-pink-400 text-gray-900"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                  collapsed && "justify-center px-0"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors duration-200",
              collapsed && "justify-center px-0"
            )}
          >
            <motion.div
              animate={{ rotate: collapsed ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.div>
            {!collapsed && <span className="text-sm">收合</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}