// Bank Details
export interface BankDetails {
  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  ifscSwiftCode?: string;
}

// Wallet Details
export interface WalletDetails {
  walletType?: string;
  walletAddress?: string;
  tetherWalletAddress?: string;
  ethWalletAddress?: string;
  trxWalletAddress?: string;
}

// Profile Data
export interface ProfileData {
  user: {
    firstname: string;
    lastname: string;
    email: string;
  };
  bankDetails: BankDetails;
  walletDetails: WalletDetails;
  availableBalance: number;
}

// Withdrawal
export interface Withdrawal {
  _id: string;
  amount: number;
  withdrawalMethod: string;
  status: "pending" | "approved" | "rejected" | "completed";
  createdAt: string;
  approvedDate?: string;
  bankDetails?: BankDetails;
  walletDetails?: WalletDetails;
}

// Dashboard Summary
export interface DashboardSummary {
  totalCommission: number;
  withdrawableBalance: number;
  totalWithdrawals: number;
  partnersCount: number;
}

// Form Data
export interface WithdrawalFormData {
  withdrawalAmount: string;
  withdrawalMethod: "bank" | "wallet";
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  walletType: string;
  walletAddress: string;
}

// API Responses
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ProfileResponse extends ApiResponse<ProfileData> {
  profile?: ProfileData;
}

export interface DashboardSummaryResponse
  extends ApiResponse<DashboardSummary> {
  summary?: DashboardSummary;
}

export interface WithdrawalHistoryResponse extends ApiResponse<Withdrawal[]> {
  withdrawals?: Withdrawal[];
}

export interface WithdrawalRequestResponse extends ApiResponse<Withdrawal> {
  withdrawal?: Withdrawal;
}

// Toast Types
export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  type: ToastType;
  message: string;
}

// Wallet Option
export interface WalletOption {
  type: string;
  address: string;
  network: string;
}

// Stats
export interface WithdrawalStats {
  totalWithdrawn: number;
  pendingAmount: number;
  completedCount: number;
}
