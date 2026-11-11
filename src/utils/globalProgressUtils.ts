import type {
  Account,
  Metric,
  ColorScheme,
} from "@/types/globalProgress.types";


// ✅ Format currency with $ sign
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};


export const calculateMetrics = (
  accounts: Account[],
  colorSchemes: ColorScheme[],
): Metric[] => {
  if (accounts.length === 0) return [];

  // Calculate max balance for percentage calculation
  const maxBalance = Math.max(...accounts.map((acc) => acc.balance || 0), 1);

  // Map accounts to metrics with color schemes
  const accountMetrics: Metric[] = accounts.map((account, index) => {
    const colorScheme = colorSchemes[index % colorSchemes.length];
    const balance = account.balance || 0;
    const percentage =
      maxBalance > 1 ? Math.round((balance / maxBalance) * 100) : 0;

    const accountLabel =
      account.accountNumber ||
      account.mt5Account ||
      account.accountType ||
      "Account";

    return {
      label: accountLabel,
      balance: balance,
      percentage: percentage,
      ...colorScheme,
    };
  });

  // Sort by balance descending
  return accountMetrics.sort((a, b) => b.balance - a.balance);
};
