import { Filter, Plus, Wallet } from "lucide-react";

interface DepositHeroProps {
  activeFiltersCount: number;
  isSubmitting: boolean;
  onOpenFilters: () => void;
  onNewDeposit: () => void;
}

export const DepositHero = ({
  activeFiltersCount,
  isSubmitting,
  onOpenFilters,
  onNewDeposit,
}: DepositHeroProps) => {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-5 sm:pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Funding
        </div>
        <h1 className="mt-2 flex items-center gap-2.5 text-2xl font-bold text-heading sm:text-3xl">
          <Wallet className="h-6 w-6 text-accent sm:h-7 sm:w-7" />
          Deposits
        </h1>
        <p className="mt-1.5 max-w-xl text-sm text-subtle">
          Review funding requests, filter your deposit history, and submit a new
          deposit request.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row" data-tour-anchor="deposit-actions">
        <button
          onClick={onOpenFilters}
          data-voice-target="deposit filters"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface-strong/[0.03] px-4 py-2.5 text-sm font-semibold text-heading transition-colors hover:bg-surface-strong/[0.06]"
        >
          <Filter className="h-4 w-4" />
          Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </button>
        <button
          onClick={onNewDeposit}
          disabled={isSubmitting}
          data-voice-target="new deposit"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          {isSubmitting ? "Processing..." : "New Deposit"}
        </button>
      </div>
    </div>
  );
};
