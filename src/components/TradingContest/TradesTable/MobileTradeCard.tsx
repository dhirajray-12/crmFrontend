import type { Trade } from "@/types/TradingContest.types";
import { formatPrice } from "@/utils/TradingContest.Helper";
import { ProfitLossBadge } from "../common/ProfitLossBadge";
import { TradeTypeBadge } from "../common/TradeTypeBadge";

interface MobileTradeCardProps {
  trade: Trade;
  filterType: "open" | "closed";
}

const Field = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
  <div>
    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-subtle">
      {label}
    </div>
    <div className="mt-0.5 text-sm font-medium text-heading">{value}</div>
    {sub && <div className="text-xs text-subtle">{sub}</div>}
  </div>
);

export const MobileTradeCard = ({
  trade,
  filterType,
}: MobileTradeCardProps) => {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-bold text-heading">{trade.accountNo}</div>
          {trade.accountName && (
            <div className="mt-0.5 text-[11px] text-subtle">{trade.accountName}</div>
          )}
        </div>
        <TradeTypeBadge type={trade.type} />
      </div>

      <div className="mt-3.5 grid grid-cols-2 gap-3 border-t border-border pt-3.5">
        <Field label="Symbol" value={trade.symbol} />
        <Field label="Volume" value={String(trade.volume)} />
        <Field label="Open Price" value={formatPrice(trade.openPrice)} />
        <Field label="Open Time" value={trade.openDate} sub={trade.openTime} />
        {filterType === "closed" && (
          <>
            <Field label="Close Price" value={formatPrice(trade.closePrice)} />
            <Field
              label="Close Time"
              value={trade.closeDate || "-"}
              sub={trade.closeTime || "-"}
            />
          </>
        )}
      </div>

      <div className="mt-3.5 flex items-center justify-between border-t border-border pt-3.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
          Profit/Loss
        </span>
        <ProfitLossBadge profit={trade.profit} size="md" />
      </div>
    </div>
  );
};
