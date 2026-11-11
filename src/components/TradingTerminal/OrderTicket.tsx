import { useState } from "react";
import { useLiveTradeActions } from "@/hooks/useLiveTradeActions";
import { useToastStore } from "@/Store/toast.store";
import { cn } from "@/lib/utils";
import { decimalsForSymbol } from "./symbols";
import type { AccountListItem } from "@/hooks/useAccountsData";

const LOT_PRESETS = ["0.01", "0.05", "0.1", "0.5", "1.0"];
const ORDER_TABS = ["Market", "Limit", "Stop", "Stop Limit"] as const;

interface OrderTicketProps {
  symbol: string;
  lastPrice: number | null;
  account: AccountListItem | undefined;
  floatingPnl: number;
}

export default function OrderTicket({ symbol, lastPrice, account, floatingPnl }: OrderTicketProps) {
  const [orderType, setOrderType] = useState<(typeof ORDER_TABS)[number]>("Market");
  const [lot, setLot] = useState("0.01");
  const [useSlTp, setUseSlTp] = useState(false);
  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");
  const { placeTrade } = useLiveTradeActions();
  const addToast = useToastStore((state) => state.addToast);

  const decimals = decimalsForSymbol(symbol);

  const handleTrade = async (type: 0 | 1) => {
    if (orderType !== "Market") {
      addToast("error", `${orderType} orders aren't supported yet - only Market execution is wired up`);
      return;
    }
    if (!account) {
      addToast("error", "Select an account first");
      return;
    }
    if (!lastPrice) {
      addToast("error", "Waiting for a live price - try again in a moment");
      return;
    }
    const lotValue = Number.parseFloat(lot);
    if (!lotValue || lotValue <= 0) {
      addToast("error", "Enter a valid lot size");
      return;
    }

    try {
      await placeTrade.mutateAsync({
        accountId: account._id,
        symbol,
        price: lastPrice,
        lot: lotValue,
        type,
        sl: useSlTp && sl ? Number.parseFloat(sl) : 0,
        tp: useSlTp && tp ? Number.parseFloat(tp) : 0,
      });
      addToast("success", `${type === 0 ? "Buy" : "Sell"} order placed on ${symbol}`);
    } catch (err: any) {
      addToast("error", err?.message || "Failed to place trade");
    }
  };

  const isSubmitting = placeTrade.isPending;
  const sellPrice = lastPrice ? lastPrice.toFixed(decimals) : "--";
  const buyPrice = lastPrice ? lastPrice.toFixed(decimals) : "--";

  return (
    <div className="flex h-full min-w-0 flex-col border-l border-border">
      <div className="grid grid-cols-2 gap-px border-b border-border bg-border">
        <button
          type="button"
          onClick={() => handleTrade(1)}
          disabled={isSubmitting}
          className="bg-rose-500/10 px-3 py-3 text-center transition-colors hover:bg-rose-500/15 disabled:opacity-60"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">Sell</p>
          <p className="font-mono text-lg font-bold text-rose-700 dark:text-rose-300">{sellPrice}</p>
        </button>
        <button
          type="button"
          onClick={() => handleTrade(0)}
          disabled={isSubmitting}
          className="bg-emerald-500/10 px-3 py-3 text-center transition-colors hover:bg-emerald-500/15 disabled:opacity-60"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Buy</p>
          <p className="font-mono text-lg font-bold text-emerald-700 dark:text-emerald-300">{buyPrice}</p>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="mb-3 flex items-center gap-2 text-xs text-subtle">
          <span className="h-2 w-2 rounded-full bg-accent" />
          Market execution · {symbol}
        </div>

        <div className="mb-3 flex gap-4 border-b border-border text-xs font-semibold">
          {ORDER_TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setOrderType(t)}
              className={cn(
                "border-b-2 px-0.5 pb-2 transition-colors",
                orderType === t ? "border-accent text-accent" : "border-transparent text-subtle hover:text-heading",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-subtle">
          Volume (lots) <span className="text-[10px] font-normal">min 0.01</span>
        </label>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {LOT_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setLot(preset)}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors",
                lot === preset
                  ? "border-accent/40 bg-accent/15 text-accent"
                  : "border-border text-subtle hover:border-border hover:text-heading",
              )}
            >
              {preset}
            </button>
          ))}
        </div>
        <div className="mb-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLot((v) => Math.max(0.01, (Number.parseFloat(v) || 0) - 0.01).toFixed(2))}
            className="h-9 w-9 shrink-0 rounded-lg border border-border text-heading"
          >
            −
          </button>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={lot}
            onChange={(e) => setLot(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-strong/[0.03] px-3 py-2 text-center text-sm font-semibold text-heading"
          />
        </div>

        <label className="mb-2 flex items-center justify-between text-xs font-semibold text-subtle">
          Take Profit &amp; Stop Loss
          <button
            type="button"
            role="switch"
            aria-checked={useSlTp}
            onClick={() => setUseSlTp((v) => !v)}
            className={cn(
              "relative h-5 w-9 rounded-full transition-colors",
              useSlTp ? "bg-accent" : "bg-surface-strong/20",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                useSlTp ? "translate-x-4" : "translate-x-0.5",
              )}
            />
          </button>
        </label>

        {useSlTp && (
          <div className="mb-3 grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-subtle">Stop loss</label>
              <input
                type="number"
                step="0.00001"
                placeholder="Optional"
                value={sl}
                onChange={(e) => setSl(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-strong/[0.03] px-2.5 py-1.5 text-xs text-heading placeholder:text-subtle"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-subtle">Take profit</label>
              <input
                type="number"
                step="0.00001"
                placeholder="Optional"
                value={tp}
                onChange={(e) => setTp(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-strong/[0.03] px-2.5 py-1.5 text-xs text-heading placeholder:text-subtle"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleTrade(1)}
            disabled={isSubmitting}
            className="rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ↓ Sell @ {sellPrice}
          </button>
          <button
            type="button"
            onClick={() => handleTrade(0)}
            disabled={isSubmitting}
            className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ↑ Buy @ {buyPrice}
          </button>
        </div>

        <div className="mt-4 space-y-2 border-t border-border pt-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-subtle">Balance</span>
            <span className="font-mono font-semibold text-heading">{(account?.balance ?? 0).toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-subtle">Equity</span>
            <span className="font-mono font-semibold text-heading">
              {((account?.balance ?? 0) + floatingPnl).toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            {/* Real margin-used isn't returned by any endpoint this page
                has access to, so this is left at 0 rather than faking a
                number - it's accurate whenever there are no open positions,
                understated otherwise. */}
            <span className="text-subtle">Margin</span>
            <span className="font-mono font-semibold text-heading">0.00</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-subtle">Free Margin</span>
            <span className="font-mono font-semibold text-heading">
              {((account?.balance ?? 0) + floatingPnl).toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-subtle">Leverage</span>
            <span className="font-mono font-semibold text-heading">{account?.leverage ?? "--"}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-surface-strong/[0.04] px-2 py-1.5">
            <span className="text-subtle">Floating P&amp;L</span>
            <span
              className={cn(
                "font-mono font-semibold",
                floatingPnl >= 0 ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300",
              )}
            >
              {floatingPnl >= 0 ? "+" : ""}
              {floatingPnl.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
