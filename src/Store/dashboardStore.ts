import { create } from "zustand";

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

interface DashboardState {
  lastUpdated: Date | null;
  setLastUpdated: (date: Date | null) => void;
}

export const useDashboardStore = create<DashboardState>()((set) => ({
  lastUpdated: null,
  setLastUpdated: (date) => set({ lastUpdated: date }),
}));
