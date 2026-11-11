import { useState, useRef, useEffect } from "react";
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
    const calendarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setIsCalendarOpen(false);
            }
        }

        if (isCalendarOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isCalendarOpen]);

    return (
        <div className="space-y-3 relative" ref={calendarRef}>
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-heading uppercase tracking-[0.18em]">
                    Date Range
                </label>
                {hasActiveFilter && (
                    <button
                        onClick={onClear}
                        className="text-[11px] uppercase tracking-[0.14em] text-heading/80 transition-colors hover:text-heading"
                    >
                        Clear
                    </button>
                )}
            </div>

            <button
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-surface-strong/[0.04] px-3 py-2.5 text-left text-sm font-semibold text-heading transition-all duration-300 hover:bg-surface-strong/[0.08]"
            >
                <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-rose-100" />
                    <span className="truncate">
                        {dateFrom || dateTo
                            ? `${dateFrom || "Start"} - ${dateTo || "End"}`
                            : "Select Date Range"}
                    </span>
                </div>
                {isCalendarOpen ? (
                    <ChevronUp className="h-4 w-4 text-subtle" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-subtle" />
                )}
            </button>

            {isCalendarOpen && (
                <div className="fixed sm:absolute bottom-0 sm:bottom-full left-0 right-0 sm:mb-2 z-50 animate-slide-up p-3 sm:p-0">
                    <MiniCalendar
                        dateFrom={dateFrom}
                        dateTo={dateTo}
                        onDateFromChange={onDateFromChange}
                        onDateToChange={onDateToChange}
                    />
                </div>
            )}
        </div>
    );
};
