import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/ui/ModulePlaceholder";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <ModulePlaceholder
      title="System & Integration Settings"
      description="Module cấu hình hệ thống, Source Keys tích hợp đa kênh và giám sát hạ tầng chưa được triển khai."
      plannedPhase="Phases 1–4"
      routePath="/settings"
    />
  );
}
