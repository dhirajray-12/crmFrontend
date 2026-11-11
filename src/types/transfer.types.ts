export interface Account {
  _id: string;
  mt5Account: string;
  accountType: string;
  balance: number;
}

export interface Transfer {
  _id: string;
  fromAccount: {
    _id: string;
    mt5Account: string;
    accountType: string;
  };
  toAccount: {
    _id: string;
    mt5Account: string;
    accountType: string;
  };
  amount: number;
  status: string;
  createdAt: string;
}

export interface FilterState {
  accountTypes: string[];
  statuses: string[];
  dateFrom: string;
  dateTo: string;
}

export interface TransferFilterOption {
  value: string;
  label: string;
  color: string;
}

export interface ToastMessage {
  type: "success" | "error" | "info";
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface CalendarProps {
  value: string;
  onChange: (date: string) => void;
  label: string;
  minDate?: string;
  maxDate?: string;
}

export interface TransferFormData {
  fromAccount: Account | null;
  toAccount: Account | null;
  amount: string;
}
