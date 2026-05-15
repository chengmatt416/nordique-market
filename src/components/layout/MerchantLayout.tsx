"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MerchantSidebar } from "./MerchantSidebar";

interface MerchantLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function MerchantLayout({ children, className }: MerchantLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <MerchantSidebar />

      <main
        className={cn(
          "transition-all duration-300 ml-64 pt-16 min-h-screen",
          className
        )}
      >
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}