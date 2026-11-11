import { statusOptions } from "@/utils/constants";

interface StatusFilterProps {
    selectedStatuses: string[];
    onToggle: (statusId: string) => void;
    onClear: () => void;
}

export const StatusFilter = ({ selectedStatuses, onToggle, onClear }: StatusFilterProps) => {
    return (
        <div className="space-y-2.5">
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-heading uppercase tracking-[0.18em]">
                    Status
                </label>
                {selectedStatuses.length > 0 && (
                    <button
                        onClick={onClear}
                        className="text-[11px] uppercase tracking-[0.14em] text-heading/80 transition-colors hover:text-heading"
                    >
                        Clear
                    </button>
                )}
            </div>
            <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => {
                    const isSelected = selectedStatuses.includes(status.id);
                    return (
                        <button
                            key={status.id}
                            onClick={() => onToggle(status.id)}
                            className={`rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-all duration-300 hover:scale-[1.03] active:scale-95 ${isSelected
                                ? `${status.bgColor} ${status.color} ${status.borderColor} scale-105`
                                : "bg-surface-strong/[0.04] text-heading border-border hover:bg-surface-strong/[0.08]"
                                }`}
                        >
                            {status.label}
                            {isSelected && <span className="ml-1.5 inline-block">✓</span>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
