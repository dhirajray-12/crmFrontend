export interface FilterState {
  accountTypes: string[];
  statuses: string[];
  dateFrom: string;
  dateTo: string;
}

export interface FilterOptions {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface Account {
  _id: string;
  account: string;
  balance: string;
  color: string;
  accountType: string;
  accountNumber: string;
  rawBalance?: number;
}

export interface Withdrawal {
  id: string;
  rawDate: string;
  dateInitiated: string;
  processedDate: string;
  initiatedtime: string;
  processedtime: string;
  method: string;
  amount: string;
  account: string;
  accounttype: string;
  status: string;
  timetaken: string;
  daysTaken?: string;
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

export interface OTPState {
  otpKey: string;
  otp: string;
  isOTPSent: boolean;
  isOTPVerified: boolean;
  isSendingOTP: boolean;
  isVerifyingOTP: boolean;
  otpTimer: number;
  canResend: boolean;
}

export interface ToastMessage {
  type: "success" | "error" | "info";
  message: string;
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

export interface WalletOption {
  id: string;
  name: string;
  address: string;
  description: string;
  network: string;
  fee: string;
  processingTime: string;
}

export interface WithdrawalAPIResponse {
  success: boolean;
  data: any;
  count?: number;
}

export interface AccountApiResponse {
  _id: string;
  mt5Account: string;
  balance: number;
  accountType: string;
}
