import axios from "axios";
import type { TransactionApiResponse } from "@/types/TransactionHistory.type";

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export interface FetchTransactionsParams {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export const transactionApi = {
  fetchTransactions: async (
    paramsInput: FetchTransactionsParams = {},
  ): Promise<TransactionApiResponse> => {
    try {
      const {
        page = 1,
        limit = 100,
        type,
        status,
        startDate,
        endDate,
        search,
      } = paramsInput;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (type && type !== "All") {
        params.append("type", type.toLowerCase());
      }

      if (status && status !== "All") {
        params.append("status", status);
      }

      if (startDate) {
        params.append("startDate", startDate);
      }

      if (endDate) {
        params.append("endDate", endDate);
      }

      if (search) {
        params.append("search", search);
      }

      const response = await axios.get<TransactionApiResponse>(
        `${VITE_BACKEND_URL}/transactions?${params.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            "x-active-role": sessionStorage.getItem("active_role") || "",
          },
          withCredentials: true,
        },
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  },
};