import { create } from "zustand";
import type {
  MasterAccount,
  Account,
  View,
  CreateMasterFormData,
} from "@/types/master.types";

interface MasterStore {
  // View states
  view: View;
  expandedMaster: string | null;
  searchTerm: string;

  // Data states
  masters: MasterAccount[];
  accounts: Account[];

  // UI states
  loading: boolean;
  error: string;
  isRefreshing: boolean;

  // Form states
  formData: CreateMasterFormData;
  formLoading: boolean;
  formError: string;

  // Actions
  setView: (view: View) => void;
  setExpandedMaster: (id: string | null) => void;
  setSearchTerm: (term: string) => void;
  setMasters: (masters: MasterAccount[]) => void;
  setAccounts: (accounts: Account[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  setIsRefreshing: (refreshing: boolean) => void;
  setFormData: (data: Partial<CreateMasterFormData>) => void;
  resetFormData: () => void;
  setFormLoading: (loading: boolean) => void;
  setFormError: (error: string) => void;

  // Reset actions
  resetToMain: () => void;
  resetAll: () => void;
}

const initialFormData: CreateMasterFormData = {
  nickname: "",
  accountId: "",
  commission: "",
  minimumInvestment: "",
  publicChatLink: "",
  strategyDescription: "",
};

const sameMasters = (a: MasterAccount[], b: MasterAccount[]) =>
  a.length === b.length &&
  a.every(
    (item, index) =>
      item._id === b[index]?._id &&
      item.accountDetails.mt5Account === b[index]?.accountDetails.mt5Account,
  );

const sameAccounts = (a: Account[], b: Account[]) =>
  a.length === b.length &&
  a.every(
    (item, index) =>
      item._id === b[index]?._id && item.mt5Account === b[index]?.mt5Account,
  );

export const useMasterStore = create<MasterStore>((set) => ({
  // Initial states
  view: "list",
  expandedMaster: null,
  searchTerm: "",
  masters: [],
  accounts: [],
  loading: true,
  error: "",
  isRefreshing: false,
  formData: initialFormData,
  formLoading: false,
  formError: "",

  // Actions
  setView: (view) => set({ view }),
  setExpandedMaster: (id) => set({ expandedMaster: id }),
  setSearchTerm: (term) => set({ searchTerm: term }),

  setMasters: (masters) =>
    set((state) => (sameMasters(state.masters, masters) ? state : { masters })),
  setAccounts: (accounts) =>
    set((state) =>
      sameAccounts(state.accounts, accounts) ? state : { accounts },
    ),

  setLoading: (loading) =>
    set((state) => (state.loading === loading ? state : { loading })),

  setError: (error) =>
    set((state) => (state.error === error ? state : { error })),

  setIsRefreshing: (refreshing) =>
    set((state) =>
      state.isRefreshing === refreshing ? state : { isRefreshing: refreshing },
    ),

  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),

  resetFormData: () => set({ formData: initialFormData }),
  setFormLoading: (loading) =>
    set((state) => (state.formLoading === loading ? state : { formLoading: loading })),
  setFormError: (error) =>
    set((state) => (state.formError === error ? state : { formError: error })),

  resetToMain: () =>
    set({
      view: "list",
      expandedMaster: null,
      formData: initialFormData,
      formError: "",
    }),

  resetAll: () =>
    set({
      view: "list",
      expandedMaster: null,
      searchTerm: "",
      masters: [],
      accounts: [],
      loading: true,
      error: "",
      isRefreshing: false,
      formData: initialFormData,
      formLoading: false,
      formError: "",
    }),
}));
