import type { Transaction } from "@/types/TransactionHistory.type";
import { transactionApi } from "@/services/TransferHistory.service";
import { transformTransactionData } from "@/utils/TransferHistoryHelper";
import { useQuery } from "@tanstack/react-query";

export const useTransactions = () => {
  const {
    data: transactions = [],
    isLoading: loading,
    error,
    refetch: fetchTransactions,
  } = useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      const response = await transactionApi.fetchTransactions({
        page: 1,
        limit: 100,
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch transactions");
      }

      return transformTransactionData(response.data);
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  return {
    transactions,
    loading,
    error: error instanceof Error ? error.message : null,
    fetchTransactions,
  };
};