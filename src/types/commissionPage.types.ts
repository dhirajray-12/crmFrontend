// User types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

// Partner types
export interface Partner {
  _id: string;
  userId: User;
  referralCode: string;
  level: number;
  totalVolume: number;
  totalEarned: number;
  totalTrades: number;
  createdAt: string;
  country: string;
  mt5Account: string;
  accounts?: string[];
  accountCount?: number;
}

// Trade types
export interface Trade {
  acNo: string;
  openTime: string;
  closeTime: string;
  openPrice: string;
  closePrice: string;
  symbol: string;
  profit: number;
  volume: number;
  rebate: number;
  status: string;
  level: number;
}

export interface AccountTradeSummary {
  acNo: string;
  accountType?: string;
  totalProfit: number;
  totalVolume: number;
  totalRebate: number;
  totalTrades: number;
}

// Commission Summary types
export interface CommissionSummary {
  totalCommission: number;
  totalTrades: number;
  totalVolume: number;
  totalProfit: number;
  avgCommissionPerTrade: number;
  period: number;
}

// Today's Commission Summary types
export interface TodayCommissionSummary {
  totalCommission: number;
  totalTrades: number;
  totalVolume: number;
  totalProfit: number;
  avgCommissionPerTrade: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PartnersResponse extends ApiResponse<Partner[]> {
  partners?: Partner[];
}

export interface SummaryResponse extends ApiResponse<CommissionSummary> {
  summary?: CommissionSummary;
}

export interface TodaySummaryResponse extends ApiResponse<TodayCommissionSummary> {
  summary?: TodayCommissionSummary;
}

export interface TradeCommissionsResponse extends ApiResponse<Trade[]> {
  trades?: Trade[];
  totals?: {
    totalProfit: number;
    totalVolume: number;
    totalRebate: number;
  };
}

export interface PartnerTradeCommissionsResponse extends ApiResponse<Trade[]> {
  partner?: {
    id: string;
    name: string;
    email: string;
    accounts: string[];
    accountCount?: number;
  };
  trades?: Trade[];
  accountSummaries?: AccountTradeSummary[];
  totals?: {
    totalProfit: number;
    totalVolume: number;
    totalRebate: number;
  };
}

// Filter types
export type LevelFilter = "All" | "1" | "2" | "3" | "4" | "5";
export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  type: ToastType;
  message: string;
}

// Stats type
export interface CommissionStats {
  totalCommission: number;
  totalVolume: number;
  activePartners: number;
  avgPerTrade: number;
  monthlyCommission: number;
  pendingCommission: number;
  todayCommission: number;
}
