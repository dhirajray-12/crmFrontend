import type { Trade } from "@/types/copyTrading.types";

interface TradeRowProps {
  trade: Trade;
}

export const TradeRow = ({ trade }: TradeRowProps) => (
  <div className="bg-surface-strong rounded-xl p-4 border-2 border-border hover:border-border transition-all duration-300">
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4 items-center">
      <div>
        <p className="text-xs text-body mb-1">Symbol</p>
        <p className="text-sm font-bold text-heading">{trade.symbol}</p>
      </div>
      <div>
        <p className="text-xs text-body mb-1">Type</p>
        <span
          className={`inline-block px-2 py-1 rounded text-xs font-semibold border ${
            trade.type === "BUY"
              ? "bg-green-100 text-green-700 border-green-300"
              : "bg-red-100 text-red-700 border-red-300"
          }`}
        >
          {trade.type}
        </span>
      </div>
      <div>
        <p className="text-xs text-body mb-1">Volume</p>
        <p className="text-sm font-semibold text-accent">{trade.volume}</p>
      </div>
      <div>
        <p className="text-xs text-body mb-1">Open Price</p>
        <p className="text-sm text-heading">{trade.openPrice}</p>
      </div>
      <div>
        <p className="text-xs text-body mb-1">Current Price</p>
        <p className="text-sm font-semibold text-blue-600">
          {trade.currentPrice}
        </p>
      </div>
      <div>
        <p className="text-xs text-body mb-1">Profit</p>
        <p
          className={`text-sm font-bold ${trade.profit > 0 ? "text-green-600" : "text-red-600"}`}
        >
          ${trade.profit.toLocaleString()}
        </p>
      </div>
      <div>
        <p className="text-xs text-body mb-1">Open Time</p>
        <p className="text-xs text-heading">{trade.openTime}</p>
      </div>
    </div>
  </div>
);
