import axios from "axios";
import type {
  GroupsAPIResponse,
  BackendAccountResponse,
  AccountCreationRequest,
} from "@/types/OpenAccount.type";

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

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
};
