import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { ModernCalendar } from "../ModernCalendar/ModernCalendar";

interface DateRangeFilterProps {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
}

export const DateRangeFilter = ({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: DateRangeFilterProps) => {
  const [datePickerOpen, setDatePickerOpen] = useState(
    Boolean(dateFrom || dateTo),
  );

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setDatePickerOpen(!datePickerOpen)}
        className="flex w-full items-center justify-between text-xs font-bold uppercase tracking-[0.18em] text-heading"
      >
        <span className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-accent" />
          Date Range
        </span>
        <ChevronDown
          className={`h-4 w-4 text-subtle transition-transform ${
            datePickerOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-lg border border-border bg-surface-strong/[0.04] px-2.5 py-1 text-xs text-subtle">
          From: {dateFrom || "Any"}
        </span>
        <span className="rounded-lg border border-border bg-surface-strong/[0.04] px-2.5 py-1 text-xs text-subtle">
          To: {dateTo || "Any"}
        </span>
      </div>

      {datePickerOpen && (
        <div className="space-y-3 pt-1">
          <ModernCalendar
            value={dateFrom}
            onChange={onDateFromChange}
            label="From Date"
            maxDate={dateTo || undefined}
          />

          <ModernCalendar
            value={dateTo}
            onChange={onDateToChange}
            label="To Date"
            minDate={dateFrom || undefined}
          />
        </div>
      )}
    </div>
  );
};
