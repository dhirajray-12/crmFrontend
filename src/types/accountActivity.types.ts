export interface TransactionData {
  date: string;
  deposit: number;
  withdrawal: number;
  transactions: number;
}
export interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}
export interface ProcessedTransactionData {
  data: TransactionData[];
  lastUpdated: Date;
}
export interface Transaction {
  type: string;
  amount: number | string;
  status: string;

  createdAt: string; // ✅ ADD
  date: string; // approved / rejected / requested

  processedDate?: string; // ✅ optional now

  account: string;
  paymentMethod: string;
}

export const seriesColors: Record<string, string> = {
  deposit: "#42CAFF",
  withdrawal: "#FD1D1D",
  transactions: "#00873E",
};

export type ChartType = "bar" | "area" | "line";

export const timeOptions = [7, 14, 30, 60, 90];
