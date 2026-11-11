import { useQuery } from "@tanstack/react-query";
import { liveTradingApi } from "@/services/liveTrading.service";
import { normalizeTicks } from "@/utils/liveChartData";

export interface WatchlistPrice {
  price: number | null;
  prevPrice: number | null;
}

// There's no bulk quotes endpoint on the bridge - only per-symbol tick
// history - so the watchlist's live prices come from the same
// chart-data call the chart itself uses, just a very short window (we only
// need the latest tick) and one request per symbol. Kept to a short list
// of known-good symbols and a slower interval than the chart's own poll so
// this doesn't multiply request volume unreasonably.
export const useWatchlistPrices = (symbols: string[]) => {
  return useQuery({
    queryKey: ["watchlistPrices", symbols],
    queryFn: async () => {
      const entries = await Promise.all(
        symbols.map(async (symbol): Promise<[string, WatchlistPrice]> => {
          try {
            const raw = await liveTradingApi.getChartData({ symbol, start: 0, range: 120 });
            const { ticks } = normalizeTicks(raw);
            if (!ticks.length) return [symbol, { price: null, prevPrice: null }];
            const last = ticks[ticks.length - 1].price;
            const prev = ticks.length > 1 ? ticks[ticks.length - 2].price : last;
            return [symbol, { price: last, prevPrice: prev }];
          } catch {
            return [symbol, { price: null, prevPrice: null }];
          }
        }),
      );
      return Object.fromEntries(entries) as Record<string, WatchlistPrice>;
    },
    enabled: symbols.length > 0,
    staleTime: 1500,
    refetchInterval: 2000,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
