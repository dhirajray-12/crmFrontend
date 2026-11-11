export interface Transaction {
  id: number | string;
  date: string;
  rawDate?: string;
  time?: string;
  timetaken: string;
  type: string;
  description: string;
  amount: number;
  transactionType: string;
  account: string;
  accountType?: string;
  status: "Success" | "Failed" | "Pending";
  createdAt?: string;
  approveDate?: string;
  processedDate?: string;
  details?: string;
}

export interface TransactionApiResponse {
  success: boolean;
  message?: string;
  data: TransactionApiData[] | { transactions: TransactionApiData[] };
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface TransactionApiData {
  id?: string | number;
  date: string;
  createdAt?: string;
  approvedDate?: string;
  processedDate?: string;
  accountType?: string;
  type: string;
  rawAmount?: number;
  amount?: number;
  formattedAmount?: string;
  account?: string;
  status: string;
  description?: string;
  details?: string;
  timeTaken?: number;
}

export interface FilterState {
  search: string;
  filterType: string;
  selectedDate: Date | null;
}

export interface ColorScheme {
  color1: string;
  color2: string;
}
