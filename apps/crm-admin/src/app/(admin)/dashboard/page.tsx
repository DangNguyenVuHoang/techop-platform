import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/ui/ModulePlaceholder";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <ModulePlaceholder
      title="Dashboard"
      description="Module tổng quan Pipeline, tỷ lệ chuyển đổi theo nguồn/chiến dịch và cảnh báo Follow-up sẽ được triển khai sau khi hoàn tất Core API & CRM."
      plannedPhase="Phase 4"
      routePath="/dashboard"
    />
  );
}
