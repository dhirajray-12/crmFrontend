import { useDeferredValue, useEffect, useMemo } from "react";
import {
  Activity,
  BarChart3,
  CandlestickChart,
  CircleDot,
  Layers3,
  RefreshCw,
  Wallet2,
  Waves,
} from "lucide-react";
import { useForexCryptoStore } from "@/Store/forexCryptoStore";
import { getConfiguredTimezone } from "@/utils/timezoneStore";
import {
  normalizeSymbol,
  processTradingData,
  useTradingData,
} from "@/hooks/useTradingData";
import {
  filterDataByTimeRange,
  formatPrice,
  getLinesToDisplay,
  getVisibleTradeMarkers,
} from "@/utils/chartUtils";
import { ChartStyles } from "@/components/ForexCryptoChart/ChartStyles";
import { LoadingIndicator } from "@/components/ForexCryptoChart/shared/LoadingIndicator";
import { ErrorDisplay } from "@/components/ForexCryptoChart/shared/ErrorDisplay";
import { EmptyState } from "@/components/ForexCryptoChart/shared/EmptyState";
import { CustomDateRange } from "@/components/ForexCryptoChart/filters/CustomDateRange";
import { ChartRenderer } from "@/components/ForexCryptoChart/Charts/ChartRenderer";
import type { PriceData } from "@/types/forexCrypto.types";
import { DEFAULT_INSTRUMENTS } from "@/types/forexCrypto.types";
import { Panel } from "./ui/Panel";
import { SectionHeader } from "./ui/SectionHeader";
import { StatCell, StatRow } from "./ui/StatTile";
import { Toolbar, ToolbarButton } from "./ui/Toolbar";
import { Pill } from "./ui/Pill";
import { cn } from "@/lib/utils";

const timeFilters = [
  "Last 7 Days",
  "Last 14 Days",
  "Last 30 Days",
  "Last 60 Days",
  "Last 90 Days",
  "CUSTOM",
] as const;

const chartModes = [
  {
    type: "line" as const,
    label: "Line",
    icon: Activity,
  },
  {
    type: "area" as const,
    label: "Area",
    icon: Waves,
  },
  {
    type: "bar" as const,
    label: "Bar",
    icon: BarChart3,
  },
];

