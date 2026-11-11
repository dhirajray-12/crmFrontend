import type {
  ConsolidatedStatementResponse,
  DashboardData,
} from "@/types/dashboard.types";
import { getAccounts } from "@/API/clientApi";
import { useQuery } from "@tanstack/react-query";
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const parseAmount = (value: unknown): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = parseFloat(value.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const formatAmount = (value: unknown): string => parseAmount(value).toFixed(2);

const fetchDashboardData = async (): Promise<DashboardData> => {
  const now = new Date();
  const startDate = new Date("2000-01-01T00:00:00.000Z").toISOString();
  const endDate = now.toISOString();

  const response = await fetch(
    `${API_BASE_URL}/client/statement/consolidated?startDate=${startDate}&endDate=${endDate}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-active-role": sessionStorage.getItem("active_role") || "",
      },
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
  }

  const result: ConsolidatedStatementResponse = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.message || "Failed to load data");
  }

  const { summary } = result.data;
  const totalDeposits =
    summary.totalDeposits ??
    (summary as Record<string, unknown>).totalDeposit ??
    formatAmount(0);

  const totalWithdrawals =
    summary.totalWithdrawals ??
    (summary as Record<string, unknown>).totalWithdrawal ??
    formatAmount(0);

  const totalTransactions = summary.totalTransactions ?? 0;

  // The consolidated statement endpoint only tracks cash-flow (deposits /
  // withdrawals), not live MT5 balances — its `currentBalance`/`currentEquity`
  // fields come back as 0. The real live balance/equity per account lives on
  // /accounts (same source GlobalProgress/AccountList use), so sum that
  // instead and fall back to the statement's numbers if that call fails.
  let totalBalance: number = parseAmount(summary.currentBalance);
  let totalEquity: number = parseAmount(summary.currentEquity);

  try {
    const accounts = await getAccounts();
    const balanceSum = accounts.reduce(
      (sum, acc) => sum + (Number(acc.balance) || 0),
      0,
    );
    const equitySum = accounts.reduce(
      (sum, acc) => sum + (Number(acc.equity) || 0),
      0,
    );
    totalBalance = balanceSum;
    totalEquity = equitySum;
  } catch (error) {
    console.error("Failed to load account balances for dashboard:", error);
  }

  return {
    totalBalance: formatAmount(totalBalance),
    totalEquity: formatAmount(totalEquity),
    totalDeposits: formatAmount(totalDeposits),
    totalWithdrawals: formatAmount(totalWithdrawals),
    totalMt5Accounts: summary.totalAccounts,
    netBalance: formatAmount(totalBalance),
    netCashFlow: formatAmount(summary.netFlow),
    totalTransactions,
  };
};

export const useDashboardData = () => {
  return useQuery({
    queryKey: ["dashboardData"],
    queryFn: fetchDashboardData,
    staleTime: 60 * 1000,
    refetchInterval: 15 * 1000,
    refetchIntervalInBackground: false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};
