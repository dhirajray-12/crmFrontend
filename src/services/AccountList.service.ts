import type {
  AccountCreationRequest,
  BackendAccountResponse,
  GroupsAPIResponse,
} from "@/types/OpenAccount.type";
import axios from "axios";

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
interface BackendTransactionResponse {
  success: boolean;
  data: any[];
}
export const accountApi = {
  fetchGroups: async (): Promise<GroupsAPIResponse> => {
    const response = await axios.get<GroupsAPIResponse>(
      `${VITE_BACKEND_URL}/groups`,
      
      {
        headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
        withCredentials: true,
      },
    );
    return response.data;
  },

  createAccount: async (
    requestData: AccountCreationRequest,
  ): Promise<BackendAccountResponse> => {
    const response = await axios.post<BackendAccountResponse>(
      `${VITE_BACKEND_URL}/accounts/create`,
      requestData,
      {
        headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
        withCredentials: true,
      },
    );
    return response.data;
  },

  fetchAccounts: async (): Promise<BackendAccountResponse> => {
    try {
      const response = await axios.get<BackendAccountResponse>(
        `${VITE_BACKEND_URL}/accounts/`,
        {
          headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
          withCredentials: true,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching user accounts:", error);
      throw error;
    }
  },
  fetchTransactions: async (accountNumber: string) => {
    try {
      const response = await axios.get<BackendTransactionResponse>(
        `${import.meta.env.VITE_BACKEND_URL}/transactions?search=${accountNumber}&limit=100`,
        {
          headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
          withCredentials: true,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching user accounts:", error);
      throw error;
    }
  },
  updatePasswords: async (accountId: string, updateData: any) => {
    return await axios.put(
      `${VITE_BACKEND_URL}/accounts/${accountId}/passwords`,
      updateData,
      {
        headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
        withCredentials: true 
      },
    );
  },
};
