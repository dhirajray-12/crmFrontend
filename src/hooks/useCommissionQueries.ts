import { commissionService } from "@/services/commissionPage.service";
import { useCommissionStore } from "@/Store/commission.store";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Query keys
export const commissionKeys = {
  all: ["commission"] as const,
  partners: () => [...commissionKeys.all, "partners"] as const,
  summary: (period?: number) =>
    [...commissionKeys.all, "summary", period] as const,
  todaySummary: () => [...commissionKeys.all, "summary", "today"] as const,
  tradeCommissions: () => [...commissionKeys.all, "trade-commissions"] as const,
  partnerTrades: (partnerId: string) =>
    [...commissionKeys.all, "partner-trades", partnerId] as const,
};

export const usePartnersQuery = () => {
  const { setPartners, setLoading, showError } = useCommissionStore();

  return useQuery({
    queryKey: commissionKeys.partners(),
    queryFn: async () => {
      setLoading(true);
      try {
        const partners = await commissionService.fetchPartners();
        setPartners(partners);
        return partners;
      } catch (error: any) {
        showError(error.message || "Failed to load partners");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSummaryQuery = (period: number = 30) => {
  const { setSummary } = useCommissionStore();

  return useQuery({
    queryKey: commissionKeys.summary(period),
    queryFn: async () => {
      const summary = await commissionService.fetchSummary(period);
      setSummary(summary);
      return summary;
    },
    retry: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useTodaySummaryQuery = () => {
  const { setTodaySummary } = useCommissionStore();

  return useQuery({
    queryKey: commissionKeys.todaySummary(),
    queryFn: async () => {
      const todaySummary = await commissionService.fetchTodaySummary();
      setTodaySummary(todaySummary);
      return todaySummary;
    },
    retry: 1,
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useTradeCommissionsQuery = () => {
  const { setTradeCommissions, showError } = useCommissionStore();

  return useQuery({
    queryKey: commissionKeys.tradeCommissions(),
    queryFn: async () => {
      try {
        const data = await commissionService.fetchTradeCommissions();
        setTradeCommissions(data);
        return data;
      } catch (error: any) {
        showError(error.message || "Failed to load trade commissions");
        throw error;
      }
    },
    retry: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const usePartnerTradesQuery = (partnerId: string | null) => {
  return useQuery({
    queryKey: commissionKeys.partnerTrades(partnerId!),
    queryFn: async () => {
      return commissionService.fetchPartnerTrades(partnerId);
    },
    enabled: !!partnerId,
    retry: 1,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useRefreshCommissionData = () => {
  const queryClient = useQueryClient();
  const { setLoading } = useCommissionStore();

  return async () => {
    setLoading(true);
    await queryClient.invalidateQueries({ queryKey: commissionKeys.all });
    setLoading(false);
  };
};
