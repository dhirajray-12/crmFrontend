import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DashboardSummary, PartnerConfig } from "@/types/partner.types";
import { partnerService } from "@/services/partner.service";

interface PartnerStore {
  partnerConfig: PartnerConfig | null;
  dashboardSummary: DashboardSummary | null;
  copiedField: string | null;
  showQR: boolean;
  isCreating: boolean;
  isLoading: boolean;
  error: string | null;

  setPartnerConfig: (config: PartnerConfig | null) => void;
  setDashboardSummary: (summary: DashboardSummary | null) => void;
  setCopiedField: (field: string | null) => void;
  setShowQR: (show: boolean) => void;
  setIsCreating: (creating: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  getReferralLink: () => string;

  resetStore: () => void;
}

export const usePartnerStore = create<PartnerStore>()(
  persist(
    (set, get) => ({
      partnerConfig: null,
      dashboardSummary: null,
      copiedField: null,
      showQR: false,
      isCreating: false,
      isLoading: false,
      error: null,

      setPartnerConfig: (config) => set({ partnerConfig: config }),
      setDashboardSummary: (summary) => set({ dashboardSummary: summary }),

      setCopiedField: (field) => {
        set({ copiedField: field });

        if (field) {
          setTimeout(() => set({ copiedField: null }), 1500);
        }
      },

      setShowQR: (show) => set({ showQR: show }),

      setIsCreating: (creating) => set({ isCreating: creating }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      getReferralLink: () => {
        const { partnerConfig } = get();
        if (!partnerConfig?.referralCode) return "";
        return partnerService.generateReferralLink(partnerConfig.referralCode);
      },

      resetStore: () =>
        set({
          partnerConfig: null,
          dashboardSummary: null,
          copiedField: null,
          showQR: false,
          isCreating: false,
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: "partner-store",
      partialize: (state) => ({
        partnerConfig: state.partnerConfig,
        copiedField: state.copiedField,
        showQR: state.showQR,
      }),
    },
  ),
);
