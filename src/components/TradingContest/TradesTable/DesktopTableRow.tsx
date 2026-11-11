import type { Trade } from "@/types/TradingContest.types";
import { formatPrice } from "@/utils/TradingContest.Helper";
import { ProfitLossBadge } from "../common/ProfitLossBadge";
import { TradeTypeBadge } from "../common/TradeTypeBadge";

interface DesktopTableRowProps {
  trade: Trade;
  filterType: "open" | "closed";
}

export const DesktopTableRow = ({
  trade,
  filterType,
}: DesktopTableRowProps) => {
  return (
    <tr className="transition-colors hover:bg-surface-strong/[0.03]">
      <td className="whitespace-nowrap px-5 py-3.5">
        <div className="flex flex-col">
          <span className="font-semibold text-heading">{trade.accountNo}</span>
          {trade.accountName && (
            <span className="mt-0.5 text-[11px] text-subtle">
              {trade.accountName}
            </span>
          )}
        </div>
      </td>
      <td className="whitespace-nowrap px-5 py-3.5 text-sm font-medium text-heading">
        {trade.symbol}
      </td>
      <td className="whitespace-nowrap px-5 py-3.5">
        <TradeTypeBadge type={trade.type} />
      </td>
      <td className="whitespace-nowrap px-5 py-3.5 text-sm text-heading">
        {trade.volume}
      </td>
      <td className="whitespace-nowrap px-5 py-3.5 text-sm text-heading">
        {formatPrice(trade.openPrice)}
      </td>
      <td className="whitespace-nowrap px-5 py-3.5">
        <div className="flex flex-col">
          <span className="text-sm text-heading">{trade.openDate}</span>
          <span className="text-xs text-subtle">{trade.openTime}</span>
        </div>
      </td>
      {filterType === "closed" && (
        <>
          <td className="whitespace-nowrap px-5 py-3.5 text-sm text-heading">
            {formatPrice(trade.closePrice)}
          </td>
          <td className="whitespace-nowrap px-5 py-3.5">
            <div className="flex flex-col">
              <span className="text-sm text-heading">
                {trade.closeDate || "-"}
              </span>
              <span className="text-xs text-subtle">
                {trade.closeTime || "-"}
              </span>
            </div>
          </td>
        </>
      )}
      <td className="whitespace-nowrap px-5 py-3.5 text-right">
        <ProfitLossBadge profit={trade.profit} size="sm" />
      </td>
    </tr>
  );
};
