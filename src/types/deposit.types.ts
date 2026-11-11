export interface PaymentMethod {
  _id: string;
  type: string;
  bankName?: string;
  walletName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  ifsc_swift?: string;
  walletAddress?: string;
  qrCode?: string;
  paymentLink?: string;
  active: boolean;
}

export interface DepositResponse {
  success: boolean;
  data: {
    "Bank Account": PaymentMethod[];
    "Crypto Wallet": PaymentMethod[];
  };
}

export interface AccountTypeOption {
  label: string;
  value: string;
  id?: string;
}

export interface UserAccount {
  _id: string;
  mt5Account: string;
  accountType?: string;
  name?: string;
}

export interface DepositFormData {
  accountId: string;
  amount: string;
  paymentMethodId: string;
  paymentType: "bank" | "crypto";
  transactionId: string;
  proof: File | null;
}

export interface DepositModalProps {
  open: boolean;
  onClose: () => void;
  onProcessing?: () => void;
  onSuccess?: () => void;
  onError?: (msg: string) => void;
  onSubmitDeposit?: (formData: FormData) => Promise<unknown>;
  isSubmitting?: boolean;
}
