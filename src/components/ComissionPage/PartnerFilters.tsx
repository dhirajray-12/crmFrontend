import { useCommissionStore } from "@/Store/commission.store";
import type { LevelFilter } from "@/types/commissionPage.types";
import { File, FileText } from "lucide-react";

interface PartnerFiltersProps {
  showFilters: boolean;
  searchTerm: string;
}

export const PartnerFilters = ({ showFilters }: PartnerFiltersProps) => {
  const { filterLevel, setFilterLevel } = useCommissionStore();

  const levels: LevelFilter[] = ["All", "1", "2", "3", "4", "5"];

  return (
    <div
      className={`${showFilters ? "flex" : "hidden"} flex-col gap-3 sm:flex sm:flex-row sm:items-center sm:justify-between`}
    >
      <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
        {levels.map((level) => (
          <button
            key={level}
            onClick={() => setFilterLevel(level)}
            className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${
              filterLevel === level
                ? "bg-accent/15 text-accent"
                : "border border-border bg-surface-strong/[0.04] text-subtle hover:bg-surface-strong/[0.08]"
            }`}
          >
            {level === "All" ? "All" : `L${level}`}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-surface-strong/[0.04] px-3 py-2 text-sm font-semibold text-heading transition hover:bg-surface-strong/[0.08] sm:flex-none">
          <FileText className="h-4 w-4" />
          <span>Excel</span>
        </button>
        <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-surface-strong/[0.04] px-3 py-2 text-sm font-semibold text-heading transition hover:bg-surface-strong/[0.08] sm:flex-none">
          <File className="h-4 w-4" />
          <span>PDF</span>
        </button>
      </div>
    </div>
  );
};
