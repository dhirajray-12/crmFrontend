import type {
  CommissionStats,
  CommissionSummary,
  TodayCommissionSummary,
  LevelFilter,
  Partner,
  ToastMessage,
  TradeCommissionsResponse,
} from "@/types/commissionPage.types";
import { create } from "zustand";
import { useToastStore } from "./toast.store";

interface CommissionStore {
  // State
  partners: Partner[];
  summary: CommissionSummary | null;
  todaySummary: TodayCommissionSummary | null;
  tradeCommissions: TradeCommissionsResponse | null;
  searchTerm: string;
  filterLevel: LevelFilter;
  selectedPartner: Partner | null;
  toastMessage: ToastMessage | null;
  showFilters: boolean;
  loading: boolean;
  stats: CommissionStats;


  // Actions
  setPartners: (partners: Partner[]) => void;
  setSummary: (summary: CommissionSummary | null) => void;
  setTodaySummary: (todaySummary: TodayCommissionSummary | null) => void;
  setTradeCommissions: (
    tradeCommissions: TradeCommissionsResponse | null,
  ) => void;
  setSearchTerm: (term: string) => void;
  setFilterLevel: (level: LevelFilter) => void;
  setSelectedPartner: (partner: Partner | null) => void;
  setToastMessage: (message: ToastMessage | null) => void;
  setShowFilters: (show: boolean) => void;
  setLoading: (loading: boolean) => void;
  updateStats: () => void;

  

  // Computed
  getFilteredPartners: () => Partner[];
  getPartnersCount: () => number;
  getActivePartnersCount: () => number;

  // Toast helpers
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  clearToast: () => void;

  // Reset
  resetStore: () => void;
}

const initialStats: CommissionStats = {
  totalCommission: 0,
  totalVolume: 0,
  activePartners: 0,
  avgPerTrade: 0,
  monthlyCommission: 0,
  pendingCommission: 0,
  todayCommission: 0,
};

export const useCommissionStore = create<CommissionStore>()((set, get) => ({
  // Initial state
  partners: [],
  summary: null,
  todaySummary: null,
  tradeCommissions: null,
  searchTerm: "",
  filterLevel: "All",
  selectedPartner: null,
  toastMessage: null,
  showFilters: false,
  loading: false,
  stats: initialStats,

  // Actions
  setPartners: (partners) => {
    set({ partners });
    get().updateStats();
  },

  setSummary: (summary) => {
    set({ summary });
    get().updateStats();
  },

  setTodaySummary: (todaySummary) => {
    set({ todaySummary });
    get().updateStats();
  },

  setTradeCommissions: (tradeCommissions) => {
    set({ tradeCommissions });
    get().updateStats();
  },

  setSearchTerm: (term) => set({ searchTerm: term }),

  setFilterLevel: (level) => set({ filterLevel: level }),

  setSelectedPartner: (partner) => set({ selectedPartner: partner }),

  setToastMessage: (message) => set({ toastMessage: message }),

  setShowFilters: (show) => set({ showFilters: show }),

  setLoading: (loading) => set({ loading }),

  updateStats: () => {
    const { partners, tradeCommissions, summary, todaySummary } = get();

    const stats = {
      totalCommission: tradeCommissions?.totals?.totalRebate ?? 0,
      totalVolume: tradeCommissions?.totals?.totalVolume ?? 0,
      activePartners: partners.filter((p) => p.totalTrades > 0).length,
      avgPerTrade: tradeCommissions?.trades?.length
        ? (tradeCommissions.totals?.totalRebate ?? 0) /
          tradeCommissions.trades.length
        : 0,
      monthlyCommission: summary?.totalCommission ?? 0,
      pendingCommission: 0,
      todayCommission: todaySummary?.totalCommission ?? 0,
    };

    set({ stats });
  },

  // Computed
  getFilteredPartners: () => {
    const { partners, searchTerm, filterLevel } = get();

    return partners.filter((partner) => {
      const firstName =
        partner.userId?.firstName || (partner.userId as any)?.firstname || "";
      const lastName =
        partner.userId?.lastName || (partner.userId as any)?.lastname || "";
      const email = partner.userId?.email || "";
      const referralCode = partner.referralCode || "";
      const country = partner.country || "";
      const normalizedSearch = searchTerm.toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        firstName.toLowerCase().includes(normalizedSearch) ||
        lastName.toLowerCase().includes(normalizedSearch) ||
        email.toLowerCase().includes(normalizedSearch) ||
        referralCode.toLowerCase().includes(normalizedSearch) ||
        country.toLowerCase().includes(normalizedSearch);

      const matchesLevel =
        filterLevel === "All" || partner.level === parseInt(filterLevel);

      return matchesSearch && matchesLevel;
    });
  },

  getPartnersCount: () => get().partners.length,

  getActivePartnersCount: () =>
    get().partners.filter((p) => p.totalTrades > 0).length,

  // Toast helpers
  showSuccess: (message) => {
    set({ toastMessage: { type: "success", message } });
    useToastStore.getState().addToast("success", message);
    setTimeout(() => set({ toastMessage: null }), 3000);
  },

  showError: (message) => {
    set({ toastMessage: { type: "error", message } });
    useToastStore.getState().addToast("error", message);
    setTimeout(() => set({ toastMessage: null }), 3000);
  },

  showInfo: (message) => {
    set({ toastMessage: { type: "info", message } });
    useToastStore.getState().addToast("info", message);
    setTimeout(() => set({ toastMessage: null }), 3000);
  },

  clearToast: () => set({ toastMessage: null }),

  // Reset
  resetStore: () =>
    set({
      partners: [],
      summary: null,
      todaySummary: null,
      tradeCommissions: null,
      searchTerm: "",
      filterLevel: "All",
      selectedPartner: null,
      toastMessage: null,
      showFilters: false,
      loading: false,
      stats: initialStats,
    }),
}));
