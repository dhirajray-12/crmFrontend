import { create } from "zustand";
interface AccountsState {
  availableBalances: any[];
  savedWallets: any | null;
  openDepositModal: boolean;
  openWithdrawModal: boolean;
  setAvailableBalances: (balances: any[]) => void;
  setSavedWallets: (wallets: any) => void;
  setOpenDepositModal: (open: boolean) => void;
  setOpenWithdrawModal: (open: boolean) => void;
  resetModals: () => void;
}

export const useAccountsStore = create<AccountsState>((set) => ({
  availableBalances: [],
  savedWallets: null,
  openDepositModal: false,
  openWithdrawModal: false,

  setAvailableBalances: (balances) => set({ availableBalances: balances }),
  setSavedWallets: (wallets) => set({ savedWallets: wallets }),
  setOpenDepositModal: (open) => set({ openDepositModal: open }),
  setOpenWithdrawModal: (open) => set({ openWithdrawModal: open }),
  resetModals: () =>
    set({
      openDepositModal: false,
      openWithdrawModal: false,
    }),
}));
