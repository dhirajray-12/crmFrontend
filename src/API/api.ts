// src/hooks/useAPI.ts
import axios from "axios";
import { useMemo } from "react";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const useAPI = () => {
  const apiClient = useMemo(() => {
    const client = axios.create({
      baseURL: API_BASE_URL,
      headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
      withCredentials: true,
    });

    return client;
  }, []);

  const dashboardAPI = useMemo(
    () => ({
      getStats: async () => {
        const response = await apiClient.get("/admin/dashboard/stats");
        return response.data;
      },
      getRevenueChart: async () => {
        const response = await apiClient.get("/admin/dashboard/revenue-chart");
        return response.data;
      },
      getClientDistribution: async () => {
        const response = await apiClient.get(
          "/admin/dashboard/client-distribution",
        );
        return response.data;
      },
      getAccountsByType: async (type: string, page = 1, limit = 10) => {
        const response = await apiClient.get(
          `/admin/dashboard/client-distribution/${encodeURIComponent(type)}`,
          { params: { page, limit } }
        );
        return response.data;
      },
      getRecentTransactions: async (limit = 10) => {
        const response = await apiClient.get("/admin/transactions", {
          params: { limit },
        });
        return response.data;
      },
      getDailyStats: async () => {
        const response = await apiClient.get("/admin/dashboard/daily-stats");
        return response.data;
      },
      getTopClients: async (limit = 10) => {
        const response = await apiClient.get("/admin/dashboard/top-clients", {
          params: { limit },
        });
        return response.data;
      },
      getRiskExposure: async () => {
        const response = await apiClient.get(
          "/admin/dashboard/risk-exposure",
        );
        return response.data;
      },
      getRiskThresholds: async () => {
        const response = await apiClient.get(
          "/admin/dashboard/risk-thresholds",
        );
        return response.data;
      },
      updateRiskThresholds: async (data: {
        enabled?: boolean;
        maxFloatingLossUsd?: number;
        maxSymbolNetLots?: number;
      }) => {
        const response = await apiClient.put(
          "/admin/dashboard/risk-thresholds",
          data,
        );
        return response.data;
      },
    }),
    [apiClient],
  );

  const transactionAPI = useMemo(
    () => ({
      getAll: async () => {
        const response = await apiClient.get("/admin/transactions/all");
        return response.data;
      },
    }),
    [apiClient],
  );

  const depositAPI = useMemo(
    () => ({
      getAll: async (params: Record<string, any> = {}) => {
        const response = await apiClient.get("/admindeposits", { params });
        return response.data;
      },
      getById: async (id: string) => {
        const response = await apiClient.get(`/admindeposits/${id}`);
        return response.data;
      },
      approve: async (
        id: string,
        data: { bonus?: number; remarks?: string },
      ) => {
        const response = await apiClient.put(
          `/admindeposits/${id}/approve`,
          data,
        );
        return response.data;
      },
      reject: async (id: string, data: { remarks: string }) => {
        const response = await apiClient.put(
          `/admindeposits/${id}/reject`,
          data,
        );
        return response.data;
      },
      export: async (format: string, params: Record<string, any> = {}) => {
        const response = await apiClient.get("/admindeposits/export", {
          params: { ...params, format },
          responseType: "blob",
        });
        return response.data;
      },
    }),
    [apiClient],
  );

  const withdrawalAPI = useMemo(
    () => ({
      getAll: async () => {
        const response = await apiClient.get("/adminwithdrawals");
        return response.data;
      },
      approve: async (id: string, data: { remarks?: string }) => {
        const response = await apiClient.put(
          `/adminwithdrawals/${id}/approve`,
          data,
        );
        return response.data;
      },
      reject: async (id: string, data: { remarks: string }) => {
        const response = await apiClient.put(
          `/adminwithdrawals/${id}/reject`,
          data,
        );
        return response.data;
      },
    }),
    [apiClient],
  );

  const clientAPI = useMemo(
    () => ({
      getAll: async () => {
        const response = await apiClient.get("/clients");
        return response.data;
      },
      getById: async (id: string) => {
        const response = await apiClient.get(`/clients/${id}`);
        return response.data;
      },
      update: async (id: string, data: any) => {
        const response = await apiClient.put(`/clients/${id}`, data);
        return response.data;
      },
      getUserAccounts: async (userId: string) => {
        const response = await apiClient.get(`/clients/${userId}/accounts`);
        return response.data;
      },
      getRiskScore: async (id: string) => {
        const response = await apiClient.get(`/clients/${id}/risk-score`);
        return response.data;
      },
      getTimeMachine: async (id: string, at: string, accountId?: string) => {
        const response = await apiClient.get(`/clients/${id}/time-machine`, {
          params: { at, ...(accountId ? { accountId } : {}) },
        });
        return response.data;
      },
      exportExcel: async () => {
        const response = await apiClient.get("/clients/export/excel", {
          responseType: "blob",
        });
        return response.data;
      },
      exportPDF: async () => {
        const response = await apiClient.get("/clients/export/pdf", {
          responseType: "blob",
        });
        return response.data;
      },
    }),
    [apiClient],
  );

  return {
    apiClient,
    dashboardAPI,
    transactionAPI,
    depositAPI,
    withdrawalAPI,
    clientAPI,
  };
};
export default useAPI;
