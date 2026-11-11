// hooks/usePartnerQueries.ts
import type { WithdrawalFormData } from "@/types/PartnerDasboard.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const usePartnerQueries = () => {
  const queryClient = useQueryClient();

  // Query Keys
  const keys = {
    ibConfig: ["ibConfig"],
    dashboard: ["dashboard"],
    partners: ["partners"],
    withdrawals: ["withdrawals"],
    pendingDownline: ["pendingDownline"],
  };

  // Fetch IB Configuration
  const useIBConfig = () =>
    useQuery({
      queryKey: keys.ibConfig,
      queryFn: async () => {
        const response = await fetch(
          `${API_BASE_URL}/ibclients/ib-configurations/my-code`,
          {
            headers: {
              "Content-Type": "application/json",
              "x-active-role": sessionStorage.getItem("active_role") || "",
            },
            credentials: "include",
          },
        );
        const data = await response.json();
        return data.success ? data.ibConfiguration : null;
      },
      enabled: true,
    });

  // Create IB Configuration
  const useCreateIBConfig = () =>
    useMutation({
      mutationFn: async () => {
        const response = await fetch(
          `${API_BASE_URL}/ibclients/ib-configurations/create`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-active-role": sessionStorage.getItem("active_role") || "",
            },
            credentials: "include",
          },
        );
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: keys.ibConfig });
      },
    });

  // Fetch Dashboard Summary
  const useDashboardSummary = () =>
    useQuery({
      queryKey: keys.dashboard,
      queryFn: async () => {
        const response = await fetch(
          `${API_BASE_URL}/ibclients/ib-configurations/dashboard`,
          {
            headers: {
              "Content-Type": "application/json",
              "x-active-role": sessionStorage.getItem("active_role") || "",
            },
            credentials: "include",
          },
        );
        const data = await response.json();
        return data.success
          ? data.summary
          : {
              totalCommission: 0,
              todayCommission: 0,
              withdrawableBalance: 0,
              totalWithdrawals: 0,
              partnersCount: 0,
              commissionMode: "waterfall",
            };
      },
      enabled: true,
    });

  // Fetch Partners
  const usePartners = () =>
    useQuery({
      queryKey: keys.partners,
      queryFn: async () => {
        const response = await fetch(
          `${API_BASE_URL}/ibclients/ib-configurations/partners`,
          {
            headers: {
              "Content-Type": "application/json",
              "x-active-role": sessionStorage.getItem("active_role") || "",
            },
            credentials: "include",
          },
        );
        const data = await response.json();
        return data.success ? data.partners : [];
      },
      enabled: true,
    });

  // Fetch Withdrawals
  const useWithdrawals = () =>
    useQuery({
      queryKey: keys.withdrawals,
      queryFn: async () => {
        const response = await fetch(
          `${API_BASE_URL}/ibclients/withdrawals/history`,
          {
            headers: {
              "Content-Type": "application/json",
              "x-active-role": sessionStorage.getItem("active_role") || "",
            },
            credentials: "include",
          },
        );
        const data = await response.json();
        return data.success ? data.withdrawals : [];
      },
      enabled: true,
    });

  // Request Withdrawal
  const useRequestWithdrawal = () =>
    useMutation({
      mutationFn: async (formData: WithdrawalFormData) => {
        const payload: any = { amount: parseFloat(formData.amount) };

        if (formData.method === "bank") {
          payload.bankName = formData.bankName;
          payload.accountNumber = formData.accountNumber;
          payload.accountHolderName = formData.accountHolderName;
          payload.ifscCode = formData.ifscCode;
        } else {
          payload.cryptoAddress = formData.cryptoAddress;
          payload.cryptoNetwork = formData.cryptoNetwork;
        }

        const response = await fetch(
          `${API_BASE_URL}/ibclients/withdrawals/request`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-active-role": sessionStorage.getItem("active_role") || "",
            },
            credentials: "include",
            body: JSON.stringify(payload),
          },
        );
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: keys.withdrawals });
        queryClient.invalidateQueries({ queryKey: keys.dashboard });
      },
    });

  // Fetch pending downline assignments (direct referrals awaiting a commission)
  const usePendingDownline = () =>
    useQuery({
      queryKey: keys.pendingDownline,
      queryFn: async () => {
        const response = await fetch(
          `${API_BASE_URL}/ibclients/ib-configurations/downline/pending`,
          {
            headers: {
              "Content-Type": "application/json",
              "x-active-role": sessionStorage.getItem("active_role") || "",
            },
            credentials: "include",
          },
        );
        const data = await response.json();
        return data.success
          ? { pending: data.pending, myMaximumCommission: data.myMaximumCommission }
          : { pending: [], myMaximumCommission: null };
      },
      enabled: true,
    });

  // Assign commission to a direct downline referral
  const useAssignDownlineCommission = () =>
    useMutation({
      mutationFn: async ({
        childConfigId,
        maximumCommission,
      }: {
        childConfigId: string;
        maximumCommission: number;
      }) => {
        const response = await fetch(
          `${API_BASE_URL}/ibclients/ib-configurations/downline/${childConfigId}/commission`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "x-active-role": sessionStorage.getItem("active_role") || "",
            },
            credentials: "include",
            body: JSON.stringify({ maximumCommission }),
          },
        );
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: keys.pendingDownline });
        queryClient.invalidateQueries({ queryKey: keys.partners });
        queryClient.invalidateQueries({ queryKey: keys.ibConfig });
      },
    });

  return {
    useIBConfig,
    useCreateIBConfig,
    useDashboardSummary,
    usePartners,
    useWithdrawals,
    useRequestWithdrawal,
    usePendingDownline,
    useAssignDownlineCommission,
  };
};
