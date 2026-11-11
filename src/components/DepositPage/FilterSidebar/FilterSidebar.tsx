import type { FilterState } from "@/types/depositePage.types";
import { FilterHeader } from "./FilterHeader";
import { AccountTypeFilter } from "./AccountTypeFilter";
import { StatusFilter } from "./StatusFilter";
import { DateRangeFilter } from "./DateRangeFilter";
import { ActiveFilters } from "./ActiveFilters";

interface FilterSidebarProps {
  filters: FilterState;
  activeFiltersCount: number;
  onToggleAccountType: (typeId: string) => void;
  onToggleStatus: (statusId: string) => void;
  onUpdateDate: (field: "dateFrom" | "dateTo", value: string) => void;
  onClearAll: () => void;
  onClearCategory: (category: keyof FilterState) => void;
}

export const FilterSidebar = ({
  filters,
  activeFiltersCount,
  onToggleAccountType,
  onToggleStatus,
  onUpdateDate,
  onClearAll,
  onClearCategory,
}: FilterSidebarProps) => {
  return (
    <div className="client-theme-surface relative overflow-hidden rounded-[30px] border border-border shadow-2xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--accent-soft),transparent_22%),radial-gradient(circle_at_bottom_right,var(--accent-soft),transparent_22%)]" />

      <div className="relative z-10 space-y-6 p-6">
        <FilterHeader
          activeFiltersCount={activeFiltersCount}
          onClearAll={onClearAll}
        />

        <div className="rounded-[26px] border border-border bg-surface p-4">
          <AccountTypeFilter
            selectedTypes={filters.accountTypes}
            onToggle={onToggleAccountType}
            onClear={() => onClearCategory("accountTypes")}
          />
        </div>

        <div className="rounded-[26px] border border-border bg-surface p-4">
          <StatusFilter
            selectedStatuses={filters.statuses}
            onToggle={onToggleStatus}
            onClear={() => onClearCategory("statuses")}
          />
        </div>

        <div className="rounded-[26px] border border-border bg-surface p-4">
          <DateRangeFilter
            dateFrom={filters.dateFrom}
            dateTo={filters.dateTo}
            onDateFromChange={(date) => onUpdateDate("dateFrom", date)}
            onDateToChange={(date) => onUpdateDate("dateTo", date)}
            onClear={() => {
              onClearCategory("dateFrom");
              onClearCategory("dateTo");
            }}
            hasActiveFilter={!!filters.dateFrom || !!filters.dateTo}
          />
        </div>

        <div className="rounded-[26px] border border-border bg-surface p-4">
          <ActiveFilters
            filters={filters}
            onRemoveAccountType={onToggleAccountType}
            onRemoveStatus={onToggleStatus}
            onRemoveDateFrom={() => onUpdateDate("dateFrom", "")}
            onRemoveDateTo={() => onUpdateDate("dateTo", "")}
          />
        </div>
      </div>
    </div>
  );
};
