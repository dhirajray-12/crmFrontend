import type { Withdrawal } from "@/types/Ibwithdrawal.types";

interface WithdrawalSummaryProps {
  withdrawals: Withdrawal[];
}

export const WithdrawalSummary = ({ withdrawals }: WithdrawalSummaryProps) => {
  const completedCount = withdrawals.filter(
    (w) => w.status === "approved" || w.status === "completed",
  ).length;

  return (
    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
      <div className="rounded-lg border border-border bg-surface-strong/[0.03] px-3 py-2.5">
        <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">Total Transactions</p>
        <p className="mt-1 text-base font-semibold text-heading">{withdrawals.length}</p>
      </div>
      <div className="rounded-lg border border-border bg-surface-strong/[0.03] px-3 py-2.5">
        <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">Success Rate</p>
        <p className="mt-1 text-base font-semibold text-emerald-700 dark:text-emerald-300">
          {withdrawals.length > 0
            ? ((completedCount / withdrawals.length) * 100).toFixed(0)
            : 0}
          %
        </p>
      </div>
    </div>
  );
};
