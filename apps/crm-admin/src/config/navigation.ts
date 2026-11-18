export type NavIconKey =
  "dashboard" | "leads" | "activities" | "attribution" | "content" | "media" | "users" | "settings";

export interface AdminNavItem {
  href: string;
  label: string;
  description: string;
  icon: NavIconKey;
  plannedPhase: string;
}

export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Tổng quan hệ thống CRM & CMS tập trung.",
    icon: "dashboard",
    plannedPhase: "Phase 4",
  },
  {
    href: "/leads",
    label: "Leads",
    description: "Quản lý Lead Pipeline, kiểm soát trùng lặp và phân công Sale.",
    icon: "leads",
    plannedPhase: "Phase 2",
  },
  {
    href: "/activities",
    label: "Activities",
    description: "Lịch sử chăm sóc khách hàng, ghi chú và lịch hẹn Follow-up.",
    icon: "activities",
    plannedPhase: "Phase 2",
  },
  {
    href: "/attribution",
    label: "Attribution",
    description: "Nguồn tiếp nhận, chiến dịch Marketing và phân bổ đa chạm.",
    icon: "attribution",
    plannedPhase: "Phase 2",
  },
  {
    href: "/content",
    label: "Content",
    description: "Quản lý bài viết Blog, danh mục và thẻ SEO đa kênh.",
    icon: "content",
    plannedPhase: "Phase 3",
  },
  {
    href: "/media",
    label: "Media",
    description: "Thư viện hình ảnh và tài nguyên lưu trữ Cloudflare R2.",
    icon: "media",
    plannedPhase: "Phase 3",
  },
  {
    href: "/users",
    label: "Users & Roles",
    description: "Quản lý nhân sự nội bộ và phân quyền theo vai trò RBAC.",
    icon: "users",
    plannedPhase: "Phase 1",
  },
  {
    href: "/settings",
    label: "Settings",
    description: "Cấu hình hệ thống, Source Keys tích hợp và trạng thái hạ tầng.",
    icon: "settings",
    plannedPhase: "Phase 1–4",
  },
] as const;

export function getPageMeta(pathname: string): { title: string; subtitle: string } {
  if (pathname === "/") {
    return {
      title: "TECHOP Admin Workspace",
      subtitle: "C.4 Foundation — Sẵn sàng tích hợp Core API",
    };
  }

  const matched = ADMIN_NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  if (matched) {
    return {
      title: matched.label,
      subtitle: matched.description,
    };
  }

  return {
    title: "TECHOP Admin",
    subtitle: "Centralized CRM & CMS Platform",
  };
}
