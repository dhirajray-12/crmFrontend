import { FILTER_OPTIONS } from "@/utils/TransferHistoryConstant";

interface FilterTypeButtonsProps {
  selectedType: string;
  onSelect: (type: string) => void;
  onClose?: () => void;
}

export const FilterTypeButtons = ({ selectedType, onSelect, onClose }: FilterTypeButtonsProps) => {
  const handleSelect = (opt: string) => {
    onSelect(opt);
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {FILTER_OPTIONS.map((opt) => (
        <button
          key={opt}
          onClick={() => handleSelect(opt)}
          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
            selectedType === opt
              ? "border-accent/30 bg-accent/[0.16] text-accent"
              : "border-border bg-surface-strong/[0.03] text-subtle hover:bg-surface-strong/[0.06]"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
};
