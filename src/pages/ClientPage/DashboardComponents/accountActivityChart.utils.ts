import type { ChartType, TransactionData } from "@/types/accountActivity.types";
import { getConfiguredTimezone } from "@/utils/timezoneStore";

export type ActivityRow = TransactionData;

export type { ChartType };

/** Shared color tokens for the account activity chart (mobile SVG + Apex). */
export const COLORS = {
  deposit: "#22d3ee",
  depositSoft: "#67e8f9",
  withdrawal: "#fb7185",
  withdrawalSoft: "#fda4af",
  transactions: "#f59e0b",
  transactionsSoft: "#fcd34d",
  netPositive: "#34d399",
  netNegative: "#f87171",
};

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);

export const formatCompactNumber = (value: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

export const formatShortDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: getConfiguredTimezone(),
  });

export const formatLongDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: getConfiguredTimezone(),
  });

export const formatPercentChange = (value: number) => {
  if (!Number.isFinite(value)) {
    return "0.0%";
  }

  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
};

export const getChange = (current: number, previous: number) => {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return ((current - previous) / previous) * 100;
};

export const sumBy = (
  entries: Array<{ deposit: number; withdrawal: number; transactions: number }>,
  key: "deposit" | "withdrawal" | "transactions",
) => entries.reduce((sum, item) => sum + item[key], 0);

/** Trend direction/tone helper shared by StatCell + TrendBadge usage. */
export const trendDirection = (value: number): "up" | "down" | "flat" => {
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "flat";
};

export const statTone = (value: number): "positive" | "negative" | "default" => {
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "default";
};
