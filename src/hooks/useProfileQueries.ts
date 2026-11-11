import type { BankDetails, WalletDetails } from "@/Store/profile.store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_BASE = import.meta.env.VITE_BACKEND_URL;

interface ProfileResponse {
  success: boolean;
  data: any;
}

const getJsonHeaders = () => ({
  "Content-Type": "application/json",
  "x-active-role": sessionStorage.getItem("active_role") || "",
});

const getMultipartHeaders = () => ({
  "x-active-role": sessionStorage.getItem("active_role") || "",
});

// Query keys
export const profileKeys = {
  all: ["profile"] as const,
  details: () => [...profileKeys.all, "details"] as const,
  documents: () => [...profileKeys.all, "documents"] as const,
};

// Fetch profile hook
export const useProfile = () => {
  return useQuery({
    queryKey: profileKeys.details(),
    queryFn: async () => {
      const { data } = await axios.get<ProfileResponse>(`${API_BASE}/profile`, {
        headers: getJsonHeaders(),
        withCredentials: true,
      });
      return data.data;
    },
  });
};

// Upload document mutation
export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      type,
      file,
    }: {
      type: "idProof" | "kycSelfie" | "addressProof";
      file: File;
    }) => {
      const formData = new FormData();

      const fieldMap = {
        idProof: "idDocument",
        kycSelfie: "address1Document",
        addressProof: "address2Document",
      };

      formData.append(fieldMap[type], file);

      const { data } = await axios.post<ProfileResponse>(
        `${API_BASE}/profile/personal-info`,
        formData,
        {
          headers: getMultipartHeaders(),
          withCredentials: true,
        },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.details() });
    },
  });
};

export const useReverifyKyc = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await axios.delete<ProfileResponse>(
        `${API_BASE}/profile/kyc/reverify`,
        {
          headers: getJsonHeaders(),
          withCredentials: true,
        },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.details() });
    },
  });
};

// Update account mutation
export const useUpdateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bankDetails: BankDetails) => {
      const { data } = await axios.post(
        `${API_BASE}/profile/account-details`,
        bankDetails,
        {
          headers: getJsonHeaders(),
          withCredentials: true,
        },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.details() });
    },
  });
};

// Update wallet mutation
export const useUpdateWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (walletDetails: WalletDetails) => {
      const { data } = await axios.post(
        `${API_BASE}/profile/wallet-details`,
        walletDetails,
        {
          headers: getJsonHeaders(),
          withCredentials: true,
        },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.details() });
    },
  });
};
