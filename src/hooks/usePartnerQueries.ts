import { partnerService } from "@/services/partner.service";
import { usePartnerStore } from "@/Store/partner.store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query keys
export const partnerKeys = {
  all: ["partner"] as const,
  config: () => [...partnerKeys.all, "config"] as const,
  dashboard: () => [...partnerKeys.all, "dashboard"] as const,
};

export const usePartnerConfigQuery = () => {
  return useQuery({
    queryKey: partnerKeys.config(),
    queryFn: async () => {
      return await partnerService.fetchPartnerConfig();
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
};

export const useDashboardSummaryQuery = () => {
  return useQuery({
    queryKey: partnerKeys.dashboard(),
    queryFn: async () => {
      return await partnerService.fetchDashboardSummary();
    },
    retry: 1,
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreatePartnerMutation = () => {
  const queryClient = useQueryClient();
  const { setIsCreating } = usePartnerStore();

  return useMutation({
    mutationFn: async () => {
      setIsCreating(true);
      try {
        const config = await partnerService.createPartnerConfig();
        return config;
      } finally {
        setIsCreating(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.config() });
      queryClient.invalidateQueries({ queryKey: partnerKeys.dashboard() });
    },
  });
};

export const useRefreshPartnerData = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: partnerKeys.config() });
    queryClient.invalidateQueries({ queryKey: partnerKeys.dashboard() });
  };
};