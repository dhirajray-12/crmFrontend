// components/Withdrawals/WithdrawalHistory.tsx
import React from "react";
import { Clock } from "lucide-react";
import type {
  Withdrawal,
  WithdrawalFilterStatus,
} from "@/types/PartnerDasboard.types";
import { WithdrawalFilters } from "./WithdrawalFilters";
import { WithdrawalItem } from "./WithdrawalItem";

interface WithdrawalHistoryProps {
  withdrawals: Withdrawal[];
  filterStatus: WithdrawalFilterStatus;
  onFilterChange: (status: WithdrawalFilterStatus) => void;
}

export const WithdrawalHistory: React.FC<WithdrawalHistoryProps> = ({
  withdrawals,
  filterStatus,
  onFilterChange,
}) => {
  const filteredWithdrawals = withdrawals.filter((w) => {
    if (filterStatus === "all") return true;
    return w.status === filterStatus;
  });

  return (
    <div className="rounded-xl border border-border bg-surface p-4 sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-heading sm:text-xl">
          <Clock className="h-5 w-5 text-accent" />
          Withdrawal History
        </h2>
        <WithdrawalFilters
          currentFilter={filterStatus}
          onFilterChange={onFilterChange}
        />
      </div>

      {filteredWithdrawals.length === 0 ? (
        <div className="py-12 text-center">
          <Clock className="mx-auto mb-4 h-12 w-12 text-heading/20" />
          <p className="text-base font-medium text-heading/70">
            No withdrawals found
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredWithdrawals.map((withdrawal) => (
            <WithdrawalItem key={withdrawal._id} withdrawal={withdrawal} />
          ))}
        </div>
      )}
    </div>
  );
};
