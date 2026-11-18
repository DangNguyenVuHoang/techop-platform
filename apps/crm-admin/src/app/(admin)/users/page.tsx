import type { Metadata } from "next";
import { ROLE_IDS } from "@techop/shared";
import { ModulePlaceholder } from "@/components/ui/ModulePlaceholder";

export const metadata: Metadata = {
  title: "Users & Roles",
};

export default function UsersPage() {
  return (
    <ModulePlaceholder
      title="Users & Role-Based Access"
      description="Module quản lý tài khoản nhân sự nội bộ và phân quyền RBAC chưa được triển khai."
      plannedPhase="Phase 1"
      routePath="/users"
      sharedContractLabel="Role IDs (@techop/shared)"
      sharedContractItems={ROLE_IDS}
    />
  );
}
