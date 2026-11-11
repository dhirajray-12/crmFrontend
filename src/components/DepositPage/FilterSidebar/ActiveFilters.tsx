import { X } from "lucide-react";
import type { FilterState } from "@/types/depositePage.types";
import { accountTypeOptions, statusOptions } from "@/utils/constants";

interface ActiveFiltersProps {
  filters: FilterState;
  onRemoveAccountType: (typeId: string) => void;
  onRemoveStatus: (statusId: string) => void;
  onRemoveDateFrom: () => void;
  onRemoveDateTo: () => void;
}

export const ActiveFilters = ({
  filters,
  onRemoveAccountType,
  onRemoveStatus,
  onRemoveDateFrom,
  onRemoveDateTo,
}: ActiveFiltersProps) => {
  if (
    filters.accountTypes.length === 0 &&
    filters.statuses.length === 0 &&
    !filters.dateFrom &&
    !filters.dateTo
  ) {
    return null;
  }

  return (
    <div className="border-t border-border pt-3">
      <div className="flex flex-wrap gap-2">
        {filters.accountTypes.map((typeId) => {
          const type = accountTypeOptions.find((t) => t.id === typeId);
          return (
            <span
              key={typeId}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${type?.bgColor} ${type?.color} ${type?.borderColor}`}
            >
              {type?.label}
              <button
                onClick={() => onRemoveAccountType(typeId)}
                className="transition-opacity hover:opacity-70"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          );
        })}

        {filters.statuses.map((statusId) => {
          const status = statusOptions.find((s) => s.id === statusId);
          return (
            <span
              key={statusId}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${status?.bgColor} ${status?.color} ${status?.borderColor}`}
            >
              {status?.label}
              <button
                onClick={() => onRemoveStatus(statusId)}
                className="transition-opacity hover:opacity-70"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          );
        })}

        {filters.dateFrom && (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-accent/20 bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
            From: {filters.dateFrom}
            <button
              onClick={onRemoveDateFrom}
              className="transition-opacity hover:opacity-70"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}

        {filters.dateTo && (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-accent/20 bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
            To: {filters.dateTo}
            <button
              onClick={onRemoveDateTo}
              className="transition-opacity hover:opacity-70"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}
      </div>
    </div>
  );
};
