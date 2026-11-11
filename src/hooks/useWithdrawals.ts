import type {
  Account,
  SavedPayoutDetails,
  Withdrawal,
} from "@/types/WithdrawalPage.types";
import { withdrawalApi } from "@/services/withdrawal.service";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  calculateTotalBalance,
  generateDynamicAccountTypes,
} from "../utils/helpers";

export const useWithdrawals = () => {
  const {
    data: accounts = [],
    refetch: refetchAccounts,
    isLoading: accountsLoading,
    error: accountsError,
  } = useQuery<Account[]>({
    queryKey: ["withdrawalAccounts"],
    queryFn: () => withdrawalApi.fetchAccounts(),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const {
    data: withdrawals = [],
    refetch: refetchWithdrawals,
    isLoading: withdrawalsLoading,
    error: withdrawalsError,
  } = useQuery<Withdrawal[]>({
    queryKey: ["withdrawals"],
    queryFn: () => withdrawalApi.fetchWithdrawals(),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const { data: savedPayoutDetails = null } = useQuery<SavedPayoutDetails | null>({
    queryKey: ["profilePayoutDetails"],
    queryFn: () => withdrawalApi.fetchProfilePayoutDetails(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const dynamicAccountTypes = useMemo(
    () => generateDynamicAccountTypes(accounts),
    [accounts],
  );

  const totalBalance = useMemo(
    () => calculateTotalBalance(accounts),
    [accounts],
  );

  const loading = accountsLoading || withdrawalsLoading;
  const error =
    (accountsError as Error | null)?.message ||
    (withdrawalsError as Error | null)?.message ||
    null;

  const fetchWithdrawals = async () => {
    await Promise.all([refetchWithdrawals(), refetchAccounts()]);
  };

  return {
    withdrawals,
    accounts,
    savedPayoutDetails,
    dynamicAccountTypes,
    loading,
    error,
    totalBalance,
    fetchWithdrawals,
  };
};
