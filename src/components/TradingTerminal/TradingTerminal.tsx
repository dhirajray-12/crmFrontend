import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useAccountsList } from "@/hooks/useAccountsData";
import { useTradingData } from "@/hooks/useTradingData";
import { useRefreshAccounts } from "@/hooks/useAccountsData";
import { WATCHLIST_SYMBOLS } from "./symbols";
import Watchlist from "./Watchlist";
import TradingChart from "./TradingChart";
import OrderTicket from "./OrderTicket";
import PositionsPanel from "./PositionsPanel";
import { cn } from "@/lib/utils";

export default function TradingTerminal() {
  const { data: accounts = [] } = useAccountsList();
  const { data: tradingData } = useTradingData();
  const refreshAccounts = useRefreshAccounts();

  const [accountId, setAccountId] = useState("");
  const [symbol, setSymbol] = useState(WATCHLIST_SYMBOLS[0].symbol);
  const [lastPrice, setLastPrice] = useState<number | null>(null);

  useEffect(() => {
    if (!accountId && accounts.length > 0) {
      setAccountId(accounts[0]._id);
    }
  }, [accounts, accountId]);

  const account = accounts.find((a) => a._id === accountId) || accounts[0];

  const floatingPnl = useMemo(() => {
    if (!account || !tradingData?.openTrades) return 0;
    return (tradingData.openTrades as any[])
      .filter((t) => String(t.account) === String(account.mt5Account))
      .reduce((sum, t) => sum + (Number(t.profit) || 0), 0);
  }, [tradingData, account]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-3 py-2">
        <select
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          className="rounded-lg border border-border bg-surface-strong/[0.03] px-3 py-1.5 text-xs font-semibold text-heading"
        >
          {accounts.map((a) => (
            <option key={a._id} value={a._id}>
              {a.platform} #{a.accountNumber} — {a.accountType?.toUpperCase()} — Bal: ${a.balance.toFixed(2)}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-xs font-semibold",
              floatingPnl >= 0 ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300",
            )}
          >
            {floatingPnl >= 0 ? "↗" : "↘"} P&amp;L: {floatingPnl >= 0 ? "+" : ""}
            {floatingPnl.toFixed(2)}
          </span>
          <button
            type="button"
            onClick={refreshAccounts}
            title="Refresh"
            className="rounded-md border border-border p-1.5 text-subtle transition-colors hover:text-heading"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)_300px]">
        <div className="hidden min-h-0 lg:block">
          <Watchlist activeSymbol={symbol} onSelectSymbol={setSymbol} />
        </div>

        <div className="flex min-h-0 min-w-0 flex-col gap-2 overflow-hidden border-b border-border bg-surface-strong/[0.015] lg:border-b-0 lg:border-r">
          <div className="min-h-0 flex-1 overflow-hidden pb-1">
            <TradingChart symbol={symbol} onLastPriceChange={setLastPrice} />
          </div>
          <PositionsPanel account={account} />
        </div>

        <div className="min-h-0">
          <OrderTicket symbol={symbol} lastPrice={lastPrice} account={account} floatingPnl={floatingPnl} />
        </div>
      </div>
    </div>
  );
}
