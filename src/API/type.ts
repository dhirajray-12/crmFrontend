// types.ts
export interface Account {
  id: string;
  mt5Account: string;
  balance: number;
  equity: number;
  leverage: string;
  accountType: string;
  status: boolean;
  createdAt: string;
  email?: string;
}

export interface Transaction {
  type: string;
  amount: number | string;
  status: string;

  createdAt: string; // ✅ ADD
  date: string; // approved / rejected / requested

  processedDate?: string; // ✅ optional now

  account: string;
  paymentMethod: string;
}

// frontend/src/types/ib.types.ts

/**
 * IB Configuration Types
 */
export interface IBConfiguration {
  _id: string;
  groupId: string;
  level: number;
  bonusPerLot: number;
  defaultTimeInSeconds: number;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  _id: string;
  name: string;
  value: string;
  description?: string;
  configurations: IBConfiguration[];
}

/**
 * User Types
 */
export interface User {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  country?: string;
  phone?: string;
  role: string;
}

/**
 * IB Client Configuration
 */
export interface IBClientConfiguration {
  _id: string;
  IBbalance: number;
  referralCode: string;
  level?: number;
}

/**
 * IB Withdrawal Types
 */
export interface IBWithdrawal {
  _id: string;
  userId: User;
  ibConfigurationId: IBClientConfiguration;
  amount: number;
  paymentMethod: string;
  paymentDetails: Record<string, any>;
  status: "pending" | "approved" | "rejected";
  adminNotes?: string;
  transactionId?: string;
  rejectedReason?: string;
  approvedBy?: User;
  approvedAt?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawalStats {
  totalRequests: number;
  totalAmount: number;
  byStatus: {
    [key: string]: {
      count: number;
      amount: number;
    };
  };
}

/**
 * API Response Types
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface WithdrawalsResponse {
  success: boolean;
  withdrawals: IBWithdrawal[];
  pagination: PaginationInfo;
}

export interface WithdrawalDetailsResponse {
  success: boolean;
  withdrawal: IBWithdrawal;
}

export interface StatsResponse {
  success: boolean;
  stats: WithdrawalStats;
}

export interface GroupsResponse {
  success: boolean;
  count: number;
  data: Group[];
}
// Admin iB Service Types
export interface ConfigurationResponse {
  success: boolean;
  data: IBConfiguration;
}

/**
 * Form Data Types
 */
export interface CreateConfigurationDTO {
  groupId: string;
  level: number;
  bonusPerLot: number;
  defaultTimeInSeconds?: number;
}

export interface UpdateConfigurationDTO {
  bonusPerLot: number;
  defaultTimeInSeconds?: number;
}

export interface ApproveWithdrawalDTO {
  adminNotes?: string;
  transactionId?: string;
}

export interface RejectWithdrawalDTO {
  rejectedReason: string;
  adminNotes?: string;
}

/**
 * Filter Types
 */
export interface WithdrawalFilters {
  status?: string;
  page?: number;
  limit?: number;
}
export interface Group {
  _id: string;
  name: string;
  value: string;
}

export interface Account {
  _id: string;
  mt5Account: string;
  accountType: string;
  groupName: string;
  leverage: string;
  platform: string;
}

/**
 * Copy Trading Types - Rating Page
 */
export interface Trade {
  id: string;
  symbol: string;
  type: "buy" | "sell";
  openTime: string;
  closeTime: string;
  duration: string;
  profit: number;
}

export interface ActivityDataPoint {
  date: string;
  value: number;
  profit?: number;
}

export interface PerformanceStats {
  profit: string;
  copier: number;
  profitAndLoss: string;
}

export interface AccountDetails {
  unrealizedProfit: number;
  accountBalance: string;
  masterTraderBonus: string;
  lever: string;
}

export interface RiskManagement {
  maxUnrealizedLoss: number;
  maxLossDuration: string;
}

export interface PeriodStats {
  gain: number;
  profit: number;
  copierCount: number;
}

export interface MasterStats {
  weekly: PeriodStats;
  monthly: PeriodStats;
  threeMonths: PeriodStats;
  sixMonths: PeriodStats;
  all: PeriodStats;
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
  performance: PerformanceStats;
  accountDetails: AccountDetails;
  riskManagement: RiskManagement;
  activityData?: {
    "1W": ActivityDataPoint[];
    "1M": ActivityDataPoint[];
    "3M": ActivityDataPoint[];
    "6M": ActivityDataPoint[];
    ALL: ActivityDataPoint[];
  };
  trades?: Trade[];
  stats?: MasterStats;
}

export interface SetupCopyingData {
  masterAccount: string;
  copierAccount: string;
  minInvestment: number;
}

export interface FilterOptions {
  expertise: string;
  maxRiskScore: string;
  minGrowth: string;
  minCopiers: string;
  feeType: string;
  sortBy: string;
}

/**
 * Copy Trading Types - Copier Page
 */
export interface CopierStats {
  totalCopiers: number;
  totalInvestment: number;
  totalProfit: number;
  commissionPaid: number;
}

export interface AssociatedTrade {
  MT5Account: number;
  Open_Price: number;
  Close_Price: number | null;
  Open_Time: string;
  Close_Time: string | null;
  Profit: number;
  Volume: number;
  Comment: string;
}

export interface CopierTrade {
  master_login: number;
  master_name: string;
  Symbol: string;
  CMD: number; // 0 = BUY, 1 = SELL
  Volume: number;
  Open_Price: number;
  Close_Price: number | null;
  Open_Time: string;
  Close_Time: string | null;
  Profit: number;
  Commission: number;
  associated_trades: AssociatedTrade[];
}

export interface CopierAccount {
  mt5Account: number;
  balance: number;
  equity: number;
  profit: number;
  commission: number;
}

export interface MasterCopierData {
  master_login: number;
  master_name: string;
  chat_link: string | null;
  commission: number;
  copiers: CopierAccount[];
}

export interface TradeHistoryResponse {
  trades: CopierTrade[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface UnlinkCopierRequest {
  mt5Account: string;
}

export interface CheckOpenTradesRequest {
  copierAccounts: number[];
}

export interface CheckOpenTradesResponse {
  success: boolean;
  hasOpenTrades: boolean;
  openTradesCount: number;
}
