"use client";

import { usePathname } from "next/navigation";
import { Menu, PanelLeftClose, PanelLeftOpen, UserCircle2 } from "lucide-react";
import { getPageMeta } from "@/config/navigation";

interface HeaderProps {
  collapsed: boolean;
  onToggleDesktop: () => void;
  onOpenMobile: () => void;
}

export function Header({ collapsed, onToggleDesktop, onOpenMobile }: HeaderProps) {
  const pathname = usePathname();
  const meta = getPageMeta(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobile}
          aria-label="Mở menu điều hướng"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={onToggleDesktop}
          aria-label={collapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
          className="hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:inline-flex"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
            {meta.title}
          </h1>
          <p className="hidden truncate text-xs text-slate-500 sm:block">{meta.subtitle}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
        <UserCircle2 className="h-4 w-4 text-slate-500" />
        <span className="hidden sm:inline">Auth Pending (Phase 1)</span>
        <span className="sm:hidden">Guest</span>
      </div>
    </header>
  );
}
