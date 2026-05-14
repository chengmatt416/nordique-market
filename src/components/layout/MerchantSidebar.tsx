"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  ChevronLeft,
  Store,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BrandConfig } from "@/config/brand";

interface MerchantSidebarProps {
  className?: string;
}

const navItems = [
  { href: "/merchant/dashboard", icon: LayoutDashboard, label: "儀表板" },
  { href: "/merchant/products", icon: Package, label: "商品管理" },
  { href: "/merchant/orders", icon: ShoppingCart, label: "訂單管理" },
  { href: "/merchant/analytics", icon: BarChart3, label: "數據分析" },
  { href: "/merchant/settings", icon: Settings, label: "商店設定" },
];

export function MerchantSidebar({ className }: MerchantSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-[var(--surface)] border-r border-[var(--border)] transition-all duration-300 z-40",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex flex-col h-full">
        <div
          className={cn(
            "flex items-center h-16 px-4 border-b border-[var(--border)]",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          {!collapsed && (
            <Link href="/merchant/dashboard" className="flex items-center gap-2">
              <Store className="w-6 h-6 text-[var(--accent)]" />
              <span className="text-lg font-bold text-[var(--primary)]">
                {BrandConfig.name}
              </span>
            </Link>
          )}
          {collapsed && <Store className="w-6 h-6 text-[var(--accent)]" />}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/merchant/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-[var(--accent)] text-[var(--primary)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--secondary)] hover:text-[var(--primary)]",
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

        <div className="px-3 py-4 border-t border-[var(--border)]">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-[var(--text-secondary)] hover:bg-[var(--secondary)] hover:text-[var(--primary)] transition-all duration-200",
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