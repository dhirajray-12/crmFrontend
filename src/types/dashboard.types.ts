export interface DashboardData {
  totalBalance: string;
  totalEquity: string;
  totalDeposits: string;
  totalWithdrawals: string;
  totalMt5Accounts: number;
  netBalance: string;
  netCashFlow?: string;
  totalTransactions?: number;
  depositGrowth?: string;
}

export interface KpiCardProps {
  title: string;
  value: string;
  trend: string;
  trendPositive?: boolean;
  gradientFrom: string;
  gradientTo: string;
  gradientVibrant: string;
  strokeColor: string;
  accentColor: string;
  index: number;
}

export interface ConsolidatedStatementResponse {
  success: boolean;
  data: {
    summary: {
      currentBalance: string;
      currentEquity: string;
      totalDeposits: string;
      totalWithdrawals: string;
      totalAccounts: number;
      netFlow: string;
      totalTransactions: number;
    };
  };
  message?: string;
}

export interface KpiCardConfig {
  title: string;
  value: string;
  trend: string;
  trendPositive: boolean;
  gradientFrom: string;
  gradientTo: string;
  gradientVibrant: string;
  strokeColor: string;
  accentColor: string;
}
