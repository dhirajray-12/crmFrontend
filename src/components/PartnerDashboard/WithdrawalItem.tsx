import React from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import type { Withdrawal } from "@/types/PartnerDasboard.types";
import { formatDate, formatCurrency } from "@/utils/PartnerDashboard.utils";

interface WithdrawalItemProps {
  withdrawal: Withdrawal;
}

const statusStyles: Record<string, { border: string; bg: string; text: string }> = {
  completed: {
    border: "border-emerald-400/20",
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  rejected: {
    border: "border-rose-400/20",
    bg: "bg-rose-500/10",
    text: "text-rose-700 dark:text-rose-300",
  },
  pending: {
    border: "border-amber-400/20",
    bg: "bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-300",
  },
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-5 w-5" />;
    case "rejected":
      return <XCircle className="h-5 w-5" />;
    default:
      return <Clock className="h-5 w-5" />;
  }
};

export const WithdrawalItem: React.FC<WithdrawalItemProps> = ({
  withdrawal,
}) => {
  const style = statusStyles[withdrawal.status] || statusStyles.pending;

  return (
    <div className="rounded-lg border border-border bg-surface-strong/[0.03] p-4 transition hover:bg-surface-strong/[0.05]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`rounded-lg border p-2.5 ${style.border} ${style.bg} ${style.text}`}>
            {getStatusIcon(withdrawal.status)}
          </div>
          <div className="min-w-0">
            <div className="text-xl font-bold text-heading">
              {formatCurrency(withdrawal.amount)}
            </div>
            <div className="text-sm text-subtle">
              {formatDate(withdrawal.createdAt)}
            </div>
            {withdrawal.bankName && (
              <div className="mt-1 text-xs text-subtle">
                Bank: {withdrawal.bankName} -{" "}
                {withdrawal.accountNumber?.slice(-4)}
              </div>
            )}
            {withdrawal.cryptoAddress && (
              <div className="mt-1 text-xs text-subtle">
                Crypto: {withdrawal.cryptoNetwork} -{" "}
                {withdrawal.cryptoAddress.slice(0, 10)}...
              </div>
            )}
          </div>
        </div>
        <div className={`shrink-0 rounded-lg border px-3 py-1.5 text-right ${style.border} ${style.bg}`}>
          <div className="text-[10px] uppercase tracking-[0.14em] text-subtle">
            Status
          </div>
          <div className={`text-sm font-bold capitalize ${style.text}`}>
            {withdrawal.status}
          </div>
        </div>
      </div>
    </div>
  );
};
