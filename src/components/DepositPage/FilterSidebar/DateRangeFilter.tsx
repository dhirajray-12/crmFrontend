import { useState } from "react";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { MiniCalendar } from "../MiniCalendar/MiniCalendar";

interface DateRangeFilterProps {
    dateFrom: string;
    dateTo: string;
    onDateFromChange: (date: string) => void;
    onDateToChange: (date: string) => void;
    onClear: () => void;
    hasActiveFilter: boolean;
}

export const DateRangeFilter = ({
    dateFrom,
    dateTo,
    onDateFromChange,
    onDateToChange,
    onClear,
    hasActiveFilter,
}: DateRangeFilterProps) => {
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
                    Date Range
                </label>
                {hasActiveFilter && (
                    <button
                        onClick={onClear}
                        className="text-[11px] uppercase tracking-[0.1em] text-subtle transition-colors hover:text-heading"
                    >
                        Clear
                    </button>
                )}
            </div>

            <div className="relative">
                <button
                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                    className="flex w-full items-center justify-between rounded-lg border border-border bg-surface-strong/[0.03] px-3 py-2.5 text-left text-sm font-medium text-heading transition-colors hover:bg-surface-strong/[0.06]"
                >
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-accent" />
                        {dateFrom && dateTo ? (
                            <span className="truncate">
                                {dateFrom} → {dateTo}
                            </span>
                        ) : (
                            <span className="text-subtle">Select date range</span>
                        )}
                    </div>
                    {isCalendarOpen ? (
                        <ChevronUp className="h-4 w-4 text-subtle" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-subtle" />
                    )}
                </button>

                {isCalendarOpen && (
                    <div className="absolute left-0 z-50 mt-2 w-full rounded-lg border border-border bg-surface-strong p-2 shadow-2xl">
                        <MiniCalendar
                            dateFrom={dateFrom}
                            dateTo={dateTo}
                            onDateFromChange={onDateFromChange}
                            onDateToChange={onDateToChange}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
