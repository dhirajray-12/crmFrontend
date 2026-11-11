import { accountTypeOptions } from "@/utils/constants";

interface AccountTypeFilterProps {
    selectedTypes: string[];
    onToggle: (typeId: string) => void;
    onClear: () => void;
}

export const AccountTypeFilter = ({ selectedTypes, onToggle, onClear }: AccountTypeFilterProps) => {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
                    Account Type
                </label>
                {selectedTypes.length > 0 && (
                    <button
                        onClick={onClear}
                        className="text-[11px] uppercase tracking-[0.1em] text-subtle transition-colors hover:text-heading"
                    >
                        Clear
                    </button>
                )}
            </div>
            <div className="flex flex-wrap gap-2">
                {accountTypeOptions.map((type) => {
                    const isSelected = selectedTypes.includes(type.id);
                    return (
                        <button
                            key={type.id}
                            onClick={() => onToggle(type.id)}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] transition-colors ${isSelected
                                ? `${type.bgColor} ${type.color} ${type.borderColor}`
                                : "border-border bg-surface-strong/[0.03] text-subtle hover:bg-surface-strong/[0.06]"
                                }`}
                        >
                            {type.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
