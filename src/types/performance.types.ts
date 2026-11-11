export interface PerformanceData {
  label: string;
  value: string;
  icon: "ArrowUpCircle" | "ArrowDownCircle" | "Repeat" | "Wallet";
  trend: string;
  color: string;
  rawValue: number;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface Transaction {
  status: string;
  type: string;
  amount: string | number;
  rawAmount?: number;
}

export interface PeriodData {
  deposits: number;
  withdrawals: number;
  transactions: number;
  netFlow: number;
}
