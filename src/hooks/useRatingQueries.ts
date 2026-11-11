import { apiService } from "@/services/rating.service";
import type { SetupCopyingData } from "@/types/rating.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useMasters = () => {

  return useQuery({
    queryKey: ["masters"],
    queryFn: async () => {
     
      return apiService.getAllMasters();
    },
    enabled: true,
  });
};

export const useMasterDetails = (masterId: string | null) => {

  return useQuery({
    queryKey: ["master", masterId],
    queryFn: async () => {
      
      return apiService.getMasterDetails(masterId || "");
    },
    enabled:  !!masterId,
  });
};

export const useUserAccounts = () => {

  return useQuery({
    // Distinct from useDepositData's ["userAccounts"] — that one fetches
    // *all* accounts from /accounts/, this fetches only copy-eligible
    // accounts from /accounts/copy-accounts. Sharing a key would show the
    // wrong account list in whichever modal loaded second.
    queryKey: ["copyEligibleAccounts"],
    queryFn: async () => {
      return apiService.getUserAccounts();
    },
    enabled: true,
  });
};

export const useSetupCopying = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SetupCopyingData) => {
      return apiService.setupCopying(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["masters"] });
    },
  });
};


