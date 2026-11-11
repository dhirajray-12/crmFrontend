// src/hooks/useAccountsData.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { getAccounts } from "@/API/clientApi";
import type { Account } from "@/API/type";
import type { WithdrawalAPIResponse, ProfileResponse } from "@/types/accounts.types";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// ✅ ADD THIS TYPE - Only the fields we actually need
export type AccountListItem = {
  _id: string;
  mt5Account: string;
  accountNumber: string;
  balance: number;
  equity: number;
  leverage: string;
  accountType: string;
  groupName: string;
  platform: string;
  status: boolean;
  createdAt: string;
};

// ✅ OPTIMIZED - Only selects needed fields
export const useAccountsList = () => {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const res = await getAccounts();
      return res;
    },
 
    select: (data) => data.map((account: any): AccountListItem => ({
      _id: account._id || account.id,
      mt5Account: String(account.mt5Account || account.accountNumber || account.login || ""),
      accountNumber: String(account.mt5Account || account.accountNumber || account.login || "N/A"),
      balance: account.balance,
      equity: account.equity,
      leverage: account.leverage,
      accountType: account.accountType,
      groupName: account.groupName || "",
      platform: account.platform || "MT5",
      status: account.status,
      createdAt: account.createdAt,
    })),
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Keep this for components that need full account data
export const useAccountsData = () => {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const accounts = await getAccounts();
      return accounts as Account[];
    },
    staleTime: 15 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

// ✅ OPTIMIZED - Available Balances with select
export const useAvailableBalances = () => {
  return useQuery({
    queryKey: ["availableBalances"],
    queryFn: async () => {
      const res = await axios.get<WithdrawalAPIResponse>(
        `${API_BASE_URL}/accounts`,
        {
          headers: {
            "Content-Type": "application/json",
            "x-active-role": sessionStorage.getItem("active_role") || "",
          },
          withCredentials: true,
        },
      );
      return res.data.data;
    },
    // 🟢 ADD THIS - Only what withdrawal form needs
    select: (data) => data.map((acc: any) => ({
      _id: acc._id,
      account: acc.mt5Account,
      balance: `$${acc.balance.toFixed(2)}`,
      accountType: acc.accountType,
      accountNumber: acc.mt5Account,
      rawBalance: acc.balance,
    })),
    enabled: true,
    staleTime: 15 * 60 * 1000,
  });
};

// ✅ OPTIMIZED - Profile wallets with select
export const useProfileWallets = () => {
  return useQuery({
    queryKey: ["profileWallets"],
    queryFn: async () => {
      const res = await axios.get<ProfileResponse>(`${API_BASE_URL}/profile`, {
        headers: {
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
        withCredentials: true,
      });
      return res.data?.data?.walletDetails ?? {};
    },
    // 🟢 ADD THIS - Only the wallet addresses we need
    select: (walletDetails) => {
      return {
        usdt: walletDetails.tetherWalletAddress || "",
        eth: walletDetails.ethWalletAddress || "",
        tron: walletDetails.trxWalletAddress || "",
      };
    },
    enabled: true,
    staleTime: 15 * 60 * 1000,
    retry: 1,
  });
};

export const useRefreshAccounts = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ["availableBalances"] });
    queryClient.invalidateQueries({ queryKey: ["accounts"] });
  };
};
