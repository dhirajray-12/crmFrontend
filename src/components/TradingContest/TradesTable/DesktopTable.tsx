import type { Trade } from "@/types/TradingContest.types";
import { TableHeader } from "./TableHeader";
import { DesktopTableRow } from "./DesktopTableRow";

interface DesktopTableProps {
  trades: Trade[];
  filterType: "open" | "closed";
  loading: boolean;
}

export const DesktopTable = ({
  trades,
  filterType,
  loading,
}: DesktopTableProps) => {
  if (trades.length === 0) {
    return (
      <div className="hidden rounded-2xl border border-border bg-surface py-14 text-center md:block">
        <p className="text-sm text-subtle">
          {loading ? "Loading trades…" : `No ${filterType} trades found`}
        </p>
      </div>
    );
  }

  return (
    <div className="hidden overflow-hidden rounded-2xl border border-border bg-surface md:block">
      <div className="overflow-x-auto">
        <table className="w-full">
          <TableHeader filterType={filterType} />
          <tbody className="divide-y divide-border">
            {trades.map((trade) => (
              <DesktopTableRow
                key={trade.id}
                trade={trade}
                filterType={filterType}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
