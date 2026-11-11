import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { getConfiguredTimezone } from "@/utils/timezoneStore";
import type { LucideIcon } from "lucide-react";
import type {
  AssetType,
  ForecastCard,
  ForecastDirection,
  ForecastRecommendation,
} from "@/API/marketForecastApi";
import type { PillTone } from "./ui/Pill";

export type LivePriceSnapshot = {
  price: number;
  change24hPct: number | null;
  updatedAt: string | null;
  source: string;
};

export const ASSET_OPTIONS: Array<{
  value: AssetType;
  label: string;
  title: string;
  description: string;
}> = [
  {
    value: "forex",
    label: "Forex",
    title: "Currency market outlook",
    description:
      "Tracks gold and major forex markets like XAU/USD, EUR/USD, GBP/USD, and USD/JPY.",
  },
  {
    value: "crypto",
    label: "Crypto",
    title: "Crypto market outlook",
    description: "Tracks major crypto pairs like BTC/USD and ETH/USD.",
  },
];

export const CRYPTO_LIVE_PRICE_IDS: Record<string, string> = {
  BTCUSD: "bitcoin",
  ETHUSD: "ethereum",
  SOLUSD: "solana",
  XRPUSD: "ripple",
  BNBUSD: "binancecoin",
  ADAUSD: "cardano",
};

export interface DirectionClasses {
  tone: PillTone;
  accent: string;
  bar: string;
  icon: LucideIcon;
}

export const getDirectionClasses = (direction: ForecastDirection): DirectionClasses => {
  if (direction === "bullish") {
    return {
      tone: "emerald",
      accent: "text-emerald-400",
      bar: "from-emerald-400 to-cyan-400",
      icon: ArrowUpRight,
    };
  }

  if (direction === "bearish") {
    return {
      tone: "rose",
      accent: "text-rose-400",
      bar: "from-rose-400 to-rose-300",
      icon: ArrowDownRight,
    };
  }

  return {
    tone: "neutral",
    accent: "text-slate-300",
    bar: "from-slate-400 to-slate-300",
    icon: ArrowRight,
  };
};

export const getRecommendationLabel = (
  direction: ForecastDirection,
  recommendation: ForecastRecommendation,
) => {
  if (recommendation === "favorable") {
    return direction === "bullish" ? "Good chance to rise" : "Good chance to fall";
  }

  if (recommendation === "avoid") {
    return "High risk";
  }

  if (direction === "bullish") {
    return "May move up";
  }

  if (direction === "bearish") {
    return "May move down";
  }

  return "Likely to stay steady";
};

export const formatPrice = (symbol: string, price: number) => {
  if (
    symbol.includes("XAU") ||
    symbol.includes("XAG") ||
    symbol.includes("XPT") ||
    symbol.includes("XPD")
  ) {
    return price.toFixed(2);
  }

  if (symbol.includes("JPY")) {
    return price.toFixed(3);
  }

  if (price >= 1000) {
    return price.toFixed(2);
  }

  if (price >= 1) {
    return price.toFixed(3);
  }

  return price.toFixed(5);
};

export const formatTimestamp = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString([], {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
    timeZone: getConfiguredTimezone(),
  });
};

export const formatDuration = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "unknown";
  }

  if (seconds % 3600 === 0) {
    const hours = seconds / 3600;
    return `${hours}h`;
  }

  if (seconds % 60 === 0) {
    const minutes = seconds / 60;
    return `${minutes}m`;
  }

  return `${seconds}s`;
};

export const formatMarketPair = (
  symbol: string,
  baseCurrency?: string,
  quoteCurrency?: string,
) => {
  if (baseCurrency && quoteCurrency) {
    return `${baseCurrency}/${quoteCurrency}`;
  }

  const normalized = String(symbol || "").replace(/[^A-Za-z]/g, "").toUpperCase();
  if (normalized.length >= 6) {
    return `${normalized.slice(0, 3)}/${normalized.slice(3, 6)}`;
  }

  return symbol;
};

export const fetchLivePrice = async (
  card: ForecastCard,
): Promise<LivePriceSnapshot> => {
  if (card.assetType === "crypto") {
    const coinId = CRYPTO_LIVE_PRICE_IDS[card.symbol];
    if (!coinId) {
      throw new Error("Live crypto price is not supported for this symbol.");
    }

    const url = new URL("https://api.coingecko.com/api/v3/simple/price");
    url.searchParams.set("ids", coinId);
    url.searchParams.set("vs_currencies", "usd");
    url.searchParams.set("include_24hr_change", "true");
    url.searchParams.set("include_last_updated_at", "true");
    url.searchParams.set("precision", "full");

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error("Failed to fetch live crypto price.");
    }

    const result = await response.json();
    const payload = result?.[coinId];
    const price = Number(payload?.usd);

    if (!Number.isFinite(price)) {
      throw new Error("Invalid live crypto price received.");
    }

    return {
      price,
      change24hPct: Number.isFinite(Number(payload?.usd_24h_change))
        ? Number(payload.usd_24h_change)
        : null,
      updatedAt: payload?.last_updated_at
        ? new Date(Number(payload.last_updated_at) * 1000).toISOString()
        : null,
      source: "CoinGecko live price",
    };
  }

  const url = new URL(
    `https://fxapi.app/api/${card.baseCurrency}/${card.quoteCurrency}.json`,
  );
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to fetch live forex price.");
  }

  const result = await response.json();
  const price = Number(result?.price ?? result?.rate ?? result?.value);

  if (!Number.isFinite(price)) {
    throw new Error("Invalid live forex price received.");
  }

  return {
    price,
    change24hPct: null,
    updatedAt:
      typeof result?.updated === "string"
        ? result.updated
        : typeof result?.date === "string"
          ? result.date
          : null,
    source: "fxapi.app live price",
  };
};
