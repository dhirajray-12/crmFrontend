import type { DashboardData } from "@/types/dashboard.types";

export const formatCurrency = (amount: string | number): string => {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return `$${numAmount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatCompactCurrency = (amount: string | number): string => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return `$${new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(num)}`;
};

export const calculateGrowth = (
  deposits: string,
  withdrawals: string,
): string => {
  const dep = parseFloat(deposits);
  const wth = parseFloat(withdrawals);
  if (wth === 0) return "+100%";
  const growth = ((dep - wth) / wth) * 100;
  return `${growth > 0 ? "+" : ""}${growth.toFixed(1)}%`;
};

export const generateKpiCards = (data: DashboardData) => {
  return [
    {
      title: "Total Deposits",
      value: formatCurrency(data.totalDeposits),
      trend: calculateGrowth(data.totalDeposits, data.totalWithdrawals),
      trendPositive: true,
      gradientFrom: "#065F46",
      gradientTo: "#10B981",
      gradientVibrant: "#34D399",
      strokeColor: "#064E3B",
      accentColor: "#6EE7B7",
    },
    {
      title: "Total Balance",
      value: formatCurrency(data.totalBalance),
      trend: data.netCashFlow
        ? `Net: ${formatCurrency(data.netCashFlow)}`
        : "+12.5%",
      trendPositive: true,
      gradientFrom: "#22d3ee",
      gradientTo: "#3b82f6",
      gradientVibrant: "#60A5FA",
      strokeColor: "#1E3A8A",
      accentColor: "#93C5FD",
    },
    {
      title: "Total Withdrawals",
      value: formatCurrency(data.totalWithdrawals),
      trend: data.totalTransactions
        ? `${data.totalTransactions} txns`
        : "-3.1%",
      trendPositive: false,
      gradientFrom: "#7c3aed",
      gradientTo: "#2563eb",
      gradientVibrant: "#F87171",
      strokeColor: "#7F1D1D",
      accentColor: "#FCA5A5",
    },
    {
      title: "MT5 Accounts",
      value: data.totalMt5Accounts.toString(),
      trend: `Equity: ${formatCompactCurrency(data.totalEquity)}`,
      trendPositive: true,
      gradientFrom: "#6B21A8",
      gradientTo: "#A855F7",
      gradientVibrant: "#C084FC",
      strokeColor: "#581C87",
      accentColor: "#D8B4FE",
    },
  ];
};
