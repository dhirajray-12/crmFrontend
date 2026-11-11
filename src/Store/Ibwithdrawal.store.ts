import { create } from "zustand";
import type {
  ProfileData,
  Withdrawal,
  DashboardSummary,
  WithdrawalFormData,
  ToastMessage,
  WithdrawalStats,
  WalletOption,
} from "@/types/Ibwithdrawal.types";
import { useToastStore } from "./toast.store";

interface WithdrawalStore {
  // State
  profileData: ProfileData | null;
  withdrawals: Withdrawal[];
  dashboardSummary: DashboardSummary | null;
  formData: WithdrawalFormData;
  showWalletOptions: boolean;
  toastMessage: ToastMessage | null;
  loading: boolean;
  submitting: boolean;
  stats: WithdrawalStats;

  // Actions
  setProfileData: (data: ProfileData | null) => void;
  setWithdrawals: (withdrawals: Withdrawal[]) => void;
  setDashboardSummary: (summary: DashboardSummary | null) => void;
  setFormData: (data: Partial<WithdrawalFormData>) => void;
  resetForm: () => void;
  setShowWalletOptions: (show: boolean) => void;
  setToastMessage: (message: ToastMessage | null) => void;
  setLoading: (loading: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  updateStats: () => void;

  // Computed
  getWalletOptions: () => WalletOption[];
  getAvailableBalance: () => number;
  getFilteredWithdrawals: () => Withdrawal[];

  // Toast helpers
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  clearToast: () => void;

  // Reset
  resetStore: () => void;
}

const initialFormData: WithdrawalFormData = {
  withdrawalAmount: "",
  withdrawalMethod: "bank",
  bankName: "",
  accountHolderName: "",
  accountNumber: "",
  ifscCode: "",
  walletType: "",
  walletAddress: "",
};

const initialStats: WithdrawalStats = {
  totalWithdrawn: 0,
  pendingAmount: 0,
  completedCount: 0,
};

export const useWithdrawalStore = create<WithdrawalStore>()((set, get) => ({
  // Initial state
  profileData: null,
  withdrawals: [],
  dashboardSummary: null,
  formData: initialFormData,
  showWalletOptions: false,
  toastMessage: null,
  loading: false,
  submitting: false,
  stats: initialStats,

  // Actions
  setProfileData: (data) => {
    set({ profileData: data });
    // Pre-fill bank details if available
    if (data?.bankDetails) {
      get().setFormData({
        bankName: data.bankDetails.bankName || "",
        accountHolderName: data.bankDetails.accountHolderName || "",
        accountNumber: data.bankDetails.accountNumber || "",
        ifscCode: data.bankDetails.ifscSwiftCode || "",
      });
    }
  },

  setWithdrawals: (withdrawals) => {
    set({ withdrawals });
    get().updateStats();
  },

  setDashboardSummary: (summary) => set({ dashboardSummary: summary }),

  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),

  resetForm: () => {
    const { profileData } = get();
    set({
      formData: {
        ...initialFormData,
        bankName: profileData?.bankDetails?.bankName || "",
        accountHolderName: profileData?.bankDetails?.accountHolderName || "",
        accountNumber: profileData?.bankDetails?.accountNumber || "",
        ifscCode: profileData?.bankDetails?.ifscSwiftCode || "",
      },
      showWalletOptions: false,
    });
  },

  setShowWalletOptions: (show) => set({ showWalletOptions: show }),

  setToastMessage: (message) => set({ toastMessage: message }),

  setLoading: (loading) => set({ loading }),

  setSubmitting: (submitting) => set({ submitting }),

  updateStats: () => {
    const { withdrawals } = get();
    const stats = {
      totalWithdrawn: withdrawals
        .filter((w) => w.status === "approved" || w.status === "completed")
        .reduce((sum, w) => sum + w.amount, 0),
      pendingAmount: withdrawals
        .filter((w) => w.status === "pending")
        .reduce((sum, w) => sum + w.amount, 0),
      completedCount: withdrawals.filter(
        (w) => w.status === "approved" || w.status === "completed",
      ).length,
    };
    set({ stats });
  },

  // Computed
  getWalletOptions: () => {
    const { profileData } = get();
    const walletDetails = profileData?.walletDetails;

    return [
      {
        type: "USDT",
        address: walletDetails?.tetherWalletAddress || "",
        network: "TRC20/ERC20",
      },
      {
        type: "ETH",
        address: walletDetails?.ethWalletAddress || "",
        network: "ERC20",
      },
      {
        type: "TRX",
        address: walletDetails?.trxWalletAddress || "",
        network: "TRC20",
      },
    ];
  },

  getAvailableBalance: () => {
    const { dashboardSummary, profileData } = get();
    return (
      dashboardSummary?.withdrawableBalance ??
      profileData?.availableBalance ??
      0
    );
  },

  getFilteredWithdrawals: () => {
    return get().withdrawals;
  },

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
      profileData: null,
      withdrawals: [],
      dashboardSummary: null,
      formData: initialFormData,
      showWalletOptions: false,
      toastMessage: null,
      loading: false,
      submitting: false,
      stats: initialStats,
    }),
}));
