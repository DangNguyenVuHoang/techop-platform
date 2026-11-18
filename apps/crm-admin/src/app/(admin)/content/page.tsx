import type { Metadata } from "next";
import { POST_STATUSES } from "@techop/shared";
import { ModulePlaceholder } from "@/components/ui/ModulePlaceholder";

export const metadata: Metadata = {
  title: "Content",
};

export default function ContentPage() {
  return (
    <ModulePlaceholder
      title="Content Management (CMS)"
      description="Module quản lý bài viết Blog, danh mục, thẻ và lịch xuất bản phục vụ Marketing Website (techop.vn) chưa được triển khai."
      plannedPhase="Phase 3"
      routePath="/content"
      sharedContractLabel="Post Statuses (@techop/shared)"
      sharedContractItems={POST_STATUSES}
    />
  );
}
