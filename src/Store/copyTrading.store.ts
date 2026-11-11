import { create } from "zustand";
import type {
  Master,
  SelectedCopier,
  Trade,
  View,
  Stats,
} from "@/types/copyTrading.types";

interface CopyTradingStore {
  // View states
  view: View;
  selectedMaster: Master | null;
  selectedCopier: SelectedCopier | null;

  // Data states
  masters: Master[];
  stats: Stats;
  masterTrades: Trade[];
  copierTrades: Trade[];

  // UI states
  loading: boolean;
  error: string;
  unlinkingAccount: string | null;

  // Actions
  setView: (view: View) => void;
  setSelectedMaster: (master: Master | null) => void;
  setSelectedCopier: (copier: SelectedCopier | null) => void;
  setMasters: (masters: Master[]) => void;
  setStats: (stats: Stats) => void;
  setMasterTrades: (trades: Trade[]) => void;
  setCopierTrades: (trades: Trade[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  setUnlinkingAccount: (account: string | null) => void;

  // Reset actions
  resetToMain: () => void;
  resetAll: () => void;
}

const initialStats: Stats = {
  totalCopiers: 0,
  totalInvestment: 0,
  totalProfit: 0,
  commissionPaid: 0,
};

export const useCopyTradingStore = create<CopyTradingStore>((set) => ({
  // Initial states
  view: "main",
  selectedMaster: null,
  selectedCopier: null,
  masters: [],
  stats: initialStats,
  masterTrades: [],
  copierTrades: [],
  loading: true,
  error: "",
  unlinkingAccount: null,

  // Actions
  setView: (view) => set({ view }),
  setSelectedMaster: (master) => set({ selectedMaster: master }),
  setSelectedCopier: (copier) => set({ selectedCopier: copier }),
  setMasters: (masters) => set({ masters }),
  setStats: (stats) => set({ stats }),
  setMasterTrades: (trades) => set({ masterTrades: trades }),
  setCopierTrades: (trades) => set({ copierTrades: trades }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setUnlinkingAccount: (account) => set({ unlinkingAccount: account }),

  resetToMain: () =>
    set({
      view: "main",
      selectedMaster: null,
      selectedCopier: null,
      masterTrades: [],
      copierTrades: [],
    }),

  resetAll: () =>
    set({
      view: "main",
      selectedMaster: null,
      selectedCopier: null,
      masters: [],
      stats: initialStats,
      masterTrades: [],
      copierTrades: [],
      loading: true,
      error: "",
      unlinkingAccount: null,
    }),
}));
