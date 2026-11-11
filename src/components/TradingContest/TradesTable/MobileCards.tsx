import type { Trade } from "@/types/TradingContest.types";
import { MobileTradeCard } from "./MobileTradeCard";

interface MobileCardsProps {
  trades: Trade[];
  filterType: "open" | "closed";
  loading: boolean;
}

export const MobileCards = ({
  trades,
  filterType,
  loading,
}: MobileCardsProps) => {
  if (trades.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center md:hidden">
        <p className="text-sm text-subtle">
          {loading ? "Loading trades…" : `No ${filterType} trades found`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:hidden">
      {trades.map((trade) => (
        <MobileTradeCard key={trade.id} trade={trade} filterType={filterType} />
      ))}
    </div>
  );
};
