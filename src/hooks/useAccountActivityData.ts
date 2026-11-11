import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Transaction, TransactionData } from "@/types/accountActivity.types";
import { getTransactionExportRangeQueryOptions } from "@/hooks/transactionExportQueries";

const normalizeValue = (value?: string | null) =>
  String(value || "")
    .trim()
    .toLowerCase();

const isApprovedTransaction = (transaction: Transaction & Record<string, any>) =>
  ["approved", "success", "completed"].includes(
    normalizeValue(transaction.status),
  );

const isRealtimeIncludedTransaction = (
  transaction: Transaction & Record<string, any>,
) => isApprovedTransaction(transaction) || Boolean(transaction.isOptimistic);

const getTransactionType = (transaction: Transaction & Record<string, any>) =>
  normalizeValue(transaction.type || transaction.transactionType);

const getTransactionAmount = (transaction: Transaction & Record<string, any>) =>
  Math.abs(
    Number(transaction.rawAmount) ||
      parseFloat(String(transaction.amount ?? "0").replace(/[^0-9.-]/g, "")) ||
      0,
  );

const getTransactionDate = (transaction: Transaction & Record<string, any>) =>
  transaction.processedDate ||
  transaction.rawDate ||
  transaction.createdAt ||
  transaction.date;

const processTransactions = (
  transactions: Transaction[],
  timePeriod: number,
): TransactionData[] => {
  const dataMap = new Map<string, TransactionData>();

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - timePeriod);

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    dataMap.set(dateStr, {
      date: dateStr,
      deposit: 0,
      withdrawal: 0,
      transactions: 0,
    });
  }

  transactions.forEach((transaction: any) => {
    const transactionDate = getTransactionDate(transaction);

    if (!transactionDate) {
      return;
    }

    const date = new Date(transactionDate).toISOString().split("T")[0];

    if (!dataMap.has(date)) return;

    const dayData = dataMap.get(date)!;

    if (isRealtimeIncludedTransaction(transaction)) {
      const amount = getTransactionAmount(transaction);
      const transactionType = getTransactionType(transaction);

      if (transactionType === "deposit") {
        dayData.deposit += amount;
      } else if (transactionType === "withdrawal") {
        dayData.withdrawal += amount;
      }
      dayData.transactions += 1;
    }
  });

  const sortedData = Array.from(dataMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const firstActivityIndex = sortedData.findIndex(
    (item) =>
      item.deposit > 0 || item.withdrawal > 0 || item.transactions > 0,
  );

  if (firstActivityIndex <= 0) {
    return sortedData;
  }

  // Keep one quiet day before activity starts so the chart has visual lead-in
  // without showing a long run of empty dates for larger time windows.
  return sortedData.slice(firstActivityIndex - 1);
};

export const useAccountActivityData = (timePeriod: number) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["accountActivity", timePeriod],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - timePeriod);

      const startDateStr = startDate.toISOString().split("T")[0];
      const endDateStr = endDate.toISOString().split("T")[0];

      const transactions = await queryClient.fetchQuery(
        getTransactionExportRangeQueryOptions(startDateStr, endDateStr),
      );

      return processTransactions(transactions, timePeriod);
    },
    staleTime: 0,
    refetchInterval: 15 * 1000,
    refetchIntervalInBackground: false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });
};
