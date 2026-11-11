export interface Account {
  _id: string;
  account: string;
  balance: string;
  color: string;
  accountType: string;
  accountNumber: string;
}

export interface WithdrawalFormData {
  account: string;
  amount: string;
  method: string;
  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  walletType?: string;
  walletAddress?: string;
}

export interface SavedWallets {
  usdt: string;
  eth: string;
  tron: string;
}

export interface SavedBankDetails {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
}

export interface SavedPayoutDetails {
  bankDetails: SavedBankDetails | null;
  wallets: SavedWallets | null;
}

export interface WithdrawalFormProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalances: Account[];
  onSuccess?: () => void;
  savedWallets?: SavedWallets | null;
}

export interface WalletOption {
  id: string;
  name: string;
  address: string;
  description: string;
  network: string;
  fee: string;
  processingTime: string;
}

export interface ToastMessage {
  type: "success" | "error" | "info";
  message: string;
}

export interface WithdrawalRequestBody {
  accountId?: string;
  accountNumber?: string;
  accountType?: string;
  amount: number;
  paymentMethod: string;
  otpVerified: boolean;
  bankDetails?: {
    bankName?: string;
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
  };
  eWalletDetails?: {
    type: string;
    walletId?: string;
  };
}
