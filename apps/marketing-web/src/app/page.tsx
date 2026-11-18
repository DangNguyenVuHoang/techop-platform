import Link from "next/link";
import { ArrowDown, Blocks, Globe, Layers } from "lucide-react";

const FOUNDATION_CAPABILITIES = [
  {
    title: "Giới thiệu & Dịch vụ",
    description:
      "Cấu trúc sẵn sàng cho các trang giới thiệu doanh nghiệp và danh mục giải pháp công nghệ TECHOP.",
    phase: "Phase 5 (Placeholder)",
    icon: Layers,
  },
  {
    title: "Nội dung & Blog SEO",
    description:
      "Khung tích hợp với Public CMS API để xuất bản bài viết chuyên môn và tối ưu cấu trúc tìm kiếm.",
    phase: "Phase 3–5 (Placeholder)",
    icon: Globe,
  },
  {
    title: "Tiếp nhận Tư vấn",
    description:
      "Điểm mở rộng cho luồng gửi yêu cầu tư vấn qua server proxy bảo mật trong giai đoạn tích hợp.",
    phase: "Phase 2–5 (Placeholder)",
    icon: Blocks,
  },
] as const;

export default function HomePage() {
  return (
    <main>
      <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800">
              TECHOP Platform · Checkpoint C.5 Foundation
            </span>
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Nền tảng Công nghệ &amp; Giải pháp Số cho Doanh nghiệp
            </h1>
            <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
              Đây là khung giao diện nền tảng (Marketing Web Foundation) của TECHOP. Các trang nội
              dung chi tiết, Blog và biểu mẫu tư vấn sẽ được kết nối tuần tự trong các giai đoạn
              triển khai tiếp theo.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="#capabilities"
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
              >
                Xem cấu trúc phân hệ
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="#foundation"
                className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Thông tin kiến trúc
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="capabilities" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Cấu trúc phân hệ dự kiến
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Các khu vực nội dung dưới đây là placeholder kiến trúc cho giai đoạn kế tiếp.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {FOUNDATION_CAPABILITIES.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-800">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="mt-4 text-xs font-medium text-slate-500">{item.phase}</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="foundation" className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                Kiến trúc tách biệt Marketing &amp; CRM
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Marketing Web vận hành như một ứng dụng Next.js App Router độc lập trong monorepo,
                tách biệt hoàn toàn khỏi CRM Admin và cơ sở dữ liệu nội bộ để đảm bảo hiệu năng SEO
                và an toàn hệ thống.
              </p>
            </div>
            <div
              id="contact-placeholder"
              className="rounded-xl border border-dashed border-slate-300 bg-white p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Contact Intake · Not Implemented
              </p>
              <h3 className="mt-2 text-base font-semibold text-slate-900">
                Cổng tiếp nhận tư vấn (Placeholder)
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Biểu mẫu liên hệ và kết nối Core API chưa được kích hoạt ở Checkpoint C.5.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
