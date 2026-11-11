export interface PriceData {
  date: string;
  timestamp: number;
  markers?: TradeMarker[];
  [key: string]: string | number | TradeMarker[] | undefined;
}

export interface Instrument {
  key: string;
  name: string;
  openColor: string;
  closeColor: string;
}

export interface LineToDisplay {
  key: string;
  name: string;
  color: string;
}

export interface TooltipEntry {
  color: string;
  dataKey: string;
  value: number;
}

export interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<
    TooltipEntry & {
      payload?: PriceData;
      name?: string;
    }
  >;
  label?: string | number;
}

export interface CustomDateRange {
  start: string;
  end: string;
}

export interface Trade {
  symbol: string;
  openTime: string;
  openPrice: string;
  closePrice?: string;
  closeTime?: string;
  currentPrice?: string;
  profit: number;
  status: string;
  volume: string;
  trade: string;
}

export interface TradeMarker {
  id: string;
  symbol: string;
  type: "entry" | "exit" | "live";
  direction: string;
  status: string;
  price: number;
  volume: string;
  time: string;
  profit?: number;
}

export interface TradingDataResponse {
  success: boolean;
  data: {
    openTrades: Trade[];
    closedTrades: Trade[];
    totalOpenTrades: number;
    totalClosedTrades: number;
    statistics: TradingStatistics;
  };
}

export interface TradingStatistics {
  totalTrades: number;
  totalOpenTrades: number;
  totalClosedTrades: number;
  totalProfit: number;
  winRate?: number;
}

export const DEFAULT_INSTRUMENTS: Instrument[] = [
  {
    key: "AUDUSD",
    name: "AUDUSD",
    openColor: "#3B82F6",
    closeColor: "#1E40AF",
  },
  {
    key: "XAGUSD",
    name: "XAG.USD",
    openColor: "#8B5CF6",
    closeColor: "#6D28D9",
  },
  {
    key: "BTCUSD",
    name: "BTCUSD",
    openColor: "#F59E0B",
    closeColor: "#D97706",
  },
  {
    key: "XAUUSD",
    name: "XAU.USD",
    openColor: "#EF4444",
    closeColor: "#DC2626",
  },
  {
    key: "EURUSD",
    name: "EURUSD",
    openColor: "#10B981",
    closeColor: "#059669",
  },
  {
    key: "GBPUSD",
    name: "GBPUSD",
    openColor: "#F97316",
    closeColor: "#EA580C",
  },
  {
    key: "USDJPY",
    name: "USDJPY",
    openColor: "#06B6D4",
    closeColor: "#0891B2",
  },
  {
    key: "ETHUSD",
    name: "ETHUSD",
    openColor: "#84CC16",
    closeColor: "#65A30D",
  },
];
