import type {
  ApiResponse,
  MasterTrader,
  SetupCopyingData,
  UserAccount,
} from "@/types/rating.types";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const apiService = {
  getAllMasters: async (): Promise<ApiResponse<MasterTrader[]>> => {
    const response = await fetch(`${API_BASE_URL}/copy-rating/masters`, {
      headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch masters");
    return response.json();
  },

  getUserAccounts: async (): Promise<ApiResponse<UserAccount[]>> => {
    const response = await fetch(`${API_BASE_URL}/accounts/copy-accounts`, {
      headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch user accounts");
    return response.json();
  },

  getMasterDetails: async (
    masterId: string,
  ): Promise<ApiResponse<MasterTrader>> => {
    const response = await fetch(
      `${API_BASE_URL}/copy-rating/master/${masterId}`,
      {
        headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
        credentials: "include",
      },
    );
    if (!response.ok) throw new Error("Failed to fetch master details");
    return response.json();
  },

  setupCopying: async (data: SetupCopyingData): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/copy-rating/setup-copying`, {
      method: "POST",
      headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to setup copying");
    return response.json();
  },
};
