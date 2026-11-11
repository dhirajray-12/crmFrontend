import { statusOptions } from "@/utils/constants";

interface StatusFilterProps {
    selectedStatuses: string[];
    onToggle: (statusId: string) => void;
    onClear: () => void;
}

export const StatusFilter = ({ selectedStatuses, onToggle, onClear }: StatusFilterProps) => {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
                    Status
                </label>
                {selectedStatuses.length > 0 && (
                    <button
                        onClick={onClear}
                        className="text-[11px] uppercase tracking-[0.1em] text-subtle transition-colors hover:text-heading"
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
                            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] transition-colors ${isSelected
                                ? `${status.bgColor} ${status.color} ${status.borderColor}`
                                : "border-border bg-surface-strong/[0.03] text-subtle hover:bg-surface-strong/[0.06]"
                                }`}
                        >
                            {status.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
