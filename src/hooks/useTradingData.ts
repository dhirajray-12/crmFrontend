import type {
  Instrument,
  PriceData,
  TradeMarker,
  Trade,
  TradingDataResponse,
} from "@/types/forexCrypto.types";
import { DEFAULT_INSTRUMENTS } from "@/types/forexCrypto.types";
import { useQuery } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Utility functions
export const normalizeSymbol = (symbol: string): string => {
  return symbol
    .replace(/\./g, "")
    .replace(/_/g, "")
    .replace(/\s/g, "")
    .toUpperCase();
};

export const getColorForSymbol = (
  normalizedSymbol: string,
  isOpen: boolean,
  instruments: Instrument[],
): string => {
  const instrument = instruments.find(
    (i) => normalizeSymbol(i.name) === normalizedSymbol,
  );
  if (instrument) {
    return isOpen ? instrument.openColor : instrument.closeColor;
  }
  const colors = [
    { open: "#3B82F6", close: "#1E40AF" },
    { open: "#8B5CF6", close: "#6D28D9" },
    { open: "#F59E0B", close: "#D97706" },
    { open: "#EF4444", close: "#DC2626" },
    { open: "#10B981", close: "#059669" },
  ];
  const hash = normalizedSymbol
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorSet = colors[hash % colors.length];
  return isOpen ? colorSet.open : colorSet.close;
};

export const processTradingData = (
  data: TradingDataResponse["data"],
  instruments: Instrument[],
): {
  chartData: PriceData[];
  availableSymbols: string[];
  updatedInstruments: Instrument[];
  tradeMarkers: TradeMarker[];
} => {
  const { openTrades = [], closedTrades = [] } = data;
  const allTrades: Trade[] = [...openTrades, ...closedTrades];

  if (allTrades.length === 0) {
    return {
      chartData: [],
      availableSymbols: [],
      updatedInstruments: instruments,
      tradeMarkers: [],
    };
  }

  const pointMap = new Map<string, PriceData>();
  const symbolsSet = new Set<string>();
  const instrumentsMap = new Map<string, Instrument>(
    instruments.map((i) => [i.key, i] as const),
  );
  const tradeMarkers: TradeMarker[] = [];

  const parseTradeDate = (value?: string) => {
    if (!value) return null;

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      console.error("Error parsing trade date:", value);
      return null;
    }

    return parsed;
  };

  const getDecimalsForSymbol = (normalizedSymbol: string) => {
    if (normalizedSymbol.includes("BTC") || normalizedSymbol.includes("ETH")) {
      return 0;
    }
    if (
      normalizedSymbol.includes("XAG") ||
      normalizedSymbol.includes("XAU") ||
      normalizedSymbol.includes("JPY")
    ) {
      return 2;
    }
    return 4;
  };

  const getPoint = (date: Date) => {
    const timestamp = date.getTime();
    const key = date.toISOString();
    const existing = pointMap.get(key);

    if (existing) {
      return existing;
    }

    const point: PriceData = {
      date: key,
      timestamp,
      markers: [],
    };
    pointMap.set(key, point);
    return point;
  };

  allTrades.forEach((trade, index) => {
    const openDate = parseTradeDate(trade.openTime);

    if (!openDate) {
      return;
    }

    const originalSymbol = trade.symbol;
    const normalizedSymbol = normalizeSymbol(originalSymbol);
    symbolsSet.add(normalizedSymbol);

    if (!instrumentsMap.has(normalizedSymbol)) {
      const existing = DEFAULT_INSTRUMENTS.find(
        (i) => normalizeSymbol(i.name) === normalizedSymbol,
      );
      if (existing) {
        instrumentsMap.set(normalizedSymbol, existing);
      } else {
        instrumentsMap.set(normalizedSymbol, {
          key: normalizedSymbol,
          name: originalSymbol,
          openColor: getColorForSymbol(normalizedSymbol, true, instruments),
          closeColor: getColorForSymbol(normalizedSymbol, false, instruments),
        });
      }
    }

    const openPrice = parseFloat(trade.openPrice);
    const latestPrice =
      trade.status === "open"
        ? parseFloat(trade.currentPrice || trade.openPrice)
        : parseFloat(trade.closePrice || trade.openPrice);
    const decimals = getDecimalsForSymbol(normalizedSymbol);
    const priceKey = `${normalizedSymbol}_price`;
    const openPoint = getPoint(openDate);
    const entryMarker: TradeMarker = {
      id: `${normalizedSymbol}-entry-${index}`,
      symbol: normalizedSymbol,
      type: "entry",
      direction: trade.trade,
      status: trade.status,
      price: parseFloat(openPrice.toFixed(decimals)),
      volume: trade.volume,
      time: openDate.toISOString(),
      profit: trade.profit,
    };

    openPoint[priceKey] = parseFloat(openPrice.toFixed(decimals));
    openPoint.markers = [...(openPoint.markers || []), entryMarker];
    tradeMarkers.push(entryMarker);

    const exitDate =
      trade.status === "closed"
        ? parseTradeDate(trade.closeTime) || openDate
        : new Date();
    const exitPoint = getPoint(exitDate);
    const exitType = trade.status === "closed" ? "exit" : "live";
    const exitMarker: TradeMarker = {
      id: `${normalizedSymbol}-${exitType}-${index}`,
      symbol: normalizedSymbol,
      type: exitType,
      direction: trade.trade,
      status: trade.status,
      price: parseFloat(latestPrice.toFixed(decimals)),
      volume: trade.volume,
      time: exitDate.toISOString(),
      profit: trade.profit,
    };

    exitPoint[priceKey] = parseFloat(latestPrice.toFixed(decimals));
    exitPoint.markers = [...(exitPoint.markers || []), exitMarker];
    tradeMarkers.push(exitMarker);
  });

  const symbolsArray = Array.from(symbolsSet);
  const processedData = Array.from(pointMap.values()).sort(
    (a, b) => a.timestamp - b.timestamp,
  );

  return {
    chartData: processedData,
    availableSymbols: symbolsArray,
    updatedInstruments: Array.from(instrumentsMap.values()),
    tradeMarkers: tradeMarkers.sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
    ),
  };
};

export const useTradingData = () => {
  return useQuery({
    queryKey: ["tradingData"],
    queryFn: async () => {
      const params = new URLSearchParams({
        closedDays: "7",
        closedLimit: "300",
      });

      const response = await fetch(`${API_BASE_URL}/trading/all?${params}`, {
        headers: {
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error(`Failed to fetch trading data: ${response.status}`);
      }

      const result: TradingDataResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error("Invalid data received from server.");
      }

      return result.data;
    },
    enabled: true,
    staleTime: 15000,
    refetchInterval: () =>
      typeof document !== "undefined" && document.visibilityState === "visible"
        ? 15000
        : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};
