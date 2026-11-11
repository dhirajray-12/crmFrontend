import { X } from "lucide-react";
import type { FilterState, FilterOptions } from "@/types/WithdrawalPage.types";
import { statusOptions } from "@/utils/constants";

interface ActiveFiltersProps {
  filters: FilterState;
  accountTypeOptions: FilterOptions[];
  onRemoveAccountType: (typeId: string) => void;
  onRemoveStatus: (statusId: string) => void;
  onRemoveDateFrom: () => void;
  onRemoveDateTo: () => void;
}

export const ActiveFilters = ({
  filters,
  accountTypeOptions,
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
    <div className="pt-4 border-t border-border">
      <div className="flex flex-wrap gap-2">
        {filters.accountTypes.map((typeId) => {
          const type = accountTypeOptions.find((t) => t.id === typeId);
          return (
            <span
              key={typeId}
              className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${type?.bgColor} ${type?.color} border ${type?.borderColor} shadow-sm animate-fade-in`}
            >
              {type?.label}
              <button
                onClick={() => onRemoveAccountType(typeId)}
                className="ml-1.5 hover:scale-110 transition-transform"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          );
        })}

        {filters.statuses.map((statusId) => {
          const status = statusOptions.find((s) => s.id === statusId);
          return (
            <span
              key={statusId}
              className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${status?.bgColor} ${status?.color} border ${status?.borderColor} shadow-sm animate-fade-in`}
            >
              {status?.label}
              <button
                onClick={() => onRemoveStatus(statusId)}
                className="ml-1.5 hover:scale-110 transition-transform"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          );
        })}

        {filters.dateFrom && (
          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-400 shadow-sm animate-fade-in">
            From: {filters.dateFrom}
            <button
              onClick={onRemoveDateFrom}
              className="ml-1.5 hover:scale-110 transition-transform"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        )}

        {filters.dateTo && (
          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-400 shadow-sm animate-fade-in">
            To: {filters.dateTo}
            <button
              onClick={onRemoveDateTo}
              className="ml-1.5 hover:scale-110 transition-transform"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        )}
      </div>
    </div>
  );
};
