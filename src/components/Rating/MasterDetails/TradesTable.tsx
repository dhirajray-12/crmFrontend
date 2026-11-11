import type { MasterTrader } from "@/types/rating.types";

interface TradesTableProps {
  master: MasterTrader;
  activeTab: "closed" | "open";
  setActiveTab: (tab: "closed" | "open") => void;
}

export const TradesTable = ({
  master,
  activeTab,
  setActiveTab,
}: TradesTableProps) => {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 sm:p-6">
      <div className="mb-4 flex gap-2 border-b border-border">
        {(["closed", "open"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2.5 text-sm font-semibold capitalize transition-colors ${
              activeTab === tab
                ? "border-b-2 border-accent text-heading"
                : "text-subtle hover:text-heading"
            }`}
          >
            {tab === "closed" ? "Recent Trades" : "Open Positions"}
          </button>
        ))}
      </div>

      {master.trades && master.trades.length > 0 ? (
        <>
          {/* Mobile: card list */}
          <div className="space-y-2 sm:hidden">
            {master.trades.map((trade) => (
              <div
                key={trade.id}
                className="rounded-lg border border-border bg-surface-strong/[0.03] p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-heading">{trade.symbol}</span>
                  <span
                    className={`rounded px-2 py-0.5 text-[11px] font-bold ${
                      trade.type === "buy"
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : "bg-red-500/15 text-red-700 dark:text-red-300"
                    }`}
                  >
                    {trade.type.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-subtle">
                  <span>{trade.duration}</span>
                  <span
                    className={`text-sm font-bold ${trade.profit >= 0 ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"}`}
                  >
                    {trade.profit >= 0 ? "+" : ""}${trade.profit.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-subtle">
                    Symbol
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-subtle">
                    Type
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.08em] text-subtle">
                    Duration
                  </th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-[0.08em] text-subtle">
                    Profit/Loss
                  </th>
                </tr>
              </thead>
              <tbody>
                {master.trades.map((trade) => (
                  <tr
                    key={trade.id}
                    className="border-b border-border transition-colors hover:bg-surface-strong/[0.03]"
                  >
                    <td className="px-3 py-3 text-sm font-medium text-heading">{trade.symbol}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-[11px] font-bold ${
                          trade.type === "buy"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                            : "bg-red-500/15 text-red-700 dark:text-red-300"
                        }`}
                      >
                        {trade.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm text-subtle">{trade.duration}</td>
                    <td
                      className={`px-3 py-3 text-right text-sm font-bold ${
                        trade.profit >= 0 ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"
                      }`}
                    >
                      {trade.profit >= 0 ? "+" : ""}${trade.profit.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="py-10 text-center">
          <p className="text-sm text-subtle">No trades available</p>
        </div>
      )}
    </div>
  );
};
