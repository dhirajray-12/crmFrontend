import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChartCandlestick,
  Radio,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import {
  fetchMarketForecast,
  type ForecastResponse,
} from "@/API/marketForecastApi";
import { Pill, type PillTone } from "./ui/Pill";

const DISMISS_KEY = "client-dashboard-market-sentiment-dismissed";

const getDirectionCopy = (direction?: string) => {
  if (direction === "bullish") {
    return "Bullish";
  }

  if (direction === "bearish") {
    return "Bearish";
  }

  return "Neutral";
};

const getDirectionTone = (direction?: string): PillTone => {
  if (direction === "bullish") {
    return "emerald";
  }

  if (direction === "bearish") {
    return "rose";
  }

  return "amber";
};

const directionTheme: Record<
  "bullish" | "bearish" | "neutral",
  {
    icon: typeof TrendingUp;
    glow: string;
    accentBar: string;
    ring: string;
    iconWrap: string;
    text: string;
  }
> = {
  bullish: {
    icon: TrendingUp,
    glow: "shadow-[0_0_50px_-12px_rgba(52,211,153,0.45)]",
    accentBar: "bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500",
    ring: "border-emerald-400/25",
    iconWrap: "bg-emerald-400/15 text-emerald-700 dark:text-emerald-300",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  bearish: {
    icon: TrendingDown,
    glow: "shadow-[0_0_50px_-12px_rgba(251,113,133,0.45)]",
    accentBar: "bg-gradient-to-r from-rose-400 via-pink-300 to-rose-500",
    ring: "border-rose-400/25",
    iconWrap: "bg-rose-400/15 text-rose-700 dark:text-rose-300",
    text: "text-rose-700 dark:text-rose-300",
  },
  neutral: {
    icon: TrendingUp,
    glow: "shadow-[0_0_50px_-12px_rgba(251,191,36,0.4)]",
    accentBar: "bg-gradient-to-r from-amber-400 via-orange-300 to-amber-500",
    ring: "border-amber-400/25",
    iconWrap: "bg-amber-400/15 text-amber-700 dark:text-amber-300",
    text: "text-amber-700 dark:text-amber-300",
  },
};

const getDirectionTheme = (direction?: string) => {
  if (direction === "bullish" || direction === "bearish") {
    return directionTheme[direction];
  }

  return directionTheme.neutral;
};

const buildSummaryLine = (payload: ForecastResponse | null, marketLabel: string) => {
  if (!payload) {
    return null;
  }

  const strongest = payload.summary.strongestOpportunity;
  const highestRisk = payload.summary.highestRiskSetup;

  if (strongest) {
    return `${marketLabel}: ${strongest.symbol} looks ${strongest.direction} with ${strongest.confidence}% confidence.`;
  }

  if (highestRisk) {
    return `${marketLabel}: ${highestRisk.symbol} is the riskiest setup right now at ${highestRisk.confidence}% confidence.`;
  }

  return `${marketLabel}: no clear sentiment signal right now.`;
};

export default function MarketSentimentPopup() {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return sessionStorage.getItem(DISMISS_KEY) === "true";
  });
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboardMarketSentimentPopup"],
    queryFn: async () => {
      const [forex, crypto] = await Promise.all([
        fetchMarketForecast("forex", { includeNews: true, newsLimit: 3 }),
        fetchMarketForecast("crypto", { includeNews: true, newsLimit: 3 }),
      ]);

      return { forex, crypto };
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  useEffect(() => {
    if (!dismissed || typeof window === "undefined") {
      return;
    }

    sessionStorage.setItem(DISMISS_KEY, "true");
  }, [dismissed]);

  const handleDismiss = () => {
    setLeaving(true);
    window.setTimeout(() => setDismissed(true), 200);
  };

  const popupData = useMemo(() => {
    if (!data) {
      return null;
    }

    const forexSignal =
      data.forex.summary.strongestOpportunity || data.forex.summary.highestRiskSetup;
    const cryptoSignal =
      data.crypto.summary.strongestOpportunity || data.crypto.summary.highestRiskSetup;

    const headline =
      [forexSignal, cryptoSignal]
        .filter(Boolean)
        .sort((left, right) => (right?.confidence || 0) - (left?.confidence || 0))[0] ||
      null;

    const topHeadline =
      data.forex.forecasts.find((item) => item.symbol === forexSignal?.symbol)?.recentHeadlines[0] ||
      data.crypto.forecasts.find((item) => item.symbol === cryptoSignal?.symbol)?.recentHeadlines[0] ||
      null;

    return {
      headline,
      topHeadline,
      forexLine: buildSummaryLine(data.forex, "Forex"),
      cryptoLine: buildSummaryLine(data.crypto, "Crypto"),
    };
  }, [data]);

  useEffect(() => {
    if (dismissed || isLoading || !popupData?.headline) {
      return;
    }

    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [dismissed, isLoading, popupData?.headline]);

  if (dismissed || isLoading || !popupData?.headline) {
    return null;
  }

  const theme = getDirectionTheme(popupData.headline.direction);
  const DirectionIcon = theme.icon;
  const confidence = Math.max(0, Math.min(100, popupData.headline.confidence || 0));

  return (
    <div className="fixed bottom-4 right-4 z-40 w-[min(23rem,calc(100vw-1.5rem))] sm:bottom-6 sm:right-6">
      <div
        className={`transform transition-all duration-300 ease-out ${
          visible && !leaving
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0"
        }`}
      >
        <div
          className={`relative overflow-hidden rounded-2xl border ${theme.ring} bg-surface-strong backdrop-blur-xl ${theme.glow}`}
        >
          <div className={`h-1 w-full ${theme.accentBar}`} />

          <div className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
                <Radio className="h-3 w-3 text-accent motion-safe:animate-pulse" />
                Live market signal
              </div>

              <button
                type="button"
                onClick={handleDismiss}
                className="shrink-0 -mr-1 -mt-1 rounded-full p-1.5 text-subtle transition-colors hover:bg-surface-strong/[0.08] hover:text-heading"
                aria-label="Dismiss market sentiment popup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${theme.iconWrap}`}>
                <DirectionIcon className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-bold text-heading">
                  {popupData.headline.symbol}
                </p>
                <p className="text-xs text-subtle">Strongest opportunity right now</p>
              </div>

              <div className="shrink-0 text-right">
                <p className={`text-2xl font-extrabold tabular-nums leading-none ${theme.text}`}>
                  {confidence}%
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-subtle">confidence</p>
              </div>
            </div>

            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-strong/[0.06]">
              <div
                className={`h-full rounded-full ${theme.accentBar} transition-all duration-700 ease-out`}
                style={{ width: `${confidence}%` }}
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Pill tone={getDirectionTone(popupData.headline.direction)}>
                {getDirectionCopy(popupData.headline.direction)}
              </Pill>
              <Pill tone="neutral">{popupData.headline.label}</Pill>
            </div>

            <div className="mt-4 space-y-2.5">
              <div className="rounded-xl border border-border bg-surface-strong/[0.03] p-3">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.1em] text-subtle">
                  <ChartCandlestick className="h-3.5 w-3.5 text-accent" />
                  Snapshot
                </div>
                <p className="mt-2 text-sm leading-6 text-subtle">{popupData.forexLine}</p>
                <p className="mt-1 text-sm leading-6 text-subtle">{popupData.cryptoLine}</p>
              </div>

              {popupData.topHeadline ? (
                <div className="rounded-xl border border-amber-400/15 bg-amber-400/[0.06] p-3">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.1em] text-amber-700 dark:text-amber-200/80">
                    <Sparkles className="h-3.5 w-3.5" />
                    News mood
                  </div>
                  <p className="mt-2 text-sm font-medium text-heading">{popupData.topHeadline.title}</p>
                  <p className="mt-1 text-xs text-amber-700 dark:text-amber-200/70">
                    {popupData.topHeadline.source} · {popupData.topHeadline.sentimentLabel}
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-surface-strong/[0.03] p-3">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.1em] text-subtle">
                    <ShieldAlert className="h-3.5 w-3.5 text-amber-700 dark:text-amber-300" />
                    Note
                  </div>
                  <p className="mt-2 text-sm text-subtle">
                    This popup falls back to technical market direction when news sentiment is not available.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
