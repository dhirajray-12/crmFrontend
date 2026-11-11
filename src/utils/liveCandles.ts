// src/utils/liveCandles.ts
//
// The trading bridge only gives us raw bid/ask ticks (see liveChartData.ts),
// not OHLC bars, so a "1m/5m/15m/.../1D" timeframe switcher on this data has
// to be built by bucketing ticks into candles client-side rather than by
// asking the bridge for a different resolution.
import type { TickPoint } from "@/utils/liveChartData";

export interface Candle {
  time: number; // unix seconds, start of the bucket
  open: number;
  high: number;
  low: number;
  close: number;
}

export type TimeframeKey = "1m" | "5m" | "15m" | "30m" | "1H" | "4H" | "1D";

export const TIMEFRAME_SECONDS: Record<TimeframeKey, number> = {
  "1m": 60,
  "5m": 5 * 60,
  "15m": 15 * 60,
  "30m": 30 * 60,
  "1H": 60 * 60,
  "4H": 4 * 60 * 60,
  "1D": 24 * 60 * 60,
};

export const aggregateTicksToCandles = (ticks: TickPoint[], bucketSeconds: number): Candle[] => {
  if (!ticks.length || bucketSeconds <= 0) return [];

  const candles: Candle[] = [];
  let current: Candle | null = null;

  for (const tick of ticks) {
    const bucketTime = Math.floor(tick.time / bucketSeconds) * bucketSeconds;

    if (!current || current.time !== bucketTime) {
      current = { time: bucketTime, open: tick.price, high: tick.price, low: tick.price, close: tick.price };
      candles.push(current);
      continue;
    }

    current.high = Math.max(current.high, tick.price);
    current.low = Math.min(current.low, tick.price);
    current.close = tick.price;
  }

  return candles;
};
