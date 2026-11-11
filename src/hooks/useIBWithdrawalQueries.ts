import { withdrawalService } from "@/services/Ibwithdrawal.service";
import { useWithdrawalStore } from "@/Store/Ibwithdrawal.store";
import type { WithdrawalFormData } from "@/types/Ibwithdrawal.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query keys
export const withdrawalKeys = {
  all: ["withdrawal"] as const,
  profile: () => [...withdrawalKeys.all, "profile"] as const,
  dashboard: () => [...withdrawalKeys.all, "dashboard"] as const,
  history: () => [...withdrawalKeys.all, "history"] as const,
};

export const useProfileQuery = () => {
  const { setProfileData, setLoading, showError } = useWithdrawalStore();

  return useQuery({
    queryKey: withdrawalKeys.profile(),
    queryFn: async () => {
      setLoading(true);
      try {
        const profile = await withdrawalService.fetchProfileDetails();
        setProfileData(profile);
        return profile;
      } catch (error: any) {
        showError(error.message || "Failed to load profile");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useDashboardSummaryQuery = () => {
  const { setDashboardSummary } = useWithdrawalStore();

  return useQuery({
    queryKey: withdrawalKeys.dashboard(),
    queryFn: async () => {
      const summary = await withdrawalService.fetchDashboardSummary();
      setDashboardSummary(summary);
      return summary;
    },
    retry: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useWithdrawalHistoryQuery = () => {
  const { setWithdrawals, showError } = useWithdrawalStore();

  return useQuery({
    queryKey: withdrawalKeys.history(),
    queryFn: async () => {
      try {
        const withdrawals =
          await withdrawalService.fetchWithdrawalHistory();
        setWithdrawals(withdrawals);
        return withdrawals;
      } catch (error: any) {
        showError(error.message || "Failed to load withdrawal history");
        throw error;
      }
    },
    retry: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useSubmitWithdrawalMutation = () => {
  const queryClient = useQueryClient();
  const { profileData, showSuccess, showError, setSubmitting, resetForm } =
    useWithdrawalStore();

  return useMutation({
    mutationFn: async (formData: WithdrawalFormData) => {
      if (!profileData) throw new Error("Profile data not loaded");

      setSubmitting(true);
      try {
        return await withdrawalService.submitWithdrawalRequest(
          formData,
          profileData,
        );
      } finally {
        setSubmitting(false);
      }
    },
    onSuccess: () => {
      showSuccess("Withdrawal request submitted successfully!");
      resetForm();
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: withdrawalKeys.profile() });
      queryClient.invalidateQueries({ queryKey: withdrawalKeys.history() });
      queryClient.invalidateQueries({ queryKey: withdrawalKeys.dashboard() });

      
    },
    onError: (error: any) => {
      showError(error.message || "Failed to submit withdrawal request");
    },
  });
};

export const useCancelWithdrawalMutation = () => {

  const queryClient = useQueryClient();
  const { showSuccess, showError } = useWithdrawalStore();

  return useMutation({
    mutationFn: async (withdrawalId: string) => {
      await withdrawalService.cancelWithdrawal( withdrawalId);
    },
    onSuccess: () => {
      showSuccess("Withdrawal request cancelled");
      queryClient.invalidateQueries({ queryKey: withdrawalKeys.history() });
      queryClient.invalidateQueries({ queryKey: withdrawalKeys.profile() });
      queryClient.invalidateQueries({ queryKey: withdrawalKeys.dashboard() });
    },
    onError: (error: any) => {
      showError(error.message || "Failed to cancel withdrawal");
    },
  });
};

export const useRefreshWithdrawalData = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: withdrawalKeys.all });
  };
};
