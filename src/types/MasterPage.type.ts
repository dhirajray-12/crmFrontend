export interface CopierUser {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
}

export interface CopierAccount {
  accountNumber: string;
  balance: number;
}

export interface Copier {
  copierUserId: CopierUser;
  copierAccountId: CopierAccount;
  currentProfit: number;
  totalCommissionPaid: number;
  status: string;
}

export interface AccountDetails {
  mt5Account: string;
  balance: number;
  equity: number;
  platform: string;
  leverage: string;
  accountType: string;
}

export interface MasterAccount {
  _id: string;
  nickname: string;
  accountDetails: AccountDetails;
  commission: number;
  totalCopiers: number;
  totalProfit: number;
  totalCommissionEarned: number;
  isActive: boolean;
  copiers: Copier[];
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  _id: string;
  mt5Account: string;
  name: string;
  balance: number;
  equity: number;
  platform: string;
  leverage: string;
  accountType: string;
}

export interface MasterFormData {
  nickname: string;
  accountId: string;
  commission: string;
  minimumInvestment: string;
  publicChatLink: string;
  strategyDescription: string;
}

export interface MasterSummary {
  totalMasters: number;
  activeMasters: number;
  totalCopiers: number;
  totalProfit: number;
  commissionEarned: number;
  avgPerformance: number;
  monthlyGrowth: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export type View = "list" | "create" | { type: "update"; master: MasterAccount };