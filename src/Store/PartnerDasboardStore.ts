// stores/partnerStore.ts
import { create } from "zustand";
import type {
  TabType,
  WithdrawalFilterStatus,
  WithdrawalFormData,
} from "@/types/PartnerDasboard.types";

interface PartnerState {
  // UI State
  activeTab: TabType;
  showWithdrawalForm: boolean;
  filterStatus: WithdrawalFilterStatus;
  copiedCode: boolean;
  partnerSearchTerm: string;
  partnerLevelFilter: "all" | number;

  // Form State
  withdrawalFormData: WithdrawalFormData;

  // Actions
  setActiveTab: (tab: TabType) => void;
  setShowWithdrawalForm: (show: boolean) => void;
  setFilterStatus: (status: WithdrawalFilterStatus) => void;
  setCopiedCode: (copied: boolean) => void;
  setPartnerSearchTerm: (term: string) => void;
  setPartnerLevelFilter: (level: "all" | number) => void;
  updateWithdrawalFormData: (data: Partial<WithdrawalFormData>) => void;
  resetWithdrawalForm: () => void;
}

const initialFormData: WithdrawalFormData = {
  amount: "",
  method: "bank",
  bankName: "",
  accountNumber: "",
  accountHolderName: "",
  ifscCode: "",
  cryptoAddress: "",
  cryptoNetwork: "TRC20",
};

export const usePartnerStore = create<PartnerState>((set) => ({
  // Initial state
  activeTab: "overview",
  showWithdrawalForm: false,
  filterStatus: "all",
  copiedCode: false,
  partnerSearchTerm: "",
  partnerLevelFilter: "all",
  withdrawalFormData: initialFormData,

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  setShowWithdrawalForm: (show) => set({ showWithdrawalForm: show }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setCopiedCode: (copied) => set({ copiedCode: copied }),
  setPartnerSearchTerm: (partnerSearchTerm) => set({ partnerSearchTerm }),
  setPartnerLevelFilter: (partnerLevelFilter) => set({ partnerLevelFilter }),
  updateWithdrawalFormData: (data) =>
    set((state) => ({
      withdrawalFormData: { ...state.withdrawalFormData, ...data },
    })),
  resetWithdrawalForm: () => set({ withdrawalFormData: initialFormData }),
}));
