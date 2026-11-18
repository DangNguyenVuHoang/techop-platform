import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getAppName } from "@/config/env";
import "./globals.css";

const appName = getAppName();

export const metadata: Metadata = {
  title: {
    default: appName,
    template: `%s | ${appName}`,
  },
  description: "TECHOP Centralized CRM & CMS Admin Portal",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body className="antialiased">{children}</body>
    </html>
  );
}
