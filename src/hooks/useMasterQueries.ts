import MasterService from "@/services/master.service";
import type {
  CreateMasterFormData,
  MasterAccount,
  MasterSummary
} from "@/types/master.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useMasterData = () => {
  const queryClient = useQueryClient();

  const mastersQuery = useQuery({
    queryKey: ["adminCopyTradeMasters"],
    queryFn: async () => {
      const service = new MasterService();
      const masters = await service.getMasters();

      // Calculate and cache summary
      const summary = calculateSummary(masters);
      queryClient.setQueryData(["masterSummary"], summary);

      return masters;
    },
    enabled: true,
  });

  const accountsQuery = useQuery({
    // Distinct from the generic ["accounts"] key used by useAccountList /
    // useAccountsData — this hits a different endpoint
    // (/copy-trade/admin/accounts, admin-only) with a different shape, so
    // it can't share a cache slot with those.
    queryKey: ["adminCopyTradeAccounts"],
    queryFn: async () => {
      const service = new MasterService();
      return service.getAccounts();
    },
    enabled: true,
  });

  return {
    masters: mastersQuery.data || [],
    accounts: accountsQuery.data || [],
    isLoading: mastersQuery.isLoading || accountsQuery.isLoading,
    error: mastersQuery.error || accountsQuery.error,
    refetch: async () => {
      await Promise.all([mastersQuery.refetch(), accountsQuery.refetch()]);
    },
  };
};

export const useMasterSummary = () => {
  return useQuery({
    queryKey: ["masterSummary"],
    queryFn: async () => {
      // This will be populated by the masters query
      return {
        totalMasters: 0,
        activeMasters: 0,
        totalCopiers: 0,
        totalProfit: 0,
        commissionEarned: 0,
        avgPerformance: 0,
        monthlyGrowth: 12.5,
      } as MasterSummary;
    },
    enabled: false, // This query is only used to access cached data
  });
};

export const useCreateMaster = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: CreateMasterFormData) => {
      const service = new MasterService();
      await service.createMaster(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCopyTradeMasters"] });
      queryClient.invalidateQueries({ queryKey: ["masterSummary"] });
    },
  });
};

export const useUpdateMaster = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      masterId,
      formData,
    }: {
      masterId: string;
      formData: CreateMasterFormData;
    }) => {
      const service = new MasterService();
      await service.updateMaster(masterId, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCopyTradeMasters"] });
      queryClient.invalidateQueries({ queryKey: ["masterSummary"] });
    },
  });
};

export const useDeleteMaster = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (masterId: string) => {
      const service = new MasterService();
      await service.deleteMaster(masterId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCopyTradeMasters"] });
      queryClient.invalidateQueries({ queryKey: ["masterSummary"] });
    },
  });
};

// Helper function
const calculateSummary = (masters: MasterAccount[]): MasterSummary => {
  const totalMasters = masters.length;
  const activeMasters = masters.filter((m) => m.isActive).length;
  const totalCopiers = masters.reduce((acc, m) => acc + m.totalCopiers, 0);
  const totalProfit = masters.reduce((acc, m) => acc + m.totalProfit, 0);
  const commissionEarned = masters.reduce(
    (acc, m) => acc + m.totalCommissionEarned,
    0,
  );
  const avgPerformance =
    masters.length > 0
      ? masters.reduce((acc, m) => acc + (m.totalProfit > 0 ? 85 : 50), 0) /
        masters.length
      : 0;

  return {
    totalMasters,
    activeMasters,
    totalCopiers,
    totalProfit,
    commissionEarned,
    avgPerformance,
    monthlyGrowth: 12.5,
  };
};
