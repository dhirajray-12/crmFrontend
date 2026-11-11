import type { Trade } from "@/types/TradingContest.types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DesktopTable } from "./DesktopTable";
import { MobileCards } from "./MobileCards";

interface TradesTableProps {
  trades: Trade[];
  filterType: "open" | "closed";
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export const TradesTable = ({
  trades,
  filterType,
  loading,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}: TradesTableProps) => {
  const showPagination = filterType === "closed" && totalPages > 1;
  const pageStart = totalItems === 0 ? 0 : (currentPage - 1) * 10 + 1;
  const pageEnd = totalItems === 0 ? 0 : pageStart + trades.length - 1;

  return (
    <>
      <DesktopTable trades={trades} filterType={filterType} loading={loading} />
      <MobileCards trades={trades} filterType={filterType} loading={loading} />

      {showPagination && (
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-subtle sm:flex-row sm:items-center sm:justify-between">
          <div>
            Showing {pageStart}-{pageEnd} of {totalItems} closed trades
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="inline-flex items-center justify-center rounded-lg border border-border bg-surface-strong/[0.04] p-2 text-subtle transition-colors hover:border-border hover:bg-surface-strong/[0.07] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="rounded-lg border border-border bg-surface-strong/[0.04] px-3 py-1.5 text-xs font-semibold text-heading">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="inline-flex items-center justify-center rounded-lg border border-border bg-surface-strong/[0.04] p-2 text-subtle transition-colors hover:border-border hover:bg-surface-strong/[0.07] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
