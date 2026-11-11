// src/components/TradingTerminal/TradingChart.tsx
//
// Candlestick chart built from the trading bridge's raw tick history -
// there's no OHLC endpoint, so ticks are bucketed into candles client-side
// per the selected timeframe (see utils/liveCandles.ts). A fixed 6-hour
// tick window is fetched regardless of timeframe (fetching enough raw
// ticks to fill a 1D chart with real history isn't practical over this
// endpoint), so higher timeframes will show fewer candles - that's a
// limitation of the tick-only backend, not a bug here.
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  type CandlestickData,
  type IChartApi,
  type ISeriesApi,
  type Time,
} from "lightweight-charts";
import { Loader2 } from "lucide-react";
import { useLatestTicks, useLiveChartData } from "@/hooks/useLiveChartData";
import type { TickPoint } from "@/utils/liveChartData";
import { aggregateTicksToCandles, TIMEFRAME_SECONDS, type TimeframeKey } from "@/utils/liveCandles";
import { decimalsForSymbol } from "./symbols";
import { cn } from "@/lib/utils";

const TIMEFRAMES: TimeframeKey[] = ["1m", "5m", "15m", "30m", "1H", "4H", "1D"];
const HISTORY_RANGE_SECONDS = 6 * 60 * 60; // fixed 6h tick window for every timeframe

interface TradingChartProps {
  symbol: string;
  onLastPriceChange: (price: number | null) => void;
}

export default function TradingChart({ symbol, onLastPriceChange }: TradingChartProps) {
  const [timeframe, setTimeframe] = useState<TimeframeKey>("1m");
  const { data: chartData, isLoading, error } = useLiveChartData(symbol, HISTORY_RANGE_SECONDS);
  // The 1s-polled live feed - a tiny window, not the whole history (see
  // useLiveChartData.ts for why re-fetching hours of ticks every second
  // was the slow part).
  const { data: tailData } = useLatestTicks(symbol);

  const ticks = useMemo(() => {
    const history = chartData?.ticks ?? [];
    const tail = tailData?.ticks ?? [];
    if (!tail.length) return history;

    // Merge by time, tail wins on overlap - dedup rather than concat so a
    // tick returned by both windows doesn't get double-counted.
    const byTime = new Map<number, TickPoint>();
    for (const t of history) byTime.set(t.time, t);
    for (const t of tail) byTime.set(t.time, t);
    return Array.from(byTime.values()).sort((a, b) => a.time - b.time);
  }, [chartData, tailData]);

  const candles = useMemo(
    () => aggregateTicksToCandles(ticks, TIMEFRAME_SECONDS[timeframe]),
    [ticks, timeframe],
  );

  const lastCandle = candles.length ? candles[candles.length - 1] : null;
  const decimals = decimalsForSymbol(symbol);

  // Feed the quote (Buy/Sell buttons, price pill) straight from the newest
  // raw tick rather than through the candle bucket - going via `candles`
  // added a layer of derived state that only updated when the memo
  // recomputed, which was adding a visible extra beat of lag on top of the
  // 1s poll itself.
  const latestTickPrice = ticks.length ? ticks[ticks.length - 1].price : null;

  useEffect(() => {
    onLastPriceChange(latestTickPrice);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestTickPrice]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick", Time> | null>(null);
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!viewportRef.current || typeof ResizeObserver === "undefined") return;
    const updateSize = () => {
      if (!viewportRef.current) return;
      const nextWidth = Math.floor(viewportRef.current.clientWidth);
      const nextHeight = Math.floor(viewportRef.current.clientHeight);
      setChartSize((current) =>
        current.width === nextWidth && current.height === nextHeight
          ? current
          : { width: nextWidth, height: nextHeight },
      );
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(viewportRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!containerRef.current || chartSize.width === 0 || chartSize.height === 0) return;

    if (!chartRef.current) {
      const chart = createChart(containerRef.current, {
        width: chartSize.width,
        height: chartSize.height,
        layout: {
          background: { type: ColorType.Solid, color: "transparent" },
          textColor: "#94a3b8",
        },
        grid: {
          vertLines: { color: "rgba(148, 163, 184, 0.08)" },
          horzLines: { color: "rgba(148, 163, 184, 0.08)" },
        },
        rightPriceScale: { borderColor: "rgba(148, 163, 184, 0.15)" },
        timeScale: { borderColor: "rgba(148, 163, 184, 0.15)", timeVisible: true },
      });

      const series = chart.addSeries(CandlestickSeries, {
        upColor: "#22c55e",
        downColor: "#ef4444",
        borderUpColor: "#16a34a",
        borderDownColor: "#dc2626",
        wickUpColor: "#16a34a",
        wickDownColor: "#dc2626",
        priceLineVisible: true,
        lastValueVisible: true,
      });

      chartRef.current = chart;
      seriesRef.current = series;
    } else {
      chartRef.current.applyOptions({ width: chartSize.width, height: chartSize.height });
    }
  }, [chartSize.width, chartSize.height]);

  useEffect(() => {
    return () => {
      chartRef.current?.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current) return;
    if (!candles.length) {
      seriesRef.current.setData([]);
      return;
    }

    const data: CandlestickData<Time>[] = candles.map((c) => ({
      time: c.time as Time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
    seriesRef.current.setData(data);
    chartRef.current?.timeScale().fitContent();
  }, [candles]);

  const noDataMessage = !isLoading && chartData && !chartData.hasData
    ? chartData.message || "No recent price data for this symbol - market may be closed right now."
    : null;

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            type="button"
            onClick={() => setTimeframe(tf)}
            className={cn(
              "rounded-md px-2 py-1 text-xs font-semibold transition-colors",
              timeframe === tf
                ? "bg-accent/15 text-accent"
                : "text-subtle hover:bg-surface-strong/[0.06] hover:text-heading",
            )}
          >
            {tf}
          </button>
        ))}
      </div>

      {lastCandle && (
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-3 py-1.5 text-xs">
          <span className="text-subtle">O <span className="font-mono text-heading">{lastCandle.open.toFixed(decimals)}</span></span>
          <span className="text-subtle">H <span className="font-mono text-emerald-700 dark:text-emerald-300">{lastCandle.high.toFixed(decimals)}</span></span>
          <span className="text-subtle">L <span className="font-mono text-rose-700 dark:text-rose-300">{lastCandle.low.toFixed(decimals)}</span></span>
          <span className="text-subtle">C <span className="font-mono text-heading">{lastCandle.close.toFixed(decimals)}</span></span>
        </div>
      )}

      <div ref={viewportRef} className="relative min-h-0 flex-1 overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface-strong/40">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center p-4 text-center text-sm text-rose-700 dark:text-rose-300">
            {error.message}
          </div>
        )}
        {!isLoading && !error && noDataMessage && (
          <div className="absolute inset-0 z-10 flex items-center justify-center p-4 text-center text-sm text-subtle">
            {noDataMessage}
          </div>
        )}
        <div ref={containerRef} className="h-full w-full" />
      </div>
    </div>
  );
}
