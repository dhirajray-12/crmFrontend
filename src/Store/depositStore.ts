import { create } from "zustand";
import type { PaymentMethod, AccountTypeOption } from "@/types/deposit.types";

interface DepositState {
  step:
    | "method"
    | "bankSelect"
    | "bankDetails"
    | "walletSelect"
    | "walletDetails"
    | "card";
  selectedBank: PaymentMethod | null;
  selectedWallet: PaymentMethod | null;
  selectedAccount: AccountTypeOption | null;
  setStep: (step: DepositState["step"]) => void;
  setSelectedBank: (bank: PaymentMethod | null) => void;
  setSelectedWallet: (wallet: PaymentMethod | null) => void;
  setSelectedAccount: (account: AccountTypeOption | null) => void;
  resetState: () => void;
}

export const useDepositStore = create<DepositState>()((set) => ({
  step: "method",
  selectedBank: null,
  selectedWallet: null,
  selectedAccount: null,
  setStep: (step) => set({ step }),
  setSelectedBank: (bank) => set({ selectedBank: bank }),
  setSelectedWallet: (wallet) => set({ selectedWallet: wallet }),
  setSelectedAccount: (account) => set({ selectedAccount: account }),
  resetState: () =>
    set({
      step: "method",
      selectedBank: null,
      selectedWallet: null,
      selectedAccount: null,
    }),
}));
