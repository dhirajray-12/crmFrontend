import type { MasterAccount, MasterSummary } from "@/types/master.types";

export const formatCurrency = (value: number): string => {
  return `₹${value.toLocaleString("en-IN")}`;
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const calculateSummary = (masters: MasterAccount[]): MasterSummary => {
  const totalMasters = masters.length;
  const activeMasters = masters.filter((m) => m.isActive).length;
  const totalCopiers = masters.reduce((acc, m) => acc + m.totalCopiers, 0);
  const totalProfit = masters.reduce((acc, m) => acc + m.totalProfit, 0);
  const commissionEarned = masters.reduce(
    (acc, m) => acc + m.totalCommissionEarned,
    0
  );
  const avgPerformance =
    masters.length > 0
      ? masters.reduce((acc, m) => acc + (m.totalProfit > 0 ? 85 : 50), 0) /
        masters.length
      : 0;
  const monthlyGrowth = 12.5;

  return {
    totalMasters,
    activeMasters,
    totalCopiers,
    totalProfit,
    commissionEarned,
    avgPerformance,
    monthlyGrowth,
  };
};

export const filterMasters = (
  masters: MasterAccount[],
  searchTerm: string
): MasterAccount[] => {
  if (!searchTerm) return masters;
  
  const term = searchTerm.toLowerCase();
  return masters.filter(
    (m) =>
      m.nickname.toLowerCase().includes(term) ||
      m.accountDetails.mt5Account.includes(term)
  );
};

export const validateCommission = (commission: number): boolean => {
  return commission >= 0 && commission <= 50;
};

export const getInitials = (name: string): string => {
  return name.charAt(0).toUpperCase();
};

export const getStatusColor = (isActive: boolean): string => {
  return isActive
    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
    : "bg-gray-500/20 text-gray-300 border border-gray-500/30";
};

export const getCopierStatusColor = (): string => {
  return "bg-emerald-500/20 text-emerald-300";
};