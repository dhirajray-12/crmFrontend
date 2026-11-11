import type {
  CreateAccountApiResponse,
  CreateAccountPayload,
  GroupsApiResponse,
} from "@/types/createAccount.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const useAccountTypes = () => {

  return useQuery({
    queryKey: ["accountTypes"],
    queryFn: async () => {
      const response = await axios.get<GroupsApiResponse>(
        `${API_BASE_URL}/groups`,
        {
          headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
          withCredentials: true,
        },
      );

      if (!response.data.success) {
        throw new Error("Failed to fetch account types");
      }

      const activeGroups = response.data.data.filter((group) => group.active);

      return activeGroups;
    },
    enabled: true,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateAccountPayload) => {
      const response = await axios.post<CreateAccountApiResponse>(
        `${API_BASE_URL}/accounts/create`,
        payload,
        {
          headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
          withCredentials: true,
        },
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to create account");
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["myAccountsList"] });
      queryClient.invalidateQueries({ queryKey: ["availableBalances"] });
    },
  });
};
