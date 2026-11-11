import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import type { FilterState, FilterOptions } from "@/types/WithdrawalPage.types";
import { FilterSidebar } from "../FilterSidebar/FilterSidebar";

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  activeFiltersCount: number;
  accountTypeOptions: FilterOptions[];
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
  accountTypeOptions,
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
                <SlidersHorizontal className="h-4 w-4 text-rose-700 dark:text-rose-300" />
                Filter withdrawals
              </div>
              <button
                onClick={onClose}
                className="rounded-lg border border-border p-1.5 text-subtle transition-colors hover:bg-surface-strong/[0.05] hover:text-heading"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative z-10 pt-4">
              <FilterSidebar
                filters={filters}
                activeFiltersCount={activeFiltersCount}
                accountTypeOptions={accountTypeOptions}
                onToggleAccountType={onToggleAccountType}
                onToggleStatus={onToggleStatus}
                onUpdateDate={onUpdateDate}
                onClearAll={onClearAll}
                onClearCategory={onClearCategory}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
