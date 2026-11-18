import type { Metadata } from "next";
import { ACTIVITY_TYPES } from "@techop/shared";
import { ModulePlaceholder } from "@/components/ui/ModulePlaceholder";

export const metadata: Metadata = {
  title: "Activities",
};

export default function ActivitiesPage() {
  return (
    <ModulePlaceholder
      title="Lead Activities & Timeline"
      description="Module ghi nhận lịch sử chăm sóc (cuộc gọi, Zalo, Email, Meeting, Note và lịch hẹn Follow-up) chưa được triển khai."
      plannedPhase="Phase 2"
      routePath="/activities"
      sharedContractLabel="Activity Types (@techop/shared)"
      sharedContractItems={ACTIVITY_TYPES}
    />
  );
}
