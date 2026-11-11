import type { TransferFilterOption } from "@/types/transfer.types";

interface AccountTypeFilterProps {
  options: TransferFilterOption[];
  selectedTypes: string[];
  onToggle: (value: string) => void;
}

export const AccountTypeFilter = ({
  options,
  selectedTypes,
  onToggle,
}: AccountTypeFilterProps) => {
  return (
    <div className="space-y-2.5">
      <label className="text-xs font-bold uppercase tracking-[0.18em] text-heading">
        Account Type
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selectedTypes.includes(option.value);
          return (
            <button
              key={option.value}
              onClick={() => onToggle(option.value)}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors ${
                isSelected
                  ? "border-accent/30 bg-accent/15 text-accent"
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
