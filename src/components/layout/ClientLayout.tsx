"use client";

import { motion } from "framer-motion";
import { Home, Search, ShoppingCart, FileText, User } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ClientNav } from "./ClientNav";

interface ClientLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const bottomNavItems = [
  { href: "/client/home", icon: Home, label: "首頁" },
  { href: "/search", icon: Search, label: "搜尋" },
  { href: "/client/cart", icon: ShoppingCart, label: "購物車" },
  { href: "/client/orders", icon: FileText, label: "訂單" },
  { href: "/client/profile", icon: User, label: "我的" },
];

export function ClientLayout({ children, className }: ClientLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--secondary)]">
      <ClientNav />

      <main className={cn("pb-20 md:pb-8", className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--surface)] border-t border-[var(--border)] z-50">
        <div className="grid grid-cols-5 h-16">
          {bottomNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}