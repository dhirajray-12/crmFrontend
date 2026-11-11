import { create } from "zustand";
import type { AccountType } from "@/types/createAccount.types";

interface CreateAccountState {
  step: number;
  selectedType: AccountType | null;
  selectedLeverage: string;
  leverageOpen: boolean;
  setStep: (step: number) => void;
  setSelectedType: (type: AccountType | null) => void;
  setSelectedLeverage: (leverage: string) => void;
  setLeverageOpen: (open: boolean) => void;
  resetState: () => void;
}

export const useCreateAccountStore = create<CreateAccountState>()((set) => ({
  step: 1,
  selectedType: null,
  selectedLeverage: "",
  leverageOpen: false,

  setStep: (step) => set({ step }),
  setSelectedType: (type) => set({ selectedType: type }),
  setSelectedLeverage: (leverage) => set({ selectedLeverage: leverage }),
  setLeverageOpen: (open) => set({ leverageOpen: open }),

  resetState: () =>
    set({
      step: 1,
      selectedType: null,
      selectedLeverage: "",
      leverageOpen: false,
    }),
}));
