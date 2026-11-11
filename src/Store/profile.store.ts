import { create } from "zustand";
export interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  ifscSwiftCode: string;
}

export interface WalletDetails {
  tetherWalletAddress: string;
  ethWalletAddress: string;
  trxWalletAddress: string;
}

export interface DocumentState {
  file: File | null;
  uploaded: boolean;
}

export interface Documents {
  idProof: DocumentState;
  kycSelfie: DocumentState;
  addressProof: DocumentState;
}

interface ProfileStore {
  // State
  activeSection: "personal" | "account" | "wallet";
  bankDetails: BankDetails;
  walletDetails: WalletDetails;
  documents: Documents;

  // Actions
  setActiveSection: (section: "personal" | "account" | "wallet") => void;
  setBankDetails: (details: BankDetails) => void;
  updateBankDetails: (key: keyof BankDetails, value: string) => void;
  setWalletDetails: (details: WalletDetails) => void;
  updateWalletDetails: (key: keyof WalletDetails, value: string) => void;
  setDocument: (type: keyof Documents, file: File | null) => void;
  setDocumentUploaded: (type: keyof Documents, uploaded: boolean) => void;
  resetDocuments: () => void;
  initializeFromProfile: (profileData: any) => void;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  // Initial state
  activeSection: "personal",
  bankDetails: {
    bankName: "",
    accountNumber: "",
    accountHolderName: "",
    ifscSwiftCode: "",
  },
  walletDetails: {
    tetherWalletAddress: "",
    ethWalletAddress: "",
    trxWalletAddress: "",
  },
  documents: {
    idProof: { file: null, uploaded: false },
    kycSelfie: { file: null, uploaded: false },
    addressProof: { file: null, uploaded: false },
  },

  // Actions
  setActiveSection: (section) => set({ activeSection: section }),

  setBankDetails: (details) => set({ bankDetails: details }),

  updateBankDetails: (key, value) =>
    set((state) => ({
      bankDetails: { ...state.bankDetails, [key]: value },
    })),

  setWalletDetails: (details) => set({ walletDetails: details }),

  updateWalletDetails: (key, value) =>
    set((state) => ({
      walletDetails: { ...state.walletDetails, [key]: value },
    })),

  setDocument: (type, file) =>
    set((state) => ({
      documents: {
        ...state.documents,
        [type]: { file, uploaded: false },
      },
    })),

  setDocumentUploaded: (type, uploaded) =>
    set((state) => ({
      documents: {
        ...state.documents,
        [type]: { ...state.documents[type], uploaded },
      },
    })),

  resetDocuments: () =>
    set({
      documents: {
        idProof: { file: null, uploaded: false },
        kycSelfie: { file: null, uploaded: false },
        addressProof: { file: null, uploaded: false },
      },
    }),

  initializeFromProfile: (profileData) =>
    set((state) => {
      const bankSource =
        profileData?.bankDetails ||
        profileData?.accountDetails ||
        profileData?.bankAccountDetails ||
        {};
      const walletSource = profileData?.walletDetails || {};

      return {
        bankDetails: {
          bankName: bankSource.bankName || "",
          accountNumber: bankSource.accountNumber || "",
          accountHolderName: bankSource.accountHolderName || "",
          ifscSwiftCode:
            bankSource.ifscSwiftCode ||
            bankSource.ifsc_swift ||
            bankSource.swiftCode ||
            "",
        },
        walletDetails: {
          tetherWalletAddress: walletSource.tetherWalletAddress || "",
          ethWalletAddress: walletSource.ethWalletAddress || "",
          trxWalletAddress:
            walletSource.trxWalletAddress ||
            walletSource.tronWalletAddress ||
            "",
        },
        activeSection: state.activeSection,
      };
    }),
}));
