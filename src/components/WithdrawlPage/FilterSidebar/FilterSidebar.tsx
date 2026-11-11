import type { FilterState, FilterOptions } from "@/types/WithdrawalPage.types";
import { FilterHeader } from "./FilterHeader";
import { AccountTypeFilter } from "./AccountTypeFilter";
import { StatusFilter } from "./StatusFilter";
import { DateRangeFilter } from "./DateRangeFilter";
import { ActiveFilters } from "./ActiveFilters";

interface FilterSidebarProps {
  filters: FilterState;
  activeFiltersCount: number;
  accountTypeOptions: FilterOptions[];
  onToggleAccountType: (typeId: string) => void;
  onToggleStatus: (statusId: string) => void;
  onUpdateDate: (field: "dateFrom" | "dateTo", value: string) => void;
  onClearAll: () => void;
  onClearCategory: (category: keyof FilterState) => void;
}

export const FilterSidebar = ({
  filters,
  activeFiltersCount,
  accountTypeOptions,
  onToggleAccountType,
  onToggleStatus,
  onUpdateDate,
  onClearAll,
  onClearCategory,
}: FilterSidebarProps) => {
  return (
    <div className="space-y-3">
      <FilterHeader
        activeFiltersCount={activeFiltersCount}
        onClearAll={onClearAll}
      />

      <div className="rounded-lg border border-border bg-surface p-3">
        <AccountTypeFilter
          options={accountTypeOptions}
          selectedTypes={filters.accountTypes}
          onToggle={onToggleAccountType}
          onClear={() => onClearCategory("accountTypes")}
        />
      </div>

      <div className="rounded-lg border border-border bg-surface p-3">
        <StatusFilter
          selectedStatuses={filters.statuses}
          onToggle={onToggleStatus}
          onClear={() => onClearCategory("statuses")}
        />
      </div>

      <div className="rounded-lg border border-border bg-surface p-3">
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

      <div className="rounded-lg border border-border bg-surface p-3">
        <ActiveFilters
          filters={filters}
          accountTypeOptions={accountTypeOptions}
          onRemoveAccountType={onToggleAccountType}
          onRemoveStatus={onToggleStatus}
          onRemoveDateFrom={() => onUpdateDate("dateFrom", "")}
          onRemoveDateTo={() => onUpdateDate("dateTo", "")}
        />
      </div>
    </div>
  );
};
