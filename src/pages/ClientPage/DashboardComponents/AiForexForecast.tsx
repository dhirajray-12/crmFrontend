import { useEffect, useMemo, useState } from "react";
import { getConfiguredTimezone } from "@/utils/timezoneStore";
import { useQuery } from "@tanstack/react-query";
import {
  BrainCircuit,
  ChevronDown,
  Clock,
  Radar,
  RefreshCw,
  ShieldAlert,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  fetchMarketForecast,
  type AssetType,
  type ForecastCard,
} from "@/API/marketForecastApi";
import { cn } from "@/lib/utils";
import { Panel } from "./ui/Panel";
import { SectionHeader } from "./ui/SectionHeader";
import { StatCell, StatRow } from "./ui/StatTile";
import { Toolbar, ToolbarButton } from "./ui/Toolbar";
import { Pill } from "./ui/Pill";
import { ForecastDetailPanel } from "./ForecastDetailPanel";
import {
  ASSET_OPTIONS,
  fetchLivePrice,
  formatDuration,
  formatMarketPair,
  formatPrice,
  formatTimestamp,
  getDirectionClasses,
  getRecommendationLabel,
} from "./aiForexForecastUtils";

export default function AiForexForecast() {
  const [assetType, setAssetType] = useState<AssetType>("forex");
  const [selectedSymbol, setSelectedSymbol] = useState<string>("EURUSD");

  const { data, isLoading, error, refetch, dataUpdatedAt, isFetching } =
    useQuery({
      queryKey: ["marketForecast", assetType],
      queryFn: () => fetchMarketForecast(assetType),
      staleTime: 10 * 60 * 1000,
      refetchInterval: () =>
        typeof document !== "undefined" && document.visibilityState === "visible"
          ? 10 * 60 * 1000
          : false,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
      retry: 1,
    });

  const forecastCards = data?.forecasts ?? [];

  useEffect(() => {
    if (forecastCards.length === 0) {
      return;
    }

    const hasSelectedSymbol = forecastCards.some(
      (card) => card.symbol === selectedSymbol,
    );

    if (!hasSelectedSymbol) {
      setSelectedSymbol(forecastCards[0].symbol);
    }
  }, [forecastCards, selectedSymbol]);

  const selectedCard = useMemo(() => {
    if (forecastCards.length === 0) {
      return null;
    }

    return (
      forecastCards.find((card) => card.symbol === selectedSymbol) ??
      forecastCards[0]
    );
  }, [forecastCards, selectedSymbol]);

  const selectedAssetOption =
    ASSET_OPTIONS.find((option) => option.value === assetType) ?? ASSET_OPTIONS[0];
  const selectedClasses = selectedCard ? getDirectionClasses(selectedCard.direction) : null;
  const selectedPairLabel = selectedCard
    ? formatMarketPair(selectedCard.symbol, selectedCard.baseCurrency, selectedCard.quoteCurrency)
    : "--";
  const strongestOpportunity = data?.summary.strongestOpportunity ?? null;
  const highestRiskSetup = data?.summary.highestRiskSetup ?? null;

  const keyForexMarkets = useMemo(() => {
    if (assetType !== "forex") {
      return [];
    }

    const preferredSymbols = ["XAUUSD", "EURUSD", "GBPUSD", "USDJPY", "USDCHF"];

    return preferredSymbols
      .map((symbol) => forecastCards.find((card) => card.symbol === symbol))
      .filter((card): card is ForecastCard => Boolean(card));
  }, [assetType, forecastCards]);

  const lastUpdated = data?.generatedAt
    ? formatTimestamp(data.generatedAt)
    : dataUpdatedAt > 0
      ? new Date(dataUpdatedAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: getConfiguredTimezone(),
        })
      : null;

  const {
    data: livePrice,
    error: livePriceError,
    isFetching: isLivePriceFetching,
  } = useQuery({
    queryKey: ["marketLivePrice", selectedCard?.assetType, selectedCard?.symbol],
    queryFn: () => {
      if (!selectedCard) {
        throw new Error("No selected market available.");
      }

      return fetchLivePrice(selectedCard);
    },
    enabled: Boolean(selectedCard),
    staleTime: 45 * 1000,
    refetchInterval: () =>
      typeof document !== "undefined" && document.visibilityState === "visible"
        ? 60 * 1000
        : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const livePriceLabel = livePrice ? formatPrice(selectedCard?.symbol ?? "EURUSD", livePrice.price) : "--";
  const livePriceUpdatedAt = livePrice?.updatedAt ? formatTimestamp(livePrice.updatedAt) : null;
  const livePriceChangeText =
    livePrice?.change24hPct !== null && livePrice?.change24hPct !== undefined
      ? `${livePrice.change24hPct >= 0 ? "+" : ""}${livePrice.change24hPct.toFixed(2)}% today`
      : livePriceUpdatedAt
        ? `Updated ${livePriceUpdatedAt}`
        : "Refreshes every minute";
  const livePriceChangeTone =
    livePrice?.change24hPct !== null && livePrice?.change24hPct !== undefined
      ? livePrice.change24hPct >= 0
        ? "text-emerald-700 dark:text-emerald-400"
        : "text-rose-700 dark:text-rose-400"
      : "text-subtle";

  const busy = isLoading || isFetching;
  const statusInfo = busy
    ? { tone: "amber" as const, label: "Syncing", dot: true }
    : forecastCards.length === 0
      ? { tone: "neutral" as const, label: "Waiting for market data", dot: false }
      : data?.staleFallback
        ? { tone: "amber" as const, label: "Rate-limit fallback", dot: false }
        : data?.cached
          ? { tone: "sky" as const, label: "Cached market read", dot: false }
          : { tone: "emerald" as const, label: "Live market read", dot: true };

  return (
    <section className="p-1 sm:p-2 md:p-3">
      <div className="mx-auto max-w-7xl">
        <Panel>
          <SectionHeader
            eyebrow="Market Forecast"
            icon={BrainCircuit}
            title={data?.title ?? selectedAssetOption.title}
            description={selectedAssetOption.description}
            action={
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone={statusInfo.tone} dot={statusInfo.dot}>
                  {statusInfo.label}
                </Pill>
                <ToolbarButton onClick={() => refetch()} disabled={busy}>
                  <span className="inline-flex items-center gap-1.5">
                    <RefreshCw className={cn("h-3.5 w-3.5", busy && "animate-spin")} />
                    Refresh
                  </span>
                </ToolbarButton>
              </div>
            }
          />

          <div className="space-y-4 p-4 sm:p-5">
            <Toolbar>
              {ASSET_OPTIONS.map((option) => (
                <ToolbarButton
                  key={option.value}
                  active={option.value === assetType}
                  onClick={() => setAssetType(option.value)}
                >
                  {option.label}
                </ToolbarButton>
              ))}
            </Toolbar>

            {keyForexMarkets.length > 0 && (
              <Toolbar>
                {keyForexMarkets.map((market) => {
                  const isActive = selectedSymbol === market.symbol;
                  return (
                    <ToolbarButton
                      key={market.symbol}
                      active={isActive}
                      onClick={() => setSelectedSymbol(market.symbol)}
                    >
                      {market.label}
                      <span
                        className={cn(
                          "ml-1.5 font-mono tabular-nums",
                          isActive ? "text-accent-foreground" : getDirectionClasses(market.direction).accent,
                        )}
                      >
                        {market.confidence}%
                      </span>
                    </ToolbarButton>
                  );
                })}
              </Toolbar>
            )}

            <StatRow columns={4}>
              <StatCell label="Markets checked" icon={Radar} value={data?.summary.pairsAnalyzed ?? 0} />
              <StatCell label="Confidence" icon={Target} value={`${data?.summary.averageConfidence ?? 0}%`} />
              <StatCell
                label="Best market"
                icon={TrendingUp}
                value={strongestOpportunity?.symbol ?? "--"}
                trend={
                  strongestOpportunity
                    ? {
                        label: `${getRecommendationLabel(
                          strongestOpportunity.direction,
                          strongestOpportunity.recommendation,
                        )} at ${strongestOpportunity.confidence}%`,
                        direction: "flat",
                      }
                    : undefined
                }
              />
              <StatCell label="Last updated" icon={Clock} value={lastUpdated ?? "--"} />
            </StatRow>

            {error && (
              <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-100">
                {error.message}
              </div>
            )}

            {data?.staleFallback && data?.staleReason && (
              <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
                {data.staleReason}
                {data.cachePolicy?.backupRefreshSeconds ? (
                  <span className="ml-1 text-amber-100/80">
                    Backup cache window: {formatDuration(data.cachePolicy.backupRefreshSeconds)}.
                  </span>
                ) : null}
              </div>
            )}

            {!error && !isLoading && forecastCards.length === 0 && (
              <div className="rounded-xl border border-border bg-surface-strong/[0.03] p-5 text-sm text-subtle">
                No market forecast data is available yet from the backend service.
              </div>
            )}

            {forecastCards.length > 0 && selectedCard && selectedClasses && (
              <div className="grid gap-4 xl:grid-cols-[minmax(300px,0.95fr)_minmax(0,1.45fr)]">
                <div className="space-y-4">
                  <Panel>
                    <SectionHeader
                      eyebrow="Market radar"
                      icon={Radar}
                      title="Choose a market"
                      description="Pick one to see its simple forecast"
                    />
                    <div className="p-4 sm:p-5">
                      <label className="block">
                        <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.08em] text-subtle">
                          Symbol
                        </span>
                        <div className="relative">
                          <select
                            value={selectedCard.symbol}
                            onChange={(event) => setSelectedSymbol(event.target.value)}
                            className="w-full appearance-none rounded-xl border border-border bg-surface-strong/[0.04] px-4 py-2.5 pr-10 text-sm font-medium text-heading outline-none transition-colors focus:border-accent/40"
                          >
                            {forecastCards.map((card) => (
                              <option key={card.symbol} value={card.symbol} className="bg-surface-strong text-heading">
                                {formatMarketPair(card.symbol, card.baseCurrency, card.quoteCurrency)} •{" "}
                                {card.label} • {card.confidence}% •{" "}
                                {getRecommendationLabel(card.direction, card.recommendation)}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
                        </div>
                      </label>

                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-heading">{selectedPairLabel}</p>
                          <p className="mt-1 truncate text-xs text-subtle">
                            {selectedCard.label} •{" "}
                            {getRecommendationLabel(selectedCard.direction, selectedCard.recommendation)}
                          </p>
                        </div>
                        <Pill tone={selectedClasses.tone}>{selectedCard.confidence}%</Pill>
                      </div>

                      <div className="mt-3 rounded-xl border border-border bg-surface-strong/[0.03] px-3 py-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-subtle">
                            Live price
                          </span>
                          <span className="text-[11px] text-subtle">
                            {isLivePriceFetching ? "Updating..." : livePrice?.source ?? "Waiting"}
                          </span>
                        </div>
                        <p className="mt-1.5 font-mono text-lg font-semibold tabular-nums text-heading">
                          {livePriceLabel}
                        </p>
                        <p className={cn("mt-1 text-xs", livePriceChangeTone)}>
                          {livePriceError instanceof Error ? livePriceError.message : livePriceChangeText}
                        </p>
                      </div>
                    </div>
                  </Panel>

                  <Panel>
                    <SectionHeader
                      eyebrow="Risk view"
                      icon={ShieldAlert}
                      title="Volatility & data depth"
                      description={`For ${selectedPairLabel}`}
                    />
                    <div className="p-4 sm:p-5">
                      <StatRow columns={3}>
                        <StatCell label="Daily movement" value={`${selectedCard.volatilityPct.toFixed(2)}%`} />
                        <StatCell label="Expected move" value={`${selectedCard.projectedMovePct.toFixed(2)}%`} />
                        <StatCell label="Data used" value={`${selectedCard.dataPoints}d`} />
                      </StatRow>

                      {highestRiskSetup && (
                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
                          <div className="min-w-0">
                            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-subtle">
                              Highest risk (all markets)
                            </p>
                            <p className="mt-1 truncate text-sm font-semibold text-heading">
                              {highestRiskSetup.symbol}
                            </p>
                          </div>
                          <Pill tone="amber">
                            {getRecommendationLabel(highestRiskSetup.direction, highestRiskSetup.recommendation)}
                          </Pill>
                        </div>
                      )}
                    </div>
                  </Panel>
                </div>

                <ForecastDetailPanel
                  card={selectedCard}
                  disclaimer={data?.disclaimer}
                  marketDataProvider={data?.provider.marketData}
                />
              </div>
            )}

            {data?.provider && (
              <div className="flex flex-wrap gap-2">
                <Pill tone="neutral">Market data: {data.provider.marketData}</Pill>
                <Pill tone="neutral">News: {data.provider.news}</Pill>
                {data.cachePolicy?.marketRefreshSeconds ? (
                  <Pill tone="neutral">
                    Forecast cache: {formatDuration(data.cachePolicy.marketRefreshSeconds)}
                  </Pill>
                ) : null}
                {data.staleFallback ? <Pill tone="amber">Extended cache active</Pill> : null}
              </div>
            )}
          </div>
        </Panel>
      </div>
    </section>
  );
}
