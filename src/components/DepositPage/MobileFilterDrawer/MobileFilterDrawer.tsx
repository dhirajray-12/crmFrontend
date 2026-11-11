import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import type { FilterState } from "@/types/depositePage.types";
import { FilterHeader } from "../FilterSidebar/FilterHeader";
import { AccountTypeFilter } from "../FilterSidebar/AccountTypeFilter";
import { StatusFilter } from "../FilterSidebar/StatusFilter";
import { DateRangeFilter } from "../FilterSidebar/DateRangeFilter";
import { ActiveFilters } from "../FilterSidebar/ActiveFilters";

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  activeFiltersCount: number;
  onToggleAccountType: (typeId: string) => void;
  onToggleStatus: (statusId: string) => void;
  onUpdateDate: (field: "dateFrom" | "dateTo", value: string) => void;
  onClearAll: () => void;
  onClearCategory: (category: keyof FilterState) => void;
}

export const MobileFilterDrawer = ({
  isOpen,
  onClose,
  filters,
  activeFiltersCount,
  onToggleAccountType,
  onToggleStatus,
  onUpdateDate,
  onClearAll,
  onClearCategory,
}: MobileFilterDrawerProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-999 bg-surface-strong"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-border bg-surface-strong p-4 shadow-2xl md:left-1/2 md:top-1/2 md:max-h-[74vh] md:w-full md:max-w-lg md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:border md:p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-heading">
                <SlidersHorizontal className="h-4 w-4 text-accent" />
                Filter deposits
              </div>
              <button
                onClick={onClose}
                className="rounded-lg border border-border p-1.5 text-subtle transition-colors hover:bg-surface-strong/[0.05] hover:text-heading"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative z-10 space-y-4 pt-4">
              <FilterHeader
                activeFiltersCount={activeFiltersCount}
                onClearAll={onClearAll}
              />

              <AccountTypeFilter
                selectedTypes={filters.accountTypes}
                onToggle={onToggleAccountType}
                onClear={() => onClearCategory("accountTypes")}
              />

              <StatusFilter
                selectedStatuses={filters.statuses}
                onToggle={onToggleStatus}
                onClear={() => onClearCategory("statuses")}
              />

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

              <ActiveFilters
                filters={filters}
                onRemoveAccountType={onToggleAccountType}
                onRemoveStatus={onToggleStatus}
                onRemoveDateFrom={() => onUpdateDate("dateFrom", "")}
                onRemoveDateTo={() => onUpdateDate("dateTo", "")}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
