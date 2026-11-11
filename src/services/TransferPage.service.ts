import axios from "axios";
import type { ApiResponse, Account, Transfer } from "@/types/transfer.types";
import { API_BASE } from "../utils/constants";

interface TransferListResponse extends ApiResponse<Transfer[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const normalizeTransferStatus = (status?: string) => {
  switch (String(status || "").trim().toLowerCase()) {
    case "approved":
    case "completed":
    case "success":
      return "Completed";
    case "rejected":
    case "failed":
      return "Failed";
    default:
      return "Pending";
  }
};

export const normalizeTransfer = (transfer: Transfer): Transfer => ({
  ...transfer,
  status: normalizeTransferStatus(transfer.status),
});

export const transferApi = {
  fetchAccounts: async (): Promise<Account[]> => {
    const response = await axios.get<ApiResponse<Account[]>>(
      `${API_BASE}/accounts`,
      {
        headers: {
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
        withCredentials: true,
      },
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch accounts");
    }

    return response.data.data || [];
  },

  fetchTransfers: async (
    page: number = 1,
    limit: number = 20,
    status: string = "all",
  ): Promise<Transfer[]> => {
    const response = await axios.get<TransferListResponse>(
      `${API_BASE}/transfers?page=${page}&limit=${limit}&status=${status}`,
      {
        headers: {
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
        withCredentials: true,
      },
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch transfers");
    }

    return (response.data.data || []).map(normalizeTransfer);
  },

  createTransfer: async (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
  ) => {
    const response = await axios.post<ApiResponse<any>>(
      `${API_BASE}/transfers`,
      {
        fromAccountId,
        toAccountId,
        amount,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
        withCredentials: true,
      },
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Transfer failed");
    }

    return response.data;
  },
};
