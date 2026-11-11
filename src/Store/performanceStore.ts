import type { PerformanceData } from "@/types/performance.types";
import { create } from "zustand";

interface PerformanceStore {
  filter: string;
  open: boolean;
  performanceData: PerformanceData[];
  setFilter: (filter: string) => void;
  setOpen: (open: boolean) => void;
  setPerformanceData: (data: PerformanceData[]) => void;
}

export const usePerformanceStore = create<PerformanceStore>((set) => ({
  filter: "Today",
  open: false,
  performanceData: [
    {
      label: "Deposits",
      value: "$0",
      icon: "ArrowUpCircle",
      trend: "+0%",
      color: "emerald",
      rawValue: 0,
    },
    {
      label: "Withdrawals",
      value: "$0",
      icon: "ArrowDownCircle",
      trend: "-0%",
      color: "orange",
      rawValue: 0,
    },
    {
      label: "Transactions",
      value: "0",
      icon: "Repeat",
      trend: "+0%",
      color: "blue",
      rawValue: 0,
    },
    {
      label: "Net Flow",
      value: "$0",
      icon: "Wallet",
      trend: "+0%",
      color: "purple",
      rawValue: 0,
    },
  ],
  setFilter: (filter) => set({ filter }),
  setOpen: (open) => set({ open }),
  setPerformanceData: (performanceData) => set({ performanceData }),
}));
