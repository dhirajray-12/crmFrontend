import type { TransferFilterOption } from "@/types/transfer.types";

interface StatusFilterProps {
  options: TransferFilterOption[];
  selectedStatuses: string[];
  onToggle: (value: string) => void;
}

const STATUS_STYLES: Record<string, string> = {
  Completed: "border-emerald-400/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-200",
  Failed: "border-rose-400/30 bg-rose-500/15 text-rose-700 dark:text-rose-200",
  Pending: "border-amber-300/30 bg-amber-400/15 text-amber-700 dark:text-amber-200",
};

export const StatusFilter = ({
  options,
  selectedStatuses,
  onToggle,
}: StatusFilterProps) => {
  return (
    <div className="space-y-2.5">
      <label className="text-xs font-bold uppercase tracking-[0.18em] text-heading">
        Status
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selectedStatuses.includes(option.value);
          return (
            <button
              key={option.value}
              onClick={() => onToggle(option.value)}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors ${
                isSelected
                  ? STATUS_STYLES[option.value] ??
                    "border-accent/30 bg-accent/15 text-accent"
                  : "border-border bg-surface-strong/[0.04] text-subtle hover:bg-surface-strong/[0.08]"
              }`}
            >
              {option.label}
              {isSelected && <span className="ml-1.5">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};
