import { create } from "zustand";
import type { PaymentMethod } from "@/types/payment.types";

interface PaymentStore {
  // Dialog states
  isDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  isDetailsDialogOpen: boolean;
  isExchangeDialogOpen: boolean;
  isExchangeDeleteDialogOpen: boolean;

  // Current items
  currentMethod: Partial<PaymentMethod>;
  selectedMethodDetails: PaymentMethod | null;
  currentExchange: any | null;
  dialogMode: "add" | "update";
  activeTab: "bank" | "wallet" | "other";

  // QR states
  qrFile: File | null;
  qrPreview: string | null;

  // Search states
  baseSearchTerm: string;
  targetSearchTerm: string;

  // Actions
  setDialogOpen: (open: boolean) => void;
  setDeleteDialogOpen: (open: boolean) => void;
  setDetailsDialogOpen: (open: boolean) => void;
  setExchangeDialogOpen: (open: boolean) => void;
  setExchangeDeleteDialogOpen: (open: boolean) => void;

  setCurrentMethod: (method: Partial<PaymentMethod>) => void;
  setSelectedMethodDetails: (method: PaymentMethod | null) => void;
  setCurrentExchange: (exchange: any | null) => void;
  setDialogMode: (mode: "add" | "update") => void;
  setActiveTab: (tab: "bank" | "wallet" | "other") => void;

  setQrFile: (file: File | null) => void;
  setQrPreview: (preview: string | null) => void;

  setBaseSearchTerm: (term: string) => void;
  setTargetSearchTerm: (term: string) => void;

  resetForm: () => void;
}

export const usePaymentStore = create<PaymentStore>((set) => ({
  // Initial states
  isDialogOpen: false,
  isDeleteDialogOpen: false,
  isDetailsDialogOpen: false,
  isExchangeDialogOpen: false,
  isExchangeDeleteDialogOpen: false,

  currentMethod: {
    type: "Bank Account",
    accountHolderName: "",
    accountNumber: "",
    ifsc_swift: "",
    walletName: "",
    walletAddress: "",
    name: "",
    active: true,
    qrCode: null,
  },
  selectedMethodDetails: null,
  currentExchange: null,
  dialogMode: "add",
  activeTab: "bank",

  qrFile: null,
  qrPreview: null,

  baseSearchTerm: "",
  targetSearchTerm: "",

  // Actions
  setDialogOpen: (open) => set({ isDialogOpen: open }),
  setDeleteDialogOpen: (open) => set({ isDeleteDialogOpen: open }),
  setDetailsDialogOpen: (open) => set({ isDetailsDialogOpen: open }),
  setExchangeDialogOpen: (open) => set({ isExchangeDialogOpen: open }),
  setExchangeDeleteDialogOpen: (open) =>
    set({ isExchangeDeleteDialogOpen: open }),

  setCurrentMethod: (method) => set({ currentMethod: method }),
  setSelectedMethodDetails: (method) => set({ selectedMethodDetails: method }),
  setCurrentExchange: (exchange) => set({ currentExchange: exchange }),
  setDialogMode: (mode) => set({ dialogMode: mode }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  setQrFile: (file) => set({ qrFile: file }),
  setQrPreview: (preview) => set({ qrPreview: preview }),

  setBaseSearchTerm: (term) => set({ baseSearchTerm: term }),
  setTargetSearchTerm: (term) => set({ targetSearchTerm: term }),

  resetForm: () =>
    set({
      currentMethod: {
        type: "Bank Account",
        accountHolderName: "",
        accountNumber: "",
        ifsc_swift: "",
        bankName: "",
        walletName: "",
        walletAddress: "",
        name: "",
        active: true,
        qrCode: null,
      },
      qrFile: null,
      qrPreview: null,
      dialogMode: "add",
    }),
}));
