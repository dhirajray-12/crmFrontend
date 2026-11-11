import type { FilterState } from "@/types/transfer.types";

interface ActiveFiltersSummaryProps {
  filters: FilterState;
}

export const ActiveFiltersSummary = ({
  filters,
}: ActiveFiltersSummaryProps) => {
  const hasActiveFilters =
    filters.accountTypes.length > 0 ||
    filters.statuses.length > 0 ||
    filters.dateFrom ||
    filters.dateTo;

  if (!hasActiveFilters) return null;

  return (
    <div className="space-y-1.5">
      <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-heading">
        Active Filters
      </h3>
      <div className="space-y-1 text-xs text-subtle">
        {filters.accountTypes.length > 0 && (
          <div>{filters.accountTypes.length} account type(s) selected</div>
        )}
        {filters.statuses.length > 0 && (
          <div>{filters.statuses.length} status(es) selected</div>
        )}
        {filters.dateFrom && <div>From: {filters.dateFrom}</div>}
        {filters.dateTo && <div>To: {filters.dateTo}</div>}
      </div>
    </div>
  );
};
