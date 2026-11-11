// components/Withdrawals/WithdrawalFilters.tsx
import React from "react";
import type { WithdrawalFilterStatus } from "@/types/PartnerDasboard.types";

interface WithdrawalFiltersProps {
  currentFilter: WithdrawalFilterStatus;
  onFilterChange: (status: WithdrawalFilterStatus) => void;
}

const filters: { value: WithdrawalFilterStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
];

export const WithdrawalFilters: React.FC<WithdrawalFiltersProps> = ({
  currentFilter,
  onFilterChange,
}) => (
  <div className="flex flex-wrap gap-2">
    {filters.map((filter) => (
      <button
        key={filter.value}
        onClick={() => onFilterChange(filter.value)}
        className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
          currentFilter === filter.value
            ? "bg-accent/15 text-accent"
            : "border border-border bg-surface-strong/[0.04] text-subtle hover:bg-surface-strong/[0.08]"
        }`}
      >
        {filter.label}
      </button>
    ))}
  </div>
);
