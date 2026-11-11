import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Transaction, PeriodData } from "@/types/performance.types";
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

const getDateRange = (filter: string) => {
  const endDate = new Date();
  const startDate = new Date();

  switch (filter) {
    case "Today":
      startDate.setHours(0, 0, 0, 0);
      break;
    case "7 Days":
      startDate.setDate(endDate.getDate() - 7);
      break;
    case "14 Days":
      startDate.setDate(endDate.getDate() - 14);
      break;
    case "30 Days":
      startDate.setDate(endDate.getDate() - 30);
      break;
    case "60 Days":
      startDate.setDate(endDate.getDate() - 60);
      break;
    case "90 Days":
      startDate.setDate(endDate.getDate() - 90);
      break;
    default:
      startDate.setHours(0, 0, 0, 0);
  }

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
};

const calculateMetrics = (transactions: Transaction[]) => {
  let totalDeposits = 0;
  let totalWithdrawals = 0;
  let transactionCount = 0;

  transactions.forEach((transaction: Transaction) => {
    if (isRealtimeIncludedTransaction(transaction)) {
      const amount = getTransactionAmount(transaction);
      const transactionType = getTransactionType(transaction);

      if (transactionType === "deposit") {
        totalDeposits += amount;
      } else if (transactionType === "withdrawal") {
        totalWithdrawals += amount;
      }
      transactionCount++;
    }
  });

  return {
    deposits: totalDeposits,
    withdrawals: totalWithdrawals,
    transactions: transactionCount,
    netFlow: totalDeposits - totalWithdrawals,
  };
};

const calculateTrend = (current: number, previous: number): string => {
  if (previous === 0) {
    return current > 0 ? "+100%" : "0%";
  }
  const percentChange = ((current - previous) / previous) * 100;
  const sign = percentChange >= 0 ? "+" : "";
  return `${sign}${percentChange.toFixed(1)}%`;
};

const fetchPreviousPeriodData = async (
  filter: string,
  fetchRange: (startDate: string, endDate: string) => Promise<Transaction[]>,
): Promise<PeriodData> => {
  try {
    const { startDate } = getDateRange(filter);
    const start = new Date(startDate);
    const periodLength = Math.ceil(
      (new Date().getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );

    const previousStart = new Date(start);
    previousStart.setDate(previousStart.getDate() - periodLength);
    const previousEnd = new Date(start);
    previousEnd.setDate(previousEnd.getDate() - 1);

    const transactions = await fetchRange(
      previousStart.toISOString().split("T")[0],
      previousEnd.toISOString().split("T")[0],
    );

    return calculateMetrics(transactions);
  } catch (error) {
    console.error("Error fetching previous period data:", error);
    return { deposits: 0, withdrawals: 0, transactions: 0, netFlow: 0 };
  }
};

export const usePerformanceData = (filter: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["performanceData", filter],
    queryFn: async () => {
      const { startDate, endDate } = getDateRange(filter);
      const fetchRange = (rangeStartDate: string, rangeEndDate: string) =>
        queryClient.fetchQuery(
          getTransactionExportRangeQueryOptions(rangeStartDate, rangeEndDate),
        );

      const [transactions, previousPeriodData] = await Promise.all([
        fetchRange(startDate, endDate),
        fetchPreviousPeriodData(filter, fetchRange),
      ]);
      const metrics = calculateMetrics(transactions);

      return {
        deposits: {
          value: `$${metrics.deposits.toFixed(2)}`,
          trend: calculateTrend(metrics.deposits, previousPeriodData.deposits),
          rawValue: metrics.deposits,
        },
        withdrawals: {
          value: `$${metrics.withdrawals.toFixed(2)}`,
          trend: calculateTrend(
            metrics.withdrawals,
            previousPeriodData.withdrawals,
          ),
          rawValue: metrics.withdrawals,
        },
        transactions: {
          value: metrics.transactions.toString(),
          trend: calculateTrend(
            metrics.transactions,
            previousPeriodData.transactions,
          ),
          rawValue: metrics.transactions,
        },
        netFlow: {
          value: `$${metrics.netFlow.toFixed(2)}`,
          trend: calculateTrend(metrics.netFlow, previousPeriodData.netFlow),
          rawValue: metrics.netFlow,
        },
        };
    },
    staleTime: 0,
    refetchInterval: 15 * 1000,
    refetchIntervalInBackground: false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });
};
