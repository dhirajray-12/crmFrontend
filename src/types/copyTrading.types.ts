export interface Copier {
  id: number;
  account: string;
  balance: number;
  profit: number;
  commissionPaid: number;
  joinedDate: string;
  equity?: number;
}

export interface Master {
  id: number;
  name: string;
  account: string;
  commission: number;
  profit: number;
  started: string;
  commissionPaid: number;
  noCopiers: number;
  copiers: Copier[];
}

export interface Trade {
  id: number;
  symbol: string;
  type: "BUY" | "SELL";
  volume: number;
  openPrice: number;
  currentPrice: number;
  profit: number;
  openTime: string;
}

export interface SelectedCopier extends Copier {
  masterAccount: string;
}

export type View = "main" | "copiers" | "trades";

export interface Stats {
  totalCopiers: number;
  totalInvestment: number;
  totalProfit: number;
  commissionPaid: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface TradeHistoryResponse {
  trades: Array<{
    master_login: number;
    Symbol: string;
    CMD: number;
    associated_trades: Array<{
      MT5Account: number;
      Volume: number;
      Open_Price: number;
      Close_Price?: number;
      Profit: number;
      Open_Time: string;
    }>;
  }>;
}

export interface OpenTradesCheckResponse {
  hasOpenTrades: boolean;
  openTradesCount: number;
}
