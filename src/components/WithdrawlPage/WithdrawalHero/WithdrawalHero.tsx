import { Filter, Plus, TrendingDown } from "lucide-react";

interface WithdrawalHeroProps {
  totalBalance: number;
  activeFiltersCount: number;
  onOpenFilters: () => void;
  onNewWithdrawal: () => void;
}

export const WithdrawalHero = ({
  totalBalance,
  activeFiltersCount,
  onOpenFilters,
  onNewWithdrawal,
}: WithdrawalHeroProps) => {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-5 sm:pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-700 dark:text-rose-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
          Payouts
        </div>
        <h1 className="mt-2 flex items-center gap-2.5 text-2xl font-bold text-heading sm:text-3xl">
          <TrendingDown className="h-6 w-6 text-rose-700 dark:text-rose-300 sm:h-7 sm:w-7" />
          Withdrawals
        </h1>
        <p className="mt-1.5 max-w-xl text-sm text-subtle">
          Track outgoing requests, filter your withdrawal history, and submit a
          new payout request.
        </p>

        <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5">
          <span className="text-[11px] uppercase tracking-[0.14em] text-subtle">
            Available balance
          </span>
          <span className="text-sm font-semibold text-heading">
            ${totalBalance.toLocaleString("en-US")}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row" data-tour-anchor="withdrawal-actions">
        <button
          onClick={onOpenFilters}
          data-voice-target="withdrawal filters"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface-strong/[0.03] px-4 py-2.5 text-sm font-semibold text-heading transition-colors hover:bg-surface-strong/[0.06]"
        >
          <Filter className="h-4 w-4" />
          Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </button>
        <button
          onClick={onNewWithdrawal}
          data-voice-target="withdraw funds"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-500 px-5 py-2.5 text-sm font-semibold text-heading shadow-sm transition-colors hover:bg-rose-400"
        >
          <Plus className="h-4 w-4" />
          Withdraw Funds
        </button>
      </div>
    </div>
  );
};
