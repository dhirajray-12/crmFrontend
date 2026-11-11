import type {
  Trade,
  TradeApiData,
  TradeStats,
} from "@/types/TradingContest.types";
import { getConfiguredTimezone } from "@/utils/timezoneStore";

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString(undefined, {
    timeZone: getConfiguredTimezone(),
  });
};

export const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString(undefined, {
    timeZone: getConfiguredTimezone(),
  });
};

export const formatDateTime = (
  dateString: string,
): { date: string; time: string } => {
  const date = new Date(dateString);
  const timeZone = getConfiguredTimezone();
  return {
    date: date.toLocaleDateString(undefined, { timeZone }),
    time: date.toLocaleTimeString(undefined, { timeZone }),
  };
};

export const formatPrice = (
  price: number | string | null | undefined,
): string => {
  if (price === null || price === undefined) return "-";
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  return numPrice.toFixed(5);
};

export const formatProfit = (profit: number): string => {
  const sign = profit >= 0 ? "+" : "-";
  return `${sign}$${Math.abs(profit).toFixed(2)}`;
};

export const getProfitColorClass = (profit: number): string => {
  return profit >= 0 ? "text-green-400" : "text-red-400";
};

export const getTypeColorClass = (type: string): string => {
  return type.toLowerCase() === "buy"
    ? "bg-green-500/30 text-green-200 border border-green-400/50"
    : "bg-red-500/30 text-red-200 border border-red-400/50";
};

export const formatTimeWithSeconds = (date: Date): string => {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: getConfiguredTimezone(),
  });
};

export const transformTradeData = (
  trade: TradeApiData,
  status: "open" | "closed",
): Trade => {
  const openDateTime = formatDateTime(trade.openTime);
  const tradeId =
    trade.ticket ??
    trade.ticketNumber ??
    `${trade.account}-${trade.symbol}-${trade.openTime}-${status}`;
  const openPrice =
    typeof trade.openPrice === "number"
      ? trade.openPrice
      : parseFloat(trade.openPrice);
  const closePrice =
    trade.closePrice === undefined || trade.closePrice === null
      ? null
      : typeof trade.closePrice === "number"
        ? trade.closePrice
        : parseFloat(trade.closePrice);

  return {
    id: tradeId,
    accountNo: trade.account,
    accountName: trade.accountName,
    symbol: trade.symbol,
    type: trade.trade,
    volume: trade.volume,
    openPrice: Number.isFinite(openPrice) ? openPrice : 0,
    openDate: openDateTime.date,
    openTime: openDateTime.time,
    closePrice: closePrice !== null && Number.isFinite(closePrice) ? closePrice : null,
    closeDate: trade.closeTime ? formatDate(trade.closeTime) : null,
    closeTime: trade.closeTime ? formatTime(trade.closeTime) : null,
    profit: trade.profit,
    status,
    currentPrice: trade.currentPrice,
    commission: trade.commission,
    swap: trade.swap,
  };
};

export const calculateTradeStats = (trades: Trade[]): TradeStats => {
  return {
    totalTrades: trades.length,
    openTrades: trades.filter((t) => t.status === "open").length,
    closedTrades: trades.filter((t) => t.status === "closed").length,
    profitableTrades: trades.filter((t) => t.profit > 0).length,
    lossTrades: trades.filter((t) => t.profit < 0).length,
    totalProfitLoss: trades.reduce((sum, t) => sum + t.profit, 0),
  };
};

export const filterTrades = (trades: Trade[], searchQuery: string): Trade[] => {
  if (!searchQuery) return trades;

  const query = searchQuery.toLowerCase();
  return trades.filter(
    (trade) =>
      trade.accountNo.toLowerCase().includes(query) ||
      trade.symbol.toLowerCase().includes(query) ||
      trade.type.toLowerCase().includes(query),
  );
};
