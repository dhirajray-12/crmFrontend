interface CustomDateRangeProps {
    start: string;
    end: string;
    onStartChange: (value: string) => void;
    onEndChange: (value: string) => void;
}

export const CustomDateRange: React.FC<CustomDateRangeProps> = ({
    start,
    end,
    onStartChange,
    onEndChange,
}) => {
    const today = new Date().toISOString().split("T")[0];

    return (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="flex flex-1 items-center gap-2 text-xs text-subtle">
                <span className="w-9 shrink-0 font-medium">From</span>
                <input
                    type="date"
                    value={start}
                    onChange={(e) => onStartChange(e.target.value)}
                    max={today}
                    className="w-full rounded-lg border border-border bg-surface-strong/[0.03] px-3 py-2 text-sm text-heading [color-scheme:dark] focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-sky-400/40"
                />
            </label>
            <label className="flex flex-1 items-center gap-2 text-xs text-subtle">
                <span className="w-9 shrink-0 font-medium">To</span>
                <input
                    type="date"
                    value={end}
                    onChange={(e) => onEndChange(e.target.value)}
                    max={today}
                    className="w-full rounded-lg border border-border bg-surface-strong/[0.03] px-3 py-2 text-sm text-heading [color-scheme:dark] focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-sky-400/40"
                />
            </label>
        </div>
    );
};
