export interface DepositData {
  id?: string;
  _id?: string;
  account: string;
  type: string;
  method: string;
  amount: number;
  dateInitiated: string;
  timeInitiated: string;
  dateProcessed: string;
  timeProcessed: string;
  timeTaken: string;
  days: number;
  status: string;
  createdAt?: string;
  approvedDate?: string;
  approvedAt?: string;
  updatedAt?: string;
}

export interface FilterState {
  accountTypes: string[];
  statuses: string[];
  dateFrom: string;
  dateTo: string;
}

export interface FilterOption {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface ToastMessage {
  type: "success" | "error" | "info";
  message: string;
}
