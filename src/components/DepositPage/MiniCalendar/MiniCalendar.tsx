import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MiniCalendarProps {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
}

export const MiniCalendar = ({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: MiniCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingMode, setSelectingMode] = useState<"from" | "to">("from");

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0,
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1,
  ).getDay();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
    );
  };

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );
    const formattedDate = selectedDate.toISOString().split("T")[0];

    if (selectingMode === "from") {
      onDateFromChange(formattedDate);
      setSelectingMode("to");
    } else {
      if (dateFrom && new Date(formattedDate) < new Date(dateFrom)) {
        onDateFromChange(formattedDate);
      } else {
        onDateToChange(formattedDate);
        setSelectingMode("from");
      }
    }
  };

  const isDateInRange = (day: number) => {
    if (!dateFrom || !dateTo) return false;
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );
    return date >= new Date(dateFrom) && date <= new Date(dateTo);
  };

  const isDateSelected = (day: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );
    const formattedDate = date.toISOString().split("T")[0];
    return formattedDate === dateFrom || formattedDate === dateTo;
  };

  const isFromDate = (day: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );
    const formattedDate = date.toISOString().split("T")[0];
    return formattedDate === dateFrom;
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const inRange = isDateInRange(day);
    const isSelected = isDateSelected(day);
    const isFrom = isFromDate(day);

    days.push(
      <button
        key={day}
        onClick={() => handleDateClick(day)}
        className={`
          aspect-square rounded-lg text-xs font-semibold transition-all duration-200
          hover:scale-105 active:scale-95
          ${
            isSelected
              ? isFrom
                ? "bg-accent text-heading shadow-lg"
                : "bg-accent text-heading shadow-lg"
              : inRange
                ? "bg-accent/15 text-accent"
                : "bg-surface-strong/[0.04] text-heading hover:bg-surface-strong/[0.08]"
          }
        `}
      >
        {day}
      </button>,
    );
  }

  return (
    <div className="rounded-[16px] border border-border bg-surface-strong p-3">
      <div className="mb-3 flex gap-2">
        <button
          onClick={() => setSelectingMode("from")}
          className={`flex-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-all ${
            selectingMode === "from"
              ? "bg-accent text-heading shadow-md"
              : "bg-surface-strong/[0.05] text-subtle hover:bg-surface-strong/[0.08]"
          }`}
        >
          From {dateFrom && `(${dateFrom})`}
        </button>
        <button
          onClick={() => setSelectingMode("to")}
          className={`flex-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-all ${
            selectingMode === "to"
              ? "bg-accent text-heading shadow-md"
              : "bg-surface-strong/[0.05] text-subtle hover:bg-surface-strong/[0.08]"
          }`}
        >
          To {dateTo && `(${dateTo})`}
        </button>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={previousMonth}
          className="rounded-lg bg-surface-strong/[0.05] p-1.5 transition-all hover:bg-surface-strong/[0.08]"
        >
          <ChevronLeft className="h-4 w-4 text-heading" />
        </button>
        <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-heading">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={nextMonth}
          className="rounded-lg bg-surface-strong/[0.05] p-1.5 transition-all hover:bg-surface-strong/[0.08]"
        >
          <ChevronRight className="h-4 w-4 text-heading" />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div
            key={day}
            className="text-center text-[10px] font-bold uppercase tracking-[0.12em] text-subtle"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">{days}</div>

      <div className="mt-3 flex items-center gap-3 text-[10px] uppercase tracking-[0.12em]">
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded bg-accent"></div>
          <span className="font-medium text-subtle">From</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded bg-accent"></div>
          <span className="font-medium text-subtle">To</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded border border-accent/30 bg-accent/15"></div>
          <span className="font-medium text-subtle">Range</span>
        </div>
      </div>
    </div>
  );
};
