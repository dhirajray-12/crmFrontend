import type { Transaction, TransactionStats } from "@/types/Accountlist.type";
import { accountApi } from "@/services/AccountList.service";
import {
  calculateTransactionStats,
  formatDepositTransactionData,
  formatTransactionData,
} from "@/utils/AccountListHelper";
import { depositApi } from "@/services/DepositPage.service";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export const useTransactions = () => {
  const [accountTransactions, setAccountTransactions] = useState<
    Record<string, Transaction[]>
  >({});
  const [transactionStats, setTransactionStats] = useState<
    Record<string, TransactionStats>
  >({});
  const [loadingTransactions, setLoadingTransactions] = useState<
    Record<string, boolean>
  >({});

  const queryClient = useQueryClient();

  const fetchAccountTransactions = async (accountNumber: string) => {
    const cachedTransactions = queryClient.getQueryData<Transaction[]>([
      "accountTransactions",
      accountNumber,
    ]);

    if (cachedTransactions) {
      setAccountTransactions((prev) => ({
        ...prev,
        [accountNumber]: cachedTransactions,
      }));

      setTransactionStats((prev) => ({
        ...prev,
        [accountNumber]: calculateTransactionStats(cachedTransactions),
      }));

      return;
    }

    setLoadingTransactions((prev) => ({ ...prev, [accountNumber]: true }));

    try {
      const [transactionResponse, deposits] = await Promise.all([
        accountApi.fetchTransactions(accountNumber),
        depositApi.fetchDeposits(),
      ]);

      const transactions = (transactionResponse as any)?.data?.transactions || [];
      const transformedTransactions = formatTransactionData(transactions, accountNumber);
      const transformedDeposits = formatDepositTransactionData(deposits, accountNumber);
      const transformed = [...transformedDeposits, ...transformedTransactions].map(
        (transaction, index) => ({
          ...transaction,
          id: index + 1,
        }),
      );

      queryClient.setQueryData(["accountTransactions", accountNumber], transformed);

      setAccountTransactions((prev) => ({
        ...prev,
        [accountNumber]: transformed,
      }));

      const stats = calculateTransactionStats(transformed);

      setTransactionStats((prev) => ({
        ...prev,
        [accountNumber]: stats,
      }));
    } catch (error) {
      console.error("Error fetching transactions:", error);

      setAccountTransactions((prev) => ({
        ...prev,
        [accountNumber]: [],
      }));
    } finally {
      setLoadingTransactions((prev) => ({ ...prev, [accountNumber]: false }));
    }
  };

  return {
    accountTransactions,
    transactionStats,
    loadingTransactions,
    fetchAccountTransactions,
  };
};