const ForexCryptoChart: React.FC = () => {
  const {
    timeFilter,
    customDateRange,
    chartType,
    selectedSymbols,
    isLive,
    setTimeFilter,
    setCustomDateRange,
    setChartType,
    setIsLive,
    handleSymbolChange,
  } = useForexCryptoStore();

  const { data, isLoading, error, refetch, dataUpdatedAt } = useTradingData();

  // The stat row below only needs `data.statistics`, which the backend
  // already computed — it doesn't depend on processTradingData at all. But
  // both used to live behind the same `chartData.length > 0` gate, so the
  // (synchronous, O(trades)) per-symbol chart/marker crunch below had to
  // finish before the stat cards could paint. useDeferredValue lets React
  // commit a render using the *previous* chartData while it works out the
  // new one in the background, so a fresh fetch's stat numbers show up
  // immediately instead of waiting on the chart to catch up.
  const deferredData = useDeferredValue(data);

  const {
    chartData,
    availableSymbols,
    updatedInstruments: instruments,
  } = useMemo(() => {
    if (!deferredData) {
      return {
        chartData: [] as PriceData[],
        availableSymbols: [] as string[],
        updatedInstruments: DEFAULT_INSTRUMENTS,
      };
    }

    return processTradingData(deferredData, DEFAULT_INSTRUMENTS);
  }, [deferredData]);

  // Update live status
  useEffect(() => {
    setIsLive(timeFilter === "Last 7 Days" && chartData.length > 0);
  }, [timeFilter, chartData.length, setIsLive]);

  const filteredData = useMemo(
    () => filterDataByTimeRange(chartData, timeFilter, customDateRange),
    [chartData, timeFilter, customDateRange],
  );

  const linesToDisplay = useMemo(
    () => getLinesToDisplay(availableSymbols, selectedSymbols, instruments),
    [availableSymbols, selectedSymbols, instruments],
  );

  const visibleTradeMarkers = useMemo(
    () => getVisibleTradeMarkers(filteredData, selectedSymbols),
    [filteredData, selectedSymbols],
  );

  const recentTradeMarkers = useMemo(
    () =>
      [...visibleTradeMarkers]
        .sort((a, b) => b.time.localeCompare(a.time))
        .slice(0, 4),
    [visibleTradeMarkers],
  );

  const handleRefresh = () => {
    refetch();
  };

  const hasData = chartData.length > 0;
  // Independent of hasData/chartData on purpose — the stat row only needs
  // the server-computed totals in data.statistics, so it shouldn't wait on
  // (now-deferred) chart/marker processing to know whether to show them.
  const hasStats = (data?.statistics?.totalTrades ?? 0) > 0;
  const selectedCount = selectedSymbols.includes("ALL")
    ? availableSymbols.length
    : selectedSymbols.length;

  const symbolOptions = useMemo(
    () => ["ALL", ...availableSymbols],
    [availableSymbols],
  );
  const lastUpdated = dataUpdatedAt > 0 ? new Date(dataUpdatedAt) : null;
  const totalProfit = data?.statistics?.totalProfit ?? 0;

  return (
    <>
      <ChartStyles lines={linesToDisplay} />

      <Panel>
        <SectionHeader
          eyebrow="Market terminal"
          icon={CandlestickChart}
          title="Forex & Crypto"
          description="Live price feed with trade markers across your tracked symbols"
          action={
            <>
              <Pill tone={isLive && hasData ? "sky" : "neutral"} dot={isLive && hasData}>
                {isLive && hasData ? "Live" : hasData ? "Delayed" : "Idle"}
              </Pill>
              <ToolbarButton onClick={handleRefresh} disabled={isLoading}>
                <span className="inline-flex items-center gap-1.5">
                  <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
                  Refresh
                </span>
              </ToolbarButton>
            </>
          }
        />

        <div className="p-4 sm:p-5">
          {data?.statistics && hasStats && (
            <StatRow columns={4} className="mb-4">
              <StatCell
                label="Total trades"
                icon={Activity}
                value={data.statistics.totalTrades}
              />
              <StatCell
                label="Open trades"
                icon={CircleDot}
                value={data.statistics.totalOpenTrades}
              />
              <StatCell
                label="Closed trades"
                icon={Layers3}
                value={data.statistics.totalClosedTrades}
              />
              <StatCell
                label="Total profit"
                icon={Wallet2}
                value={totalProfit.toLocaleString()}
                tone={totalProfit >= 0 ? "positive" : "negative"}
              />
            </StatRow>
          )}

          {error && <ErrorDisplay error={error.message} />}

          {isLoading && <LoadingIndicator />}

          {!hasData && !isLoading && !error && <EmptyState />}

          {hasData && (
            <div className="grid gap-4 xl:grid-cols-[minmax(260px,340px)_minmax(0,1fr)]">
              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-surface-strong/[0.02] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-subtle">
                      Symbols
                    </p>
                    <span className="text-[11px] text-subtle">
                      {selectedSymbols.includes("ALL")
                        ? "All"
                        : `${selectedCount} of ${availableSymbols.length}`}
                    </span>
                  </div>

                  <Toolbar className="mt-3">
                    {symbolOptions.map((symbol) => {
                      const instrument = instruments.find(
                        (item) => normalizeSymbol(item.name) === symbol,
                      );
                      const active = selectedSymbols.includes(symbol);
                      const label =
                        symbol === "ALL" ? "ALL" : instrument?.name || symbol;

                      return (
                        <ToolbarButton
                          key={symbol}
                          active={active}
                          onClick={() => handleSymbolChange(symbol)}
                        >
                          {label}
                        </ToolbarButton>
                      );
                    })}
                  </Toolbar>
                </div>

                <div className="rounded-xl border border-border bg-surface-strong/[0.02] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-subtle">
                    Time range
                  </p>

                  <Toolbar className="mt-3">
                    {timeFilters.map((filter) => (
                      <ToolbarButton
                        key={filter}
                        active={timeFilter === filter}
                        onClick={() => setTimeFilter(filter)}
                      >
                        {filter === "CUSTOM" ? "Custom range" : filter}
                      </ToolbarButton>
                    ))}
                  </Toolbar>

                  {timeFilter === "CUSTOM" && (
                    <CustomDateRange
                      start={customDateRange.start}
                      end={customDateRange.end}
                      onStartChange={(value) =>
                        setCustomDateRange({
                          ...customDateRange,
                          start: value,
                        })
                      }
                      onEndChange={(value) =>
                        setCustomDateRange({
                          ...customDateRange,
                          end: value,
                        })
                      }
                    />
                  )}
                </div>

                <div className="rounded-xl border border-border bg-surface-strong/[0.02] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-subtle">
                    Visualization
                  </p>

                  <Toolbar className="mt-3">
                    {chartModes.map(({ type, label, icon: Icon }) => (
                      <ToolbarButton
                        key={type}
                        active={chartType === type}
                        onClick={() => setChartType(type)}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <Icon className="h-3.5 w-3.5" />
                          {label}
                        </span>
                      </ToolbarButton>
                    ))}
                  </Toolbar>
                </div>

                <div className="rounded-xl border border-border bg-surface-strong/[0.02] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-subtle">
                    Trade marker guide
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Pill tone="emerald">IN = trade opened</Pill>
                    <Pill tone="rose">OUT = trade closed</Pill>
                    <Pill tone="sky">LIVE = current open price</Pill>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-subtle">
                    Hover any point to see the traded volume, execution side,
                    and the exact entry or exit price for that moment.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface-strong/[0.02] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-subtle">
                      Price chart
                    </p>
                    <p className="mt-1 text-xs text-subtle">
                      {chartType.charAt(0).toUpperCase() + chartType.slice(1)}{" "}
                      mode &middot; {linesToDisplay.length} active line
                      {linesToDisplay.length === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Pill>{filteredData.length} data points</Pill>
                    <Pill>{visibleTradeMarkers.length} trade markers</Pill>
                    {lastUpdated && (
                      <Pill>
                        Updated{" "}
                        {lastUpdated.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: getConfiguredTimezone(),
                        })}
                      </Pill>
                    )}
                  </div>
                </div>

                <div className="glowing-chart mt-4 h-72 rounded-xl border border-border bg-surface p-2 sm:h-80 sm:p-3 md:h-96">
                  <ChartRenderer
                    data={filteredData}
                    lines={linesToDisplay}
                    chartType={chartType}
                  />
                </div>

                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-subtle">
                    Recent trade events
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {recentTradeMarkers.length > 0 ? (
                      recentTradeMarkers.map((marker) => (
                        <div
                          key={marker.id}
                          className="rounded-lg border border-border bg-surface-strong/[0.02] px-3 py-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-heading">
                              {marker.symbol} {marker.type.toUpperCase()}
                            </p>
                            <span className="text-[11px] uppercase tracking-[0.1em] text-subtle">
                              {marker.direction}
                            </span>
                          </div>
                          <p className="mt-1 font-mono text-sm tabular-nums text-subtle">
                            {marker.volume} at{" "}
                            {formatPrice(marker.price, marker.symbol)}
                          </p>
                          <p className="mt-1 text-[11px] text-subtle">
                            {new Date(marker.time).toLocaleString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-lg border border-border bg-surface-strong/[0.02] p-4 sm:col-span-2">
                        <p className="text-sm font-medium text-heading">
                          No recent trade events in this range
                        </p>
                        <p className="mt-1 text-xs text-subtle">
                          Try a wider time filter or switch symbols to surface
                          fresh entries and exits.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Panel>
    </>
  );
};

export default ForexCryptoChart;
