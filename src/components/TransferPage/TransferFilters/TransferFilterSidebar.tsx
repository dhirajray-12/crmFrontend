import type { FilterState, TransferFilterOption } from "@/types/transfer.types";
import { FilterHeader } from "./FilterHeader";
import { AccountTypeFilter } from "./AccountTypeFilter";
import { StatusFilter } from "./StatusFilter";
import { DateRangeFilter } from "./DateRangeFilter";
import { ActiveFiltersSummary } from "./ActiveFiltersSummary";

interface TransferFilterSidebarProps {
  activeFiltersCount: number;
  filters?: FilterState;
  accountTypeOptions?: TransferFilterOption[];
  statusOptions?: TransferFilterOption[];
  onToggleAccountType: (value: string) => void;
  onToggleStatus: (value: string) => void;
  onDateFromChange?: (date: string) => void;
  onDateToChange?: (date: string) => void;
  onClearAll: () => void;
  selectedAccountTypes?: string[];
  selectedStatuses?: string[];
  selectedDate?: Date | null;
  onDateChange?: (date: Date | null) => void;
  defaultAccountTypes?: TransferFilterOption[];
  defaultStatusOptions?: TransferFilterOption[];
}

export const TransferFilterSidebar = ({
  filters,
  activeFiltersCount,
  accountTypeOptions,
  statusOptions,
  onToggleAccountType,
  onToggleStatus,
  onDateFromChange,
  onDateToChange,
  onClearAll,
  selectedAccountTypes,
  selectedStatuses,
  selectedDate,
  onDateChange,
  defaultAccountTypes,
  defaultStatusOptions,
}: TransferFilterSidebarProps) => {
  const normalizedFilters: FilterState = filters ?? {
    accountTypes: selectedAccountTypes ?? [],
    statuses: selectedStatuses ?? [],
    dateFrom: selectedDate ? selectedDate.toISOString().split("T")[0] : "",
    dateTo: selectedDate ? selectedDate.toISOString().split("T")[0] : "",
  };

  const handleDateFromChange =
    onDateFromChange ??
    ((date: string) => {
      onDateChange?.(date ? new Date(date) : null);
    });

  const handleDateToChange =
    onDateToChange ??
    ((date: string) => {
      onDateChange?.(date ? new Date(date) : null);
    });

  return (
    <div className="space-y-3">
      <FilterHeader activeFiltersCount={activeFiltersCount} onClearAll={onClearAll} />

      <div className="rounded-lg border border-border bg-surface p-3">
        <AccountTypeFilter
          options={accountTypeOptions ?? defaultAccountTypes ?? []}
          selectedTypes={normalizedFilters.accountTypes}
          onToggle={onToggleAccountType}
        />
      </div>

      <div className="rounded-lg border border-border bg-surface p-3">
        <StatusFilter
          options={statusOptions ?? defaultStatusOptions ?? []}
          selectedStatuses={normalizedFilters.statuses}
          onToggle={onToggleStatus}
        />
      </div>

      <div className="rounded-lg border border-border bg-surface p-3">
        <DateRangeFilter
          dateFrom={normalizedFilters.dateFrom}
          dateTo={normalizedFilters.dateTo}
          onDateFromChange={handleDateFromChange}
          onDateToChange={handleDateToChange}
        />
      </div>

      <div className="rounded-lg border border-border bg-surface p-3">
        <ActiveFiltersSummary filters={normalizedFilters} />
      </div>
    </div>
  );
};
