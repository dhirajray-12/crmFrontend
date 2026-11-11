import { create } from "zustand";
import type { Account, WithdrawalFormData } from "@/types/withdrawal.types";

interface WithdrawalState {
  selectedAccount: Account | null;
  selectedMethod: string;
  selectedWalletType: string;
  showEWalletOptions: boolean;
  formData: WithdrawalFormData;
  setSelectedAccount: (account: Account | null) => void;
  setSelectedMethod: (method: string) => void;
  setSelectedWalletType: (type: string) => void;
  setShowEWalletOptions: (show: boolean) => void;
  updateFormData: (data: Partial<WithdrawalFormData>) => void;
  resetState: () => void;
}

const initialFormData: WithdrawalFormData = {
  account: "",
  amount: "",
  method: "",
};

export const useWithdrawalStore = create<WithdrawalState>()((set) => ({
  selectedAccount: null,
  selectedMethod: "",
  selectedWalletType: "",
  showEWalletOptions: false,
  formData: initialFormData,

  setSelectedAccount: (account) =>
    set({
      selectedAccount: account,
      formData: { ...initialFormData, account: account?.account || "" },
    }),

  setSelectedMethod: (method) =>
    set({
      selectedMethod: method,
      formData: { ...initialFormData, method },
    }),

  setSelectedWalletType: (type) =>
    set({
      selectedWalletType: type,
      formData: { ...initialFormData, walletType: type },
    }),

  setShowEWalletOptions: (show) => set({ showEWalletOptions: show }),

  updateFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),

  resetState: () =>
    set({
      selectedAccount: null,
      selectedMethod: "",
      selectedWalletType: "",
      showEWalletOptions: false,
      formData: initialFormData,
    }),
}));
