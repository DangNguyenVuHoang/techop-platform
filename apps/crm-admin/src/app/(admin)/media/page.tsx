import type { Metadata } from "next";
import { STORAGE_PROVIDERS } from "@techop/shared";
import { ModulePlaceholder } from "@/components/ui/ModulePlaceholder";

export const metadata: Metadata = {
  title: "Media",
};

export default function MediaPage() {
  return (
    <ModulePlaceholder
      title="Media Library"
      description="Module tải lên, tối ưu WebP và quản lý thư viện ảnh trên Cloudflare R2 / Local storage chưa được triển khai."
      plannedPhase="Phase 3"
      routePath="/media"
      sharedContractLabel="Storage Providers (@techop/shared)"
      sharedContractItems={STORAGE_PROVIDERS}
    />
  );
}
