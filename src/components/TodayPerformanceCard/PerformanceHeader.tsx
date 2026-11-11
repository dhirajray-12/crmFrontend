import { Activity } from "lucide-react";
import { FilterDropdown } from "./FilterDropdown";
import { usePerformanceStore } from "@/Store/performanceStore";
import { SectionHeader } from "@/pages/ClientPage/DashboardComponents/ui/SectionHeader";

export const PerformanceHeader = () => {
  const { filter } = usePerformanceStore();

  return (
    <SectionHeader
      eyebrow="Session flow"
      icon={Activity}
      title={`${filter === "Today" ? "Today's" : filter} performance`}
      description="Deposits, withdrawals, transactions, and net flow for the selected window."
      action={<FilterDropdown />}
    />
  );
};
