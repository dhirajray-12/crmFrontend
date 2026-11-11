// frontend/src/types/Accountlist.type.ts - FIXED TYPES
import type { IAccount, IUser } from "@/shared/types";

export interface Transaction {
  id: number;
  type: "deposit" | "withdrawal" | "transfer";
  amount: number;  // ✅ Changed from string to number
  date: string;
  timetaken: string;
  status: "completed" | "pending" | "failed";
  method: string;
}

export interface Account {
  id: number;
  _id?: string;
  accountNumber: string;
  accountType: string;
  name: string;
  platform: string;
  leverage: string;
  balance: number;  // ✅ Changed from string to number
  equity: number;   // ✅ Changed from string to number
  profitLoss: string; // Keep as string because it has +/-
  status: string;
  transactions: Transaction[];
  investorPassword?: string;
  masterPassword?: string;
  user?: IUser;
}

export interface AccountSummary {
  totalBalance: number;  // ✅ Changed from string to number
  totalEquity: number;   // ✅ Changed from string to number
  totalProfitLoss: string;
}

export interface TransactionStats {
  totalDeposits: number;
  totalWithdrawals: number;
  totalTransfers: number;
}

export interface BackendAccountsResponse {
  success: boolean;
  count: number;
  data: IAccount[];
}

export interface BackendTransactionResponse {
  success: boolean;
  data: any[];
}

export interface ToastState {
  message: string;
  type: "success" | "error" | "info";
  isVisible: boolean;
}

export interface PasswordUpdateData {
  investor_pwd?: string;
  master_pwd?: string;
}