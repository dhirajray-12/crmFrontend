import { create } from "zustand";

interface AccountActivityState {
  timePeriod: number;
  chartType: "bar" | "area" | "line";
  dropdownOpen: boolean;
  setTimePeriod: (period: number) => void;
  setChartType: (type: "bar" | "area" | "line") => void;
  setDropdownOpen: (open: boolean) => void;
}

export const useAccountActivityStore = create<AccountActivityState>()(
  (set) => ({
    timePeriod: 30,
    chartType: "bar",
    dropdownOpen: false,
    setTimePeriod: (period) => set({ timePeriod: period }),
    setChartType: (type) => set({ chartType: type }),
    setDropdownOpen: (open) => set({ dropdownOpen: open }),
  }),
);
