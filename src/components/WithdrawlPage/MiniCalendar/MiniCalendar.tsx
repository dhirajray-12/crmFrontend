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
        0
    ).getDate();

    const firstDayOfMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1
    ).getDay();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ];

    const previousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const handleDateClick = (day: number) => {
        const selectedDate = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day
        );
        const formattedDate = selectedDate.toLocaleDateString("en-CA");

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

    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const formatted = date.toLocaleDateString("en-CA");

        const isSelected = formatted === dateFrom || formatted === dateTo;
        const inRange = dateFrom && dateTo && date >= new Date(dateFrom) && date <= new Date(dateTo);
        const isFrom = formatted === dateFrom;

        days.push(
            <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={`aspect-square rounded-lg font-semibold text-xs sm:text-sm transition-all
          ${isSelected
                        ? isFrom
                            ? "bg-rose-500 text-heading"
                            : "bg-accent text-heading"
                        : inRange
                            ? "bg-rose-300/15 text-rose-100"
                            : "bg-surface-strong/[0.04] text-heading hover:bg-surface-strong/[0.08]"
                    }`}
            >
                {day}
            </button>
        );
    }

    return (
        <div className="rounded-[16px] border border-border bg-surface-strong p-3 shadow-2xl">
            <div className="flex gap-2 mb-3">
                <button
                    onClick={() => setSelectingMode("from")}
                    className={`flex-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-all ${selectingMode === "from"
                        ? "bg-rose-500 text-heading shadow-md"
                        : "bg-surface-strong/[0.05] text-subtle hover:bg-surface-strong/[0.08]"
                        }`}
                >
                    From {dateFrom && `(${dateFrom})`}
                </button>
                <button
                    onClick={() => setSelectingMode("to")}
                    className={`flex-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-all ${selectingMode === "to"
                        ? "bg-accent text-heading shadow-md"
                        : "bg-surface-strong/[0.05] text-subtle hover:bg-surface-strong/[0.08]"
                        }`}
                >
                    To {dateTo && `(${dateTo})`}
                </button>
            </div>

            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={previousMonth}
                    className="rounded-lg bg-surface-strong/[0.05] p-1.5 transition-all hover:bg-surface-strong/[0.08]"
                >
                    <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 text-heading" />
                </button>
                <h3 className="text-xs sm:text-sm font-bold text-heading">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <button
                    onClick={nextMonth}
                    className="rounded-lg bg-surface-strong/[0.05] p-2 transition-all hover:bg-surface-strong/[0.08]"
                >
                    <ChevronRight className="w-4 h-4 text-heading" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div key={day} className="text-center text-xs font-bold text-subtle">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">{days}</div>

            <div className="flex items-center gap-3 mt-4 text-xs">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-rose-500"></div>
                    <span className="text-subtle font-medium">From</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-accent"></div>
                    <span className="text-subtle font-medium">To</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-rose-300/15 border border-rose-300/20"></div>
                    <span className="text-subtle font-medium">Range</span>
                </div>
            </div>
        </div>
    );
};
