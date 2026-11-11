import { useQuery } from "@tanstack/react-query";
import { liveTradingApi } from "@/services/liveTrading.service";
import { normalizeTicks } from "@/utils/liveChartData";

// "range" is seconds of recent tick history (not a candle count) - a closed
// market (forex/metals outside session hours) returns zero ticks for a
// short window, so default to a wide one (4 hours) rather than a
// deceptively small value.
const DEFAULT_RANGE_SECONDS = 4 * 60 * 60;

// The base history fetch (hours of ticks) is expensive - re-running it
// every second (as this used to do) meant re-downloading and
// re-normalizing the whole multi-hour tick window on every tick, which is
// exactly what was making the chart feel slow. It's fetched once per
// symbol/range instead; see useLatestTicks below for the actual live feed.
export const useLiveChartData = (symbol: string, range: number = DEFAULT_RANGE_SECONDS) => {
  return useQuery({
    queryKey: ["liveChartData", symbol, range],
    queryFn: async () => {
      const raw = await liveTradingApi.getChartData({ symbol, start: 0, range });
      return normalizeTicks(raw);
    },
    enabled: !!symbol,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

// A short, cheap window (recent seconds only) polled at 1s - this is the
// actual live feed. Merge its ticks onto the base history's instead of
// re-fetching the whole history on every poll.
const LIVE_TAIL_RANGE_SECONDS = 30;

export const useLatestTicks = (symbol: string) => {
  return useQuery({
    queryKey: ["liveChartDataTail", symbol],
    queryFn: async () => {
      const raw = await liveTradingApi.getChartData({
        symbol,
        start: 0,
        range: LIVE_TAIL_RANGE_SECONDS,
      });
      return normalizeTicks(raw);
    },
    enabled: !!symbol,
    staleTime: 1000,
    refetchInterval: 1000,
    refetchOnWindowFocus: false,
    retry: 0,
  });
};
