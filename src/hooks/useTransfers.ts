import type { Account, Transfer } from "@/types/transfer.types";
import { normalizeTransfer, transferApi } from "@/services/TransferPage.service";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useTransfers = () => {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    data: accounts = [],
    isLoading: accountsLoading,
    refetch: fetchAccounts,
  } = useQuery<Account[]>({
    queryKey: ["availableBalances"],
    queryFn: async () => {
      return await transferApi.fetchAccounts();
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const {
    data: transfers = [],
    isLoading: transfersLoading,
    refetch: fetchTransfers,
  } = useQuery<Transfer[]>({
    queryKey: ["transfers", "recent"],
    queryFn: async () => {
      const transfers = await transferApi.fetchTransfers(1, 20, "all");
      return transfers.map(normalizeTransfer);
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });

  const createTransfer = async (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
  ) => {
    try {
      setError(null);

      await transferApi.createTransfer(fromAccountId, toAccountId, amount);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["transfers"] }),
        queryClient.invalidateQueries({ queryKey: ["accounts"] }),
        queryClient.invalidateQueries({ queryKey: ["myAccountsList"] }),
        queryClient.invalidateQueries({ queryKey: ["availableBalances"] }),
        queryClient.invalidateQueries({ queryKey: ["transactions"] }),
        queryClient.invalidateQueries({ queryKey: ["transactionsExport"] }),
        queryClient.invalidateQueries({ queryKey: ["performanceData"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboardData"] }),
      ]);

      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Transfer failed. Try again.";
      setError(msg);
      return { success: false, error: msg };
    }
  };

  return {
    accounts,
    transfers,
    loading: accountsLoading || transfersLoading,
    error,
    fetchAccounts,
    fetchTransfers,
    createTransfer,
  };
};
