import { useMemo, useState } from "react";
import { Search, Star } from "lucide-react";
import { useWatchlistPrices } from "@/hooks/useWatchlistPrices";
import {
  WATCHLIST_CATEGORIES,
  WATCHLIST_SYMBOLS,
  formatSymbolPrice,
  type WatchlistCategory,
} from "./symbols";
import { cn } from "@/lib/utils";

interface WatchlistProps {
  activeSymbol: string;
  onSelectSymbol: (symbol: string) => void;
}

export default function Watchlist({ activeSymbol, onSelectSymbol }: WatchlistProps) {
  const [filter, setFilter] = useState("");
  const [category, setCategory] = useState<WatchlistCategory>("All");

  const symbols = useMemo(
    () => WATCHLIST_SYMBOLS.map((s) => s.symbol),
    [],
  );
  const { data: prices } = useWatchlistPrices(symbols);

  const visible = useMemo(() => {
    const query = filter.trim().toLowerCase();
    return WATCHLIST_SYMBOLS.filter((s) => {
      if (category !== "All" && s.category !== category) return false;
      if (!query) return true;
      return s.label.toLowerCase().includes(query) || s.description.toLowerCase().includes(query);
    });
  }, [filter, category]);

  return (
    <div className="flex h-full min-w-0 flex-col border-r border-border">
      <div className="border-b border-border p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter watchlist..."
            className="w-full rounded-lg border border-border bg-surface-strong/[0.03] py-2 pl-8 pr-3 text-xs text-heading placeholder:text-subtle"
          />
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {WATCHLIST_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-md px-2 py-1 text-[11px] font-semibold transition-colors",
                category === c
                  ? "bg-accent/15 text-accent"
                  : "text-subtle hover:bg-surface-strong/[0.06] hover:text-heading",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-2 border-b border-border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-subtle">
        <span>Symbol</span>
        <span>Price</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {visible.length === 0 && (
          <p className="p-4 text-center text-xs text-subtle">No symbols match.</p>
        )}
        {visible.map((item) => {
          const quote = prices?.[item.symbol];
          const isUp = quote && quote.prevPrice !== null && quote.price !== null
            ? quote.price >= quote.prevPrice
            : null;
          const isActive = item.symbol === activeSymbol;

          return (
            <button
              key={item.symbol}
              type="button"
              onClick={() => onSelectSymbol(item.symbol)}
              className={cn(
                "flex w-full items-center justify-between gap-2 border-b border-border/60 px-3 py-2 text-left transition-colors",
                isActive ? "bg-accent/10" : "hover:bg-surface-strong/[0.05]",
              )}
            >
              <span className="flex min-w-0 items-center gap-2">
                <Star className="h-3.5 w-3.5 shrink-0 text-subtle" />
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-heading">
                    {item.label}
                  </span>
                  <span className="block truncate text-[10px] text-subtle">{item.description}</span>
                </span>
              </span>
              <span
                className={cn(
                  "shrink-0 font-mono text-xs font-semibold",
                  isUp === null
                    ? "text-subtle"
                    : isUp
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-rose-700 dark:text-rose-300",
                )}
              >
                {formatSymbolPrice(item.symbol, quote?.price ?? null)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
