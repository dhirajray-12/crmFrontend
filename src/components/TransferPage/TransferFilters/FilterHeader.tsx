import { SlidersHorizontal } from "lucide-react";

interface FilterHeaderProps {
  activeFiltersCount: number;
  onClearAll: () => void;
}

export const FilterHeader = ({ activeFiltersCount, onClearAll }: FilterHeaderProps) => {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/20 bg-accent/[0.10]">
          <SlidersHorizontal className="h-4 w-4 text-accent" />
        </div>
        <div>
          <h2 className="text-base font-bold text-heading">Filters</h2>
          <p className="text-xs uppercase tracking-[0.16em] text-subtle">
            {activeFiltersCount > 0
              ? `${activeFiltersCount} active`
              : "No active filters"}
          </p>
        </div>
      </div>
      {activeFiltersCount > 0 && (
        <button
          onClick={onClearAll}
          className="rounded-lg border border-border bg-surface-strong/[0.04] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-heading transition-colors hover:bg-surface-strong/[0.08]"
        >
          Clear All
        </button>
      )}
    </div>
  );
};
