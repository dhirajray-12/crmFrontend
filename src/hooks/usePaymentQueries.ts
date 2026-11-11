import type { ApiResponse, PaymentMethod } from "@/types/payment.types";
import { normalizeAssetUrl } from "@/utils/assetUrl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const usePaymentMethods = () => {
  return useQuery({
    queryKey: ["adminPaymentMethods"],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<PaymentMethod[]>>(
        `${API_BASE_URL}/payment-methods`,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "x-active-role": sessionStorage.getItem("active_role") || "",
          },
          withCredentials: true,
        },
      );

      const methods = Array.isArray(response.data.data)
        ? response.data.data
        : [];

      return methods.map((item) => ({
        ...item,
        qrCode: normalizeAssetUrl(item.qrCode) ?? null,
      }));
    },
  });
};

export const usePaymentMethodDetails = (id: string) => {
  return useQuery({
    queryKey: ["paymentMethod", id],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<PaymentMethod>>(
        `${API_BASE_URL}/payment-methods/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            "x-active-role": sessionStorage.getItem("active_role") || "",
          },
          withCredentials: true,
        },
      );

      const d = response.data.data;
      return {
        ...d,
        qrCode: normalizeAssetUrl(d.qrCode) ?? null,
      };
    },
    enabled: !!id,
  });
};

export const useCreatePaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await axios.post(
        `${API_BASE_URL}/payment-methods`,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPaymentMethods"] });
    },
  });
};

export const useUpdatePaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string;
      formData: FormData;
    }) => {
      const response = await axios.put(
        `${API_BASE_URL}/payment-methods/${id}`,
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminPaymentMethods"] });
      queryClient.invalidateQueries({
        queryKey: ["paymentMethod", variables.id],
      });
    },
  });
};

export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(
        `${API_BASE_URL}/payment-methods/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            "x-active-role": sessionStorage.getItem("active_role") || "",
          },
          withCredentials: true,
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPaymentMethods"] });
    },
  });
};

export const useTogglePaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const response = await axios.put(
        `${API_BASE_URL}/payment-methods/${id}`,
        { active },
        {
          headers: {
            "Content-Type": "application/json",
            "x-active-role": sessionStorage.getItem("active_role") || "",
          },
          withCredentials: true,
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPaymentMethods"] });
    },
  });
};
