import type { Metadata } from "next";
import { DUPLICATE_STATUSES, LEAD_STATUSES } from "@techop/shared";
import { ModulePlaceholder } from "@/components/ui/ModulePlaceholder";

export const metadata: Metadata = {
  title: "Leads",
};

export default function LeadsPage() {
  return (
    <ModulePlaceholder
      title="Leads Management"
      description="Module quản lý Leads (Strict Row-Level Access theo Sale, hàng đợi kiểm soát trùng lặp PENDING_REVIEW và Merge có kiểm soát) chưa được triển khai."
      plannedPhase="Phase 2"
      routePath="/leads"
      sharedContractLabel="Lead Statuses (@techop/shared)"
      sharedContractItems={[...LEAD_STATUSES, ...DUPLICATE_STATUSES]}
    />
  );
}
