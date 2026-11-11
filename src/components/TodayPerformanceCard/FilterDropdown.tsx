import { useRef } from "react";
import { ChevronDown } from "lucide-react";
import { usePerformanceStore } from "@/Store/performanceStore";
import type { FilterOption } from "@/types/performance.types";
import { Panel } from "@/pages/ClientPage/DashboardComponents/ui/Panel";
import { cn } from "@/lib/utils";

const options: FilterOption[] = [
  { value: "Today", label: "Today" },
  { value: "7 Days", label: "7 Days" },
  { value: "14 Days", label: "14 Days" },
  { value: "30 Days", label: "30 Days" },
  { value: "60 Days", label: "60 Days" },
  { value: "90 Days", label: "90 Days" },
];

export const FilterDropdown = () => {
  const { filter, open, setFilter, setOpen } = usePerformanceStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-border bg-transparent px-3 py-1.5 text-xs font-medium text-subtle transition-colors hover:border-border hover:text-heading"
      >
        {options.find((opt) => opt.value === filter)?.label || filter}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <Panel
          strong
          className="animate-in fade-in slide-in-from-top-1 absolute right-0 z-50 mt-2 w-40 overflow-hidden py-1 duration-150"
        >
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                setFilter(opt.value);
                setOpen(false);
              }}
              className={cn(
                "cursor-pointer px-3.5 py-2 text-xs font-medium text-subtle transition-colors hover:bg-surface-strong/[0.06] hover:text-heading",
                filter === opt.value && "bg-accent/10 text-accent",
              )}
            >
              {opt.label}
            </div>
          ))}
        </Panel>
      )}
    </div>
  );
};
