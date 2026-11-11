import type { MasterTrader } from "@/types/rating.types";

interface TradesTableProps {
  master: MasterTrader;
  activeTab: "closed" | "open";
  onTabChange: (tab: "closed" | "open") => void;
}

export const TradesTable = ({
  master,
  activeTab,
  onTabChange,
}: TradesTableProps) => {
  if (!master.trades || master.trades.length === 0) {
    return (
      <div className="bg-surface-strong rounded-3xl p-8 border border-border shadow-xl">
        <div className="text-center py-12">
          <p className="text-subtle">No trades available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-strong rounded-3xl p-8 border border-border shadow-xl">
      <div className="flex gap-4 mb-6 border-b border-border overflow-x-auto">
        {(["closed", "open"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-6 py-3 font-medium transition-all duration-300 capitalize whitespace-nowrap ${
              activeTab === tab
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-body hover:text-heading"
            }`}
          >
            {tab === "closed" ? "Recent Trades" : "Open Positions"}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-body font-medium">
                Symbol
              </th>
              <th className="text-left py-3 px-4 text-body font-medium">
                Type
              </th>
              <th className="text-left py-3 px-4 text-body font-medium">
                Duration
              </th>
              <th className="text-right py-3 px-4 text-body font-medium">
                Profit/Loss
              </th>
            </tr>
          </thead>
          <tbody>
            {master.trades.map((trade) => (
              <tr
                key={trade.id}
                className="border-b border-border hover:bg-surface transition-colors"
              >
                <td className="py-4 px-4 text-heading font-medium">
                  {trade.symbol}
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      trade.type === "buy"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {trade.type.toUpperCase()}
                  </span>
                </td>
                <td className="py-4 px-4 text-body">{trade.duration}</td>
                <td
                  className={`py-4 px-4 text-right font-bold ${
                    trade.profit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {trade.profit >= 0 ? "+" : ""}${trade.profit.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
