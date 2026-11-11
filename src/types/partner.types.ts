export interface PartnerConfig {
  _id: string;
  userId: string;
  referralCode: string;
  referredBy: string | null;
  IBbalance: number;
  status: 'active' | 'pending' | 'suspended' | 'inactive';
  level: number;
  parent: string | null;
  parentDetails?: {
    name: string;
    email: string;
    referralCode: string;
    level: number;
  } | null;
}

export interface DashboardSummary {
  totalCommission: number;
  todayCommission: number;
  withdrawableBalance: number;
  totalWithdrawals: number;
  partnersCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PartnerConfigResponse extends ApiResponse<PartnerConfig> {
  ibConfiguration?: PartnerConfig;
}

export interface DashboardSummaryResponse extends ApiResponse<DashboardSummary> {
  summary?: DashboardSummary;
}

export interface CreatePartnerResponse extends ApiResponse<PartnerConfig> {
  ibConfiguration?: PartnerConfig;
}

export interface CommissionStructure {
  directReferrals: string;
  accountLevel: number;
  payoutFrequency: string;
}

export type ShareMethod = 'social' | 'email' | 'copy';