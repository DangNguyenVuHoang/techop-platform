"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  Activity,
  FileText,
  GitBranch,
  Image as ImageIcon,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { ADMIN_NAV_ITEMS, type NavIconKey } from "@/config/navigation";

const NAV_ICONS: Record<NavIconKey, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  leads: Users,
  activities: Activity,
  attribution: GitBranch,
  content: FileText,
  media: ImageIcon,
  users: ShieldCheck,
  settings: Settings,
};

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ collapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (!mobileOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseMobile();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, onCloseMobile]);

  const isActive = (href: string) => {
    if (href === "/dashboard" && pathname === "/") return true;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const navContent = (isMobile: boolean) => {
    const isCollapsedDesktop = collapsed && !isMobile;

    return (
      <div className="flex h-full flex-col bg-slate-950 text-slate-100">
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
          <Link
            href="/"
            onClick={isMobile ? onCloseMobile : undefined}
            aria-label={isCollapsedDesktop ? "TECHOP CRM" : undefined}
            className="flex items-center gap-2.5 overflow-hidden"
          >
            <span
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white"
            >
              T
            </span>
            <span
              className={
                isCollapsedDesktop
                  ? "sr-only"
                  : "truncate text-sm font-semibold tracking-wide text-white"
              }
            >
              TECHOP CRM
            </span>
          </Link>

          {isMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Đóng menu điều hướng"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>

        <nav aria-label="Điều hướng chính" className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = NAV_ICONS[item.icon];
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={isMobile ? onCloseMobile : undefined}
                aria-current={active ? "page" : undefined}
                aria-label={isCollapsedDesktop ? item.label : undefined}
                title={isCollapsedDesktop ? item.label : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className={isCollapsedDesktop ? "sr-only" : "truncate"}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 px-4 py-3 text-xs text-slate-400">
          {!isCollapsedDesktop ? "Foundation C.4 · /api/v1" : "C.4"}
        </div>
      </div>
    );
  };

  return (
    <>
      <aside
        aria-label="Thanh điều hướng"
        className={`hidden shrink-0 border-r border-slate-800 transition-all duration-200 lg:block ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {navContent(false)}
      </aside>

      {mobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu điều hướng"
          className="fixed inset-0 z-50 flex lg:hidden"
        >
          <div
            className="fixed inset-0 bg-slate-950/60"
            aria-hidden="true"
            onClick={onCloseMobile}
          />
          <aside className="relative z-10 w-64 max-w-[80vw]">{navContent(true)}</aside>
        </div>
      )}
    </>
  );
}
