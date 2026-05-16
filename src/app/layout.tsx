import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { BrandConfig } from "@/config/brand";

export const metadata: Metadata = {
  title: BrandConfig.name,
  description: BrandConfig.tagline,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className="min-h-screen antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}