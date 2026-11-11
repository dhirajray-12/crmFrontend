import axios from "axios";
import type { DepositData } from "@/types/depositePage.types";
import { formatDate, formatTime, calculateTimeTaken } from "@/utils/helpers";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export interface SubmitDepositResponse {
  amount: any;
  success: boolean;
  data?: any;
  message?: string;
}

export const mapDepositToDepositData = (deposit: any): DepositData => {
  const processedAt =
    deposit.approvedDate ??
    deposit.approvedAt ??
    deposit.processedDate ??
    deposit.updatedAt;

  return {
    id: deposit._id || deposit.id,
    _id: deposit._id || deposit.id,
    account: deposit.account?.mt5Account || deposit.account || "N/A",
    type: deposit.account?.accountType || deposit.type || "N/A",
    method:
      deposit.paymentMethod?.type === "bank"
        ? "Bank Account"
        : deposit.paymentMethod?.type === "crypto"
          ? "Crypto Wallet"
          : deposit.method ||
            deposit.paymentMethod?.type ||
            deposit.paymentType ||
            "N/A",
    amount: deposit.amount,
    dateInitiated: deposit.createdAt
      ? formatDate(deposit.createdAt)
      : deposit.dateInitiated || "-",
    timeInitiated: deposit.createdAt
      ? formatTime(deposit.createdAt)
      : deposit.timeInitiated || "-",
    dateProcessed: processedAt
      ? formatDate(processedAt)
      : deposit.dateProcessed || "-",
    timeProcessed: processedAt
      ? formatTime(processedAt)
      : deposit.timeProcessed || "-",
    timeTaken: processedAt && deposit.createdAt
      ? calculateTimeTaken(deposit.createdAt, processedAt)
      : deposit.timeTaken || "-",
    days:
      processedAt && deposit.createdAt
        ? Math.floor(
            (new Date(processedAt).getTime() -
              new Date(deposit.createdAt).getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : deposit.days || 0,
    status: deposit.status || "Pending",
    createdAt: deposit.createdAt,
    approvedDate: processedAt,
    updatedAt: deposit.updatedAt,
  };
};

export const depositApi = {
  fetchDeposits: async (): Promise<DepositData[]> => {
    try {
      const res = await axios.get<{
        success: boolean;
        data: any[];
        count: number;
      }>(`${API_BASE_URL}/clientdeposits`, {
        headers: {
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
        withCredentials: true,
      });

      return res.data.data.map(mapDepositToDepositData);
    } catch (error) {
      console.error("Error fetching deposits:", error);
      throw error;
    }
  },

  submitDeposit: async (formData: FormData): Promise<SubmitDepositResponse> => {
    const response = await axios.post<SubmitDepositResponse>(
      `${API_BASE_URL}/clientdeposits`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
        withCredentials: true,
      },
    );

    return response.data;
  },
};
