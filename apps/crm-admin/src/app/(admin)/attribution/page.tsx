import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/ui/ModulePlaceholder";

export const metadata: Metadata = {
  title: "Attribution",
};

export default function AttributionPage() {
  return (
    <ModulePlaceholder
      title="Attribution & Campaigns"
      description="Module quản lý nguồn tiếp nhận (Lead Sources), chiến dịch UTM (Campaigns) và mô hình First Touch / Latest Touch chưa được triển khai."
      plannedPhase="Phase 2"
      routePath="/attribution"
    />
  );
}
