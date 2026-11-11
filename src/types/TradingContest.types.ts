export interface Trade {
    id: string | number;
    accountNo: string;
    accountName?: string;
    symbol: string;
    type: string;
    volume: string | number;
    openPrice: number;
    openDate: string;
    openTime: string;
    closePrice: number | null;
    closeDate: string | null;
    closeTime: string | null;
    profit: number;
    status: "open" | "closed";
    currentPrice?: string | number;
    commission?: number;
    swap?: number;
    stopLoss?: number;
    takeProfit?: number;
}

export interface TradeStats {
    totalTrades: number;
    openTrades: number;
    closedTrades: number;
    profitableTrades: number;
    lossTrades: number;
    totalProfitLoss: number;
}

export interface TradeCounts {
    open: number;
    closed: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data: {
        trades: T[];
        total?: number;
        pagination?: {
            page: number;
            limit: number;
            total: number;
            pages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    };
    message?: string;
}

export interface TradeApiData {
  ticket?: string | number;
  ticketNumber?: string | number;
  account: string;
  accountName?: string;
  accountType?: string;
  groupName?: string;
  leverage?: number;
  symbol: string;
  trade: string;
  volume: string | number;
    openPrice: string | number;
    openTime: string;
    closePrice?: string | number;
    closeTime?: string;
    profit: number;
    currentPrice?: string | number;
    commission?: number;
    swap?: number;
}
