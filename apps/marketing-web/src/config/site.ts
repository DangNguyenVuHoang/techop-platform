export interface SiteNavLink {
  href: string;
  label: string;
}

export const SITE_NAV_LINKS: readonly SiteNavLink[] = [
  { href: "/", label: "Trang chủ" },
  { href: "/#foundation", label: "Nền tảng" },
  { href: "/#capabilities", label: "Phân hệ" },
  { href: "/#contact-placeholder", label: "Liên hệ" },
] as const;

export const FOOTER_LINK_GROUPS: readonly {
  title: string;
  links: readonly SiteNavLink[];
}[] = [
  {
    title: "Điều hướng",
    links: [
      { href: "/", label: "Trang chủ" },
      { href: "/#foundation", label: "Kiến trúc nền tảng" },
      { href: "/#capabilities", label: "Phân hệ dự kiến" },
    ],
  },
  {
    title: "Hệ thống",
    links: [
      { href: "/robots.txt", label: "Robots.txt" },
      { href: "/sitemap.xml", label: "Sitemap.xml" },
      { href: "/#contact-placeholder", label: "Cổng liên hệ (Placeholder)" },
    ],
  },
] as const;
