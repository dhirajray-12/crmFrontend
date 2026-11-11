import type { Account } from "@/API/type";
import type { AccountListItem } from "@/hooks/useAccountsData";

export interface AccountWithBalance extends Account {
  _id: string;
  account: string;
  balance: number;
  color: string;
  accountType: string;
  accountNumber: string;
}

export interface WithdrawalAPIResponse {
  success: boolean;
  data: any;
  count?: number;
}

export interface ProfileResponse {
  success: boolean;
  data: {
    walletDetails?: {
      tetherWalletAddress?: string;
      ethWalletAddress?: string;
      trxWalletAddress?: string;
    };
  };
}

export interface BadgeProps {
  children: React.ReactNode;
  tone?: "zinc" | "indigo" | "emerald" | "amber";
}

export interface AccountCardProps {
  account: Account;
}

export interface AccountTableHeaderProps {
  headers: string[];
}

export interface AccountTableRowProps {
  account: AccountListItem;
  index: number;
  onDepositClick: () => void;
  onWithdrawClick: () => void;
}

export interface AccountsTableProps {
  // Props if any
}

export const ACCOUNT_TYPE_COLORS: Record<string, string> = {
  BASIC: "from-blue-300 to-indigo-500",
  PRIME: "from-yellow-300 to-orange-500",
  ALPHA: "from-green-300 to-emerald-500",
  PROEDGE: "from-purple-300 to-indigo-500",
  INFINITY: "from-pink-300 to-purple-500",
};
