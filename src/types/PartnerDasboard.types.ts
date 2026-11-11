// types/partner.types.ts
export interface IBConfiguration {
  _id: string;
  referralCode: string;
  status: string;
  level: number;
  parent?: any;
  maximumCommission: number | null;
  isPendingAssignment?: boolean;
  parentDetails?: {
    name: string;
    email: string;
    referralCode: string;
    level: number;
  };
}

export interface DashboardSummary {
  totalCommission: number;
  todayCommission: number;
  withdrawableBalance: number;
  totalWithdrawals: number;
  partnersCount: number;
  commissionMode?: "waterfall" | "flat";
}

export interface Partner {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  referralCode: string;
  level: number;
  maximumCommission?: number | null;
  isPendingAssignment?: boolean;
  totalVolume: number;
  totalEarned: number;
  totalBalance: number;
  totalEquity: number;
  createdAt: string;
}

export interface PendingDownlineIB {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  referralCode: string;
  createdAt: string;
}

export interface Withdrawal {
  _id: string;
  amount: number | string;
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  cryptoAddress?: string;
  cryptoNetwork?: string;
  status: "pending" | "approved" | "rejected" | "completed";
  createdAt: string;
  processedAt?: string;
}

export interface WithdrawalFormData {
  amount: string;
  method: "bank" | "crypto";
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  ifscCode?: string;
  cryptoAddress?: string;
  cryptoNetwork?: string;
}

export type TabType = "overview" | "partners" | "withdrawals";
export type WithdrawalFilterStatus =
  | "all"
  | "pending"
  | "approved"
  | "rejected"
  | "completed";
