import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getMarketingEnv } from "@/config/env";
import "./globals.css";

const { siteUrl, siteName } = getMarketingEnv();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — Nền tảng Công nghệ & Giải pháp Số`,
    template: `%s | ${siteName}`,
  },
  description:
    "Website chính thức của TECHOP. Khung nền tảng Marketing Web đang được chuẩn bị cho các phân hệ giới thiệu dịch vụ và nội dung.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" className="scroll-smooth">
      <body className="flex min-h-screen flex-col bg-white font-sans text-slate-900 antialiased">
        <SiteHeader siteName={siteName} />
        <div className="flex-1">{children}</div>
        <SiteFooter siteName={siteName} />
      </body>
    </html>
  );
}
