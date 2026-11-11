import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronDown } from "lucide-react";
import type { CalendarProps } from "@/types/transfer.types";

export const ModernCalendar = ({
  value,
  onChange,
  label,
  minDate,
  maxDate,
}: CalendarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "Select date";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDateClick = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split("T")[0];

    if (minDate && dateStr < minDate) return;
    if (maxDate && dateStr > maxDate) return;

    onChange(dateStr);
    setIsOpen(false);
  };

  const isSelectedDate = (day: number) => {
    if (!value) return false;
    const selected = new Date(value);
    return (
      selected.getDate() === day &&
      selected.getMonth() === currentMonth.getMonth() &&
      selected.getFullYear() === currentMonth.getFullYear()
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    );
  };

  const isDisabledDate = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dateStr = new Date(year, month, day).toISOString().split("T")[0];

    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    return false;
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startingDayOfWeek }, (_, i) => i);

  const monthYear = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="relative" ref={calendarRef}>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-surface-strong/[0.03] px-3.5 py-3 text-left transition-colors hover:bg-surface-strong/[0.06]"
      >
        <span className={value ? "text-sm text-heading" : "text-sm text-subtle"}>
          {formatDisplayDate(value)}
        </span>
        <Calendar className="h-4 w-4 text-subtle" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute z-[60] mb-2 w-full rounded-lg border border-border bg-surface-strong p-4 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() - 1,
                    ),
                  )
                }
                className="rounded-lg p-2 transition-colors hover:bg-surface-strong/[0.06]"
              >
                <ChevronDown className="w-5 h-5 rotate-90 text-subtle" />
              </button>
              <h3 className="text-sm font-bold text-heading">{monthYear}</h3>
              <button
                type="button"
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() + 1,
                    ),
                  )
                }
                className="rounded-lg p-2 transition-colors hover:bg-surface-strong/[0.06]"
              >
                <ChevronDown className="w-5 h-5 -rotate-90 text-subtle" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div
                  key={day}
                  className="py-1 text-center text-xs font-bold text-subtle"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {blanks.map((blank) => (
                <div key={`blank-${blank}`} className="aspect-square" />
              ))}
              {days.map((day) => {
                const selected = isSelectedDate(day);
                const today = isToday(day);
                const disabled = isDisabledDate(day);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => !disabled && handleDateClick(day)}
                    disabled={disabled}
                    className={`
                      aspect-square rounded-lg text-sm font-semibold transition-colors
                      ${
                        selected
                          ? "bg-accent text-heading"
                          : today
                            ? "bg-accent/[0.14] text-accent hover:bg-accent/[0.22]"
                            : disabled
                              ? "cursor-not-allowed text-body"
                              : "text-subtle hover:bg-surface-strong/[0.06]"
                      }
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex gap-2 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => {
                  onChange(new Date().toISOString().split("T")[0]);
                  setIsOpen(false);
                }}
                className="flex-1 rounded-lg bg-accent px-3 py-2 text-xs font-bold text-accent-foreground transition-colors hover:bg-accent"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                }}
                className="flex-1 rounded-lg border border-border bg-surface-strong/[0.05] px-3 py-2 text-xs font-bold text-subtle transition-all hover:bg-surface-strong/[0.08]"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
