import type {
  PriceData,
  Instrument,
  LineToDisplay,
  TradeMarker,
} from "@/types/forexCrypto.types";
import { normalizeSymbol } from "@/hooks/useTradingData";

export const filterDataByTimeRange = (
  chartData: PriceData[],
  timeFilter: string,
  customDateRange: { start: string; end: string },
): PriceData[] => {
  if (chartData.length === 0) return [];

  const now = new Date();
  let startDate: Date;

  switch (timeFilter) {
    case "Last 7 Days":
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "Last 14 Days":
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 14);
      break;
    case "Last 30 Days":
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 30);
      break;
    case "Last 60 Days":
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 60);
      break;
    case "Last 90 Days":
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 90);
      break;
    case "CUSTOM":
      if (customDateRange.start && customDateRange.end) {
        return chartData.filter(
          (item) =>
            item.date >= customDateRange.start &&
            item.date <= customDateRange.end,
        );
      }
      return chartData;
    default:
      return chartData;
  }

  return chartData.filter((item) => new Date(item.date) >= startDate);
};

export const getLinesToDisplay = (
  availableSymbols: string[],
  selectedSymbols: string[],
  instruments: Instrument[],
): LineToDisplay[] => {
  if (availableSymbols.length === 0) return [];

  if (selectedSymbols.includes("ALL")) {
    return availableSymbols.map((symbol) => {
      const instrument = instruments.find(
        (i) => normalizeSymbol(i.name) === symbol,
      );
      return {
        key: `${symbol}_price`,
        name: `${instrument?.name || symbol} Price`,
        color: instrument?.closeColor || symbol,
      };
    });
  } else {
    return selectedSymbols
      .map((symbol) => {
        const instrument = instruments.find(
          (i) => normalizeSymbol(i.name) === symbol,
        );

        if (!instrument) {
          return null;
        }

        return {
          key: `${symbol}_price`,
          name: `${instrument.name} Price`,
          color: instrument.closeColor,
        };
      })
      .filter((line): line is LineToDisplay => line !== null);
  }
};

export const formatPrice = (value: number, symbol: string): string => {
  if (symbol.includes("BTC") || symbol.includes("ETH"))
    return `$${value.toLocaleString()}`;
  if (symbol.includes("XAU") || symbol.includes("XAG"))
    return `$${value.toFixed(2)}`;
  if (symbol.includes("JPY")) return value.toFixed(2);
  return value.toFixed(4);
};

export const getVisibleTradeMarkers = (
  data: PriceData[],
  selectedSymbols: string[],
): TradeMarker[] => {
  const visibleSymbols = selectedSymbols.includes("ALL")
    ? null
    : new Set(selectedSymbols);

  return data
    .flatMap((point) => point.markers || [])
    .filter((marker) =>
      visibleSymbols ? visibleSymbols.has(marker.symbol) : true,
    )
    .sort((a, b) => a.time.localeCompare(b.time));
};
