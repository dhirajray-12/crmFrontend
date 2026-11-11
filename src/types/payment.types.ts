export interface Currency {
  code: string;
  name: string;
  flag: string;
  rate: number;
  country: string;
}

export interface PaymentMethod {
  _id: string;
  type: string;
  active: boolean;
  accountHolderName?: string;
  accountNumber?: string;
  ifsc_swift?: string;
  bankName?: string;
  walletName?: string;
  walletAddress?: string;
  qrCode?: string | null;
  paymentLink?: string;
  name?: string;
  accounts?: string;
}

export interface Exchange {
  _id: string;
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  type: string;
  lastUpdated: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ToastState {
  show: boolean;
  message: string;
  type: "success" | "error";
}
