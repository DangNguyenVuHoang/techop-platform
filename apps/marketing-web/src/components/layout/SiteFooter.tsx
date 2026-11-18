import Link from "next/link";
import { FOOTER_LINK_GROUPS } from "@/config/site";

interface SiteFooterProps {
  siteName: string;
}

export function SiteFooter({ siteName }: SiteFooterProps) {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="text-base font-bold tracking-tight text-white">{siteName}</p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-400">
              Nền tảng công nghệ và giải pháp số TECHOP. Khung giao diện Marketing Web đang ở giai
              đoạn Foundation (C.5).
            </p>
          </div>

          {FOOTER_LINK_GROUPS.map((group) => (
            <div key={group.title}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {group.title}
              </h2>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-300 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-xs text-slate-500">
          {siteName} Platform · Checkpoint C.5 Foundation
        </div>
      </div>
    </footer>
  );
}
