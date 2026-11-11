export interface Copier {
  copierUserId: {
    firstname: string;
    lastname: string;
  };
  copierAccountId: {
    accountNumber: string;
    balance: number;
  };
  currentProfit: number;
  totalCommissionPaid: number;
  status: string;
}

export interface MasterAccount {
  _id: string;
  nickname: string;
  accountDetails: {
    mt5Account: string;
    balance: number;
  };
  commission: number;
  totalCopiers: number;
  totalProfit: number;
  totalCommissionEarned: number;
  isActive: boolean;
  createdAt: string;
  copiers: Copier[];
}

export interface Account {
  _id: string;
  mt5Account: string;
  name: string;
  createdAt: string;
}

export type View =
  | "list"
  | "create"
  | { type: "update"; master: MasterAccount };

export interface CreateMasterFormData {
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
  data: T;
  message?: string;
  success?: boolean;
}
