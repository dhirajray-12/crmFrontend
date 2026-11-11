import { create } from "zustand";
interface CustomDateRange {
  start: string;
  end: string;
}

interface ForexCryptoState {
  timeFilter: string;
  customDateRange: CustomDateRange;
  chartType: "line" | "area" | "bar";
  selectedSymbols: string[];
  isLive: boolean;
  symbolDropdownOpen: boolean;
  timeDropdownOpen: boolean;
  chartTypeDropdownOpen: boolean;

  setTimeFilter: (filter: string) => void;
  setCustomDateRange: (range: CustomDateRange) => void;
  setChartType: (type: "line" | "area" | "bar") => void;
  setSelectedSymbols: (symbols: string[]) => void;
  setIsLive: (isLive: boolean) => void;
  setSymbolDropdownOpen: (open: boolean) => void;
  setTimeDropdownOpen: (open: boolean) => void;
  setChartTypeDropdownOpen: (open: boolean) => void;
  handleSymbolChange: (symbol: string) => void;
  resetState: () => void;
}

const initialState = {
  timeFilter: "Last 7 Days",
  customDateRange: { start: "", end: "" },
  chartType: "line" as const,
  selectedSymbols: ["ALL"],
  isLive: false,
  symbolDropdownOpen: false,
  timeDropdownOpen: false,
  chartTypeDropdownOpen: false,
};

export const useForexCryptoStore = create<ForexCryptoState>()((set, get) => ({
  ...initialState,

  setTimeFilter: (filter) => set({ timeFilter: filter }),
  setCustomDateRange: (range) => set({ customDateRange: range }),
  setChartType: (type) => set({ chartType: type }),
  setSelectedSymbols: (symbols) => set({ selectedSymbols: symbols }),
  setIsLive: (isLive) => set({ isLive }),
  setSymbolDropdownOpen: (open) => set({ symbolDropdownOpen: open }),
  setTimeDropdownOpen: (open) => set({ timeDropdownOpen: open }),
  setChartTypeDropdownOpen: (open) => set({ chartTypeDropdownOpen: open }),

  handleSymbolChange: (symbol) => {
    const { selectedSymbols } = get();
    if (symbol === "ALL") {
      set({ selectedSymbols: ["ALL"] });
    } else {
      const newSelection = selectedSymbols.filter((s) => s !== "ALL");
      if (newSelection.includes(symbol)) {
        const filtered = newSelection.filter((s) => s !== symbol);
        set({
          selectedSymbols: filtered.length === 0 ? ["ALL"] : filtered,
        });
      } else {
        set({ selectedSymbols: [...newSelection, symbol] });
      }
    }
  },

  resetState: () => set(initialState),
}));
