interface FilterButtonsProps {
  filterType: "open" | "closed";
  openCount: number;
  closedCount: number;
  onFilterChange: (type: "open" | "closed") => void;
}

export const FilterButtons = ({
  filterType,
  openCount,
  closedCount,
  onFilterChange,
}: FilterButtonsProps) => {
  return (
    <div className="inline-flex gap-1 rounded-xl border border-border bg-surface-strong/[0.03] p-1">
      <button
        onClick={() => onFilterChange("open")}
        className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
          filterType === "open"
            ? "bg-accent text-heading"
            : "text-subtle hover:bg-surface-strong/[0.06] hover:text-heading"
        }`}
      >
        Open <span className="tabular-nums opacity-80">({openCount})</span>
      </button>
      <button
        onClick={() => onFilterChange("closed")}
        className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
          filterType === "closed"
            ? "bg-accent text-heading"
            : "text-subtle hover:bg-surface-strong/[0.06] hover:text-heading"
        }`}
      >
        Closed <span className="tabular-nums opacity-80">({closedCount})</span>
      </button>
    </div>
  );
};
