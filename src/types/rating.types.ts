export interface UserAccount {
  _id: string;
  mt5Account: string;
  accountType: string;
  balance?: number;
  updatedAt: string;
}

export type ExpertiseLevel =
  | "legend"
  | "expert"
  | "vertical_take_off"
  | "young_talent"
  | "new_comers";

export interface MasterTrader {
  id: string;
  name: string;
  avatar: string;
  expertise: ExpertiseLevel;
  riskScore: number;
  growth: string;
  profitLoss: number;
  copiers: number;
  fees: string;
  capital: string;
  minInvestment: number;
  activeSince: string;
  description?: string;
  telegramLink?: string | null;
  performance?: {
    profit: string;
    copier: number;
    profitAndLoss: string;
  };
  accountDetails?: {
    unrealizedProfit: number;
    accountBalance: string;
    masterTraderBonus: string;
    lever: string;
  };
  riskManagement?: {
    maxUnrealizedLoss: number;
    maxLossDuration: string;
  };
  activityData?: {
    [key: string]: Array<{ date: string; value: number; profit: number }>;
  };
  trades?: Array<{
    id: string;
    symbol: string;
    type: string;
    openTime: string;
    closeTime: string;
    duration: string;
    profit: number;
  }>;
  stats?: any;
}

export interface FilterState {
  expertise: string;
  maxRiskScore: string;
  minGrowth: string;
  minCopiers: string;
  feeType: string;
  sortBy: string;
}

export interface SetupCopyingData {
  masterAccount: string;
  copierAccount: string;
  minInvestment: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
