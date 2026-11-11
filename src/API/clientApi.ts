import axios, { AxiosHeaders } from "axios";
import type { Account, Transaction } from "./type";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const activeRole = sessionStorage.getItem("active_role") || "";
  const headers = config.headers;

  if (headers?.set) {
    headers.set("Content-Type", "application/json");

    if (activeRole) {
      headers.set("x-active-role", activeRole);
    } else {
      headers.delete("x-active-role");
    }
  } else {
    const nextHeaders = new AxiosHeaders(headers);
    nextHeaders.set("Content-Type", "application/json");

    if (activeRole) {
      nextHeaders.set("x-active-role", activeRole);
    } else {
      nextHeaders.delete("x-active-role");
    }

    config.headers = nextHeaders;
  }

  return config;
});

// -----------------------------
// ACCOUNTS API
// -----------------------------

export const getAccounts = async () => {
  const res = await api.get<{ data: Account[] }>("/accounts");
  return res.data.data;
};

export const getSingleAccount = async (accountId: string) => {
  const res = await api.get<{ data: Account }>(
    `/accounts/${accountId}/refresh`,
  );
  return res.data.data;
};

// -----------------------------
// TRANSACTIONS API
// -----------------------------

export const getTransactions = async (limit: number = 50) => {
  const res = await api.get<{ data: Transaction[] }>(
    `/transactions?limit=${limit}`,
  );
  return res.data.data;
};

export const exportTransactions = async () => {
  const res = await api.get<{ data: Transaction[] }>("/transactions/export");
  return res.data.data;
};

/**
 * Get transactions for chart visualization with date filtering
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Array of transactions
 */
export const getTransactionsForChart = async (
  startDate: string,
  endDate: string,
) => {
  const res = await api.get<{ success: boolean; data: Transaction[] }>(
    `/transactions/export?type=all&status=all&startDate=${startDate}&endDate=${endDate}`,
  );

  if (!res.data.success) {
    throw new Error("Failed to fetch transactions for chart");
  }
  return res.data.data;
};

/**
 * Get transactions with advanced filtering options
 * @param params - Filter parameters
 * @returns Paginated transaction response
 */
export const getFilteredTransactions = async (params: {
  type?: "all" | "deposit" | "withdrawal" | "transfer";
  status?: "all" | "Pending" | "Approved" | "Rejected";
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const res = await api.get<{
    success: boolean;
    count: number;
    data: Transaction[];
    pagination: {
      page: number;
      pages: number;
      limit: number;
    };
  }>(`/transactions?${queryParams.toString()}`);

  return res.data;
};

export default api;
