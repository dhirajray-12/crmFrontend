import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  buildMonthDays,
  formatMonthYear,
  isSameDay,
} from "@/utils/TransferHistoryHelper";
import { WEEKDAYS_SHORT } from "@/utils/TransferHistoryConstant";

interface MiniCalendarProps {
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
}

export const MiniCalendar = ({ selectedDate, onSelect }: MiniCalendarProps) => {
  const [viewDate, setViewDate] = useState(new Date());
  const days = buildMonthDays(viewDate.getFullYear(), viewDate.getMonth());

  const goToPreviousMonth = () => {
    setViewDate((v) => {
      const n = new Date(v);
      n.setMonth(v.getMonth() - 1);
      return n;
    });
  };

  const goToNextMonth = () => {
    setViewDate((v) => {
      const n = new Date(v);
      n.setMonth(v.getMonth() + 1);
      return n;
    });
  };

  const isSelected = (d: Date) =>
    selectedDate ? isSameDay(d, selectedDate) : false;

  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className="mb-3 flex items-center justify-between text-xs font-semibold text-subtle sm:mb-4 sm:text-sm">
        <button
          onClick={goToPreviousMonth}
          className="p-1 transition hover:text-heading"
        >
          <ChevronLeft className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
        </button>
        <span className="text-xs sm:text-sm">{formatMonthYear(viewDate)}</span>
        <button
          onClick={goToNextMonth}
          className="p-1 transition hover:text-heading"
        >
          <ChevronRight className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-0.5 text-[10px] text-subtle sm:gap-1 sm:text-xs">
        {WEEKDAYS_SHORT.map((d, i) => (
          <div key={i} className="text-center font-medium">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-[10px] text-subtle sm:gap-1 sm:text-xs">
        {days.map((d, i) => (
          <div key={i} className="text-center">
            {d ? (
              <button
                onClick={() => onSelect(d)}
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition ${
                  isSelected(d)
                    ? "border border-accent/30 bg-accent/[0.16] text-accent shadow-md scale-105"
                    : "text-subtle hover:bg-surface-strong/[0.06]"
                }`}
              >
                {d.getDate()}
              </button>
            ) : (
              <div className="w-6 h-6 sm:w-8 sm:h-8" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
