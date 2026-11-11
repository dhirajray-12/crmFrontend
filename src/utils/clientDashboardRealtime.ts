import type { QueryClient, QueryKey } from "@tanstack/react-query";
import type { DashboardData } from "@/types/dashboard.types";
import type {
  Transaction as TransactionHistoryItem,
  TransactionApiData,
} from "@/types/TransactionHistory.type";
import { transformTransactionData } from "@/utils/TransferHistoryHelper";
import { getConfiguredTimezone } from "@/utils/timezoneStore";

type RealtimeTransactionType = "deposit" | "withdrawal";

export interface RealtimeTransactionInput {
  id: string;
  type: RealtimeTransactionType;
  amount: number;
  account: string;
  accountType?: string;
  method?: string;
  createdAt?: string;
}

export interface RealtimeQuerySnapshot {
  queryKey: QueryKey;
  data: unknown;
}

const DASHBOARD_QUERY_KEY = ["dashboardData"] as const;
const TRANSACTIONS_QUERY_KEY = ["transactions"] as const;
const TRANSACTIONS_EXPORT_PREFIX = ["transactionsExport"] as const;
const ACCOUNT_ACTIVITY_PREFIX = ["accountActivity"] as const;
const PERFORMANCE_PREFIX = ["performanceData"] as const;

const parseAmount = (value: string | number | undefined) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = parseFloat(value.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const formatAmount = (value: number) => value.toFixed(2);

const formatDateLabel = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: getConfiguredTimezone(),
  });

const isDateWithinRange = (dateValue: string, startDate?: unknown, endDate?: unknown) => {
  if (typeof startDate !== "string" || typeof endDate !== "string") {
    return true;
  }

  const isoDate = new Date(dateValue).toISOString().split("T")[0];
  return isoDate >= startDate && isoDate <= endDate;
};

const buildOptimisticExportTransaction = (
  input: RealtimeTransactionInput,
): TransactionApiData & { isOptimistic: true } => {
  const createdAt = input.createdAt ?? new Date().toISOString();

  return {
    id: input.id,
    date: createdAt,
    createdAt,
    type: input.type,
    rawAmount: input.amount,
    amount: input.amount,
    account: input.account,
    accountType: input.accountType,
    status: "Pending",
    description: input.type === "deposit" ? "Deposit" : "Withdrawal",
    details: input.method || "",
    timeTaken: 0,
    isOptimistic: true,
  };
};

const buildOptimisticHistoryTransaction = (
  transaction: TransactionApiData & { isOptimistic: true },
): TransactionHistoryItem => {
  const transformed = transformTransactionData([transaction])[0];

  return {
    ...transformed,
    date: formatDateLabel(transaction.createdAt || transaction.date),
  };
};

const incrementDashboardField = (
  currentValue: string | undefined,
  delta: number,
) => formatAmount(parseAmount(currentValue) + delta);

export const captureRealtimeSnapshots = (queryClient: QueryClient) => {
  const snapshots: RealtimeQuerySnapshot[] = [
    {
      queryKey: DASHBOARD_QUERY_KEY,
      data: queryClient.getQueryData(DASHBOARD_QUERY_KEY),
    },
    {
      queryKey: TRANSACTIONS_QUERY_KEY,
      data: queryClient.getQueryData(TRANSACTIONS_QUERY_KEY),
    },
    ...queryClient
      .getQueriesData({ queryKey: TRANSACTIONS_EXPORT_PREFIX })
      .map(([queryKey, data]) => ({
        queryKey,
        data,
      })),
  ];

  return snapshots;
};

export const restoreRealtimeSnapshots = (
  queryClient: QueryClient,
  snapshots: RealtimeQuerySnapshot[] | undefined,
) => {
  snapshots?.forEach(({ queryKey, data }) => {
    queryClient.setQueryData(queryKey, data);
  });

  void queryClient.invalidateQueries({ queryKey: ACCOUNT_ACTIVITY_PREFIX });
  void queryClient.invalidateQueries({ queryKey: PERFORMANCE_PREFIX });
};

export const applyRealtimeTransactionUpdate = (
  queryClient: QueryClient,
  input: RealtimeTransactionInput,
) => {
  const optimisticExportTransaction = buildOptimisticExportTransaction(input);
  const optimisticHistoryTransaction = buildOptimisticHistoryTransaction(
    optimisticExportTransaction,
  );

  queryClient.setQueryData<DashboardData | undefined>(
    DASHBOARD_QUERY_KEY,
    (current) => {
      if (!current) {
        return current;
      }

      const amountDelta = input.type === "deposit" ? input.amount : -input.amount;

      return {
        ...current,
        totalDeposits:
          input.type === "deposit"
            ? incrementDashboardField(current.totalDeposits, input.amount)
            : current.totalDeposits,
        totalWithdrawals:
          input.type === "withdrawal"
            ? incrementDashboardField(current.totalWithdrawals, input.amount)
            : current.totalWithdrawals,
        totalTransactions: (current.totalTransactions ?? 0) + 1,
        netCashFlow: incrementDashboardField(current.netCashFlow ?? "0", amountDelta),
      };
    },
  );

  queryClient.setQueryData<TransactionHistoryItem[] | undefined>(
    TRANSACTIONS_QUERY_KEY,
    (current) => {
      if (!Array.isArray(current)) {
        return [optimisticHistoryTransaction];
      }

      return [optimisticHistoryTransaction, ...current];
    },
  );

  queryClient
    .getQueriesData<TransactionApiData[]>({
      queryKey: TRANSACTIONS_EXPORT_PREFIX,
    })
    .forEach(([queryKey, data]) => {
      const [, startDate, endDate] = queryKey;

      if (
        !isDateWithinRange(
          optimisticExportTransaction.createdAt || optimisticExportTransaction.date,
          startDate,
          endDate,
        )
      ) {
        return;
      }

      const nextData = Array.isArray(data)
        ? [optimisticExportTransaction, ...data]
        : [optimisticExportTransaction];

      queryClient.setQueryData(queryKey, nextData);
    });

  void queryClient.invalidateQueries({ queryKey: ACCOUNT_ACTIVITY_PREFIX });
  void queryClient.invalidateQueries({ queryKey: PERFORMANCE_PREFIX });
};
