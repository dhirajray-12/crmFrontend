const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const getTradingForecastBaseUrl = () => {
  const normalizedBaseUrl = String(API_BASE_URL || "").replace(/\/+$/, "");

  if (!normalizedBaseUrl) {
    return "/api/trading/market-forecast";
  }

  if (normalizedBaseUrl.endsWith("/api")) {
    return `${normalizedBaseUrl}/trading/market-forecast`;
  }

  return `${normalizedBaseUrl}/api/trading/market-forecast`;
};

export type AssetType = "forex" | "crypto";
export type ForecastDirection = "bullish" | "bearish" | "neutral";
export type ForecastRecommendation = "favorable" | "watch" | "avoid";

export type ForecastHeadline = {
  title: string;
  source: string;
  url: string;
  timePublished: string;
  sentimentLabel: string;
  sentimentScore: number;
};

export type ForecastCard = {
  assetType: AssetType;
  symbol: string;
  label: string;
  baseCurrency: string;
  quoteCurrency: string;
  currentPrice: number;
  support: number;
  resistance: number;
  shortTrendPct: number;
  mediumTrendPct: number;
  momentumVsSmaPct: number;
  volatilityPct: number;
  projectedMovePct: number;
  newsSentimentScore: number;
  newsCoverage: number;
  confidence: number;
  direction: ForecastDirection;
  recommendation: ForecastRecommendation;
  reasons: string[];
  recentHeadlines: ForecastHeadline[];
  lastUpdated: string;
  dataPoints: number;
};

export type ForecastSummaryItem = {
  symbol: string;
  label: string;
  direction: ForecastDirection;
  recommendation: ForecastRecommendation;
  confidence: number;
};

export type ForecastResponse = {
  assetType: AssetType;
  title: string;
  generatedAt: string;
  provider: {
    marketData: string;
    news: string;
  };
  summary: {
    pairsAnalyzed: number;
    bullishPairs: number;
    bearishPairs: number;
    favorableSetups: number;
    avoidSetups: number;
    averageConfidence: number;
    strongestOpportunity: ForecastSummaryItem | null;
    highestRiskSetup: ForecastSummaryItem | null;
  };
  forecasts: ForecastCard[];
  cachePolicy?: {
    marketRefreshSeconds: number;
    newsRefreshSeconds: number;
    backupRefreshSeconds: number;
    includeNewsByDefault: boolean;
  };
  disclaimer: string;
  cached?: boolean;
  staleFallback?: boolean;
  staleReason?: string | null;
};

export async function fetchMarketForecast(
  assetType: AssetType,
  options?: {
    includeNews?: boolean;
    newsLimit?: number;
    refresh?: boolean;
    symbols?: string[];
  },
): Promise<ForecastResponse> {
  const url = new URL(getTradingForecastBaseUrl(), window.location.origin);
  url.searchParams.set("assetType", assetType);
  url.searchParams.set(
    "includeNews",
    String(options?.includeNews ?? false),
  );
  url.searchParams.set("newsLimit", String(options?.newsLimit ?? 3));

  if (options?.refresh) {
    url.searchParams.set("refresh", "true");
  }

  if (options?.symbols?.length) {
    url.searchParams.set("symbols", options.symbols.join(","));
  }

  const response = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      "x-active-role": sessionStorage.getItem("active_role") || "",
    },
    credentials: "include",
  });

  const result = await response.json();

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || "Failed to fetch market outlook.");
  }

  return result.data;
}
