import { AnimatePresence, motion } from "framer-motion";
import { Download, SlidersHorizontal, X } from "lucide-react";
import { FilterTypeButtons } from "./FilterTypeButtons";
import { MiniCalendar } from "../MiniCalendar/MiniCalendar";

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedType: string;
  onTypeSelect: (type: string) => void;
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  onExport: () => void;
}

export const MobileFilterDrawer = ({
  isOpen,
  onClose,
  selectedType,
  onTypeSelect,
  selectedDate,
  onDateSelect,
  onExport,
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
                Filter transactions
              </div>
              <button
                onClick={onClose}
                className="rounded-lg border border-border p-1.5 text-subtle transition-colors hover:bg-surface-strong/[0.05] hover:text-heading"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 pt-4">
              <div className="rounded-lg border border-border bg-surface p-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
                  Type
                </p>
                <FilterTypeButtons
                  selectedType={selectedType}
                  onSelect={onTypeSelect}
                  onClose={onClose}
                />
              </div>

              <div className="rounded-lg border border-border bg-surface p-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
                  Date
                </p>
                <MiniCalendar selectedDate={selectedDate} onSelect={onDateSelect} />
              </div>

              <button
                onClick={onExport}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition-colors hover:bg-accent"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
