import { Download, Filter, History } from "lucide-react";

interface TransactionHeroProps {
  totalCount: number;
  activeFiltersCount?: number;
  onOpenFilters: () => void;
  onExport: () => void;
}

export const TransactionHero = ({
  totalCount,
  activeFiltersCount = 0,
  onOpenFilters,
  onExport,
}: TransactionHeroProps) => {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-5 sm:pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          Account ledger
        </div>
        <h1 className="mt-2 flex items-center gap-2.5 text-2xl font-bold text-heading sm:text-3xl">
          <History className="h-6 w-6 text-accent sm:h-7 sm:w-7" />
          Transaction History
        </h1>
        <p className="mt-1.5 max-w-xl text-sm text-subtle">
          Search, filter, and export every deposit, withdrawal, and transfer
          recorded on your accounts.
        </p>

        <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5">
          <span className="text-[11px] uppercase tracking-[0.14em] text-subtle">
            Visible records
          </span>
          <span className="text-sm font-semibold text-heading">{totalCount}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          onClick={onOpenFilters}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface-strong/[0.03] px-4 py-2.5 text-sm font-semibold text-heading transition-colors hover:bg-surface-strong/[0.06]"
        >
          <Filter className="h-4 w-4" />
          Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </button>
        <button
          onClick={onExport}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition-colors hover:bg-accent"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>
    </div>
  );
};
