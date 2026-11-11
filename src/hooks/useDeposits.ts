import type { DepositData } from "@/types/depositePage.types";
import { depositApi } from "@/services/DepositPage.service";
import { useQuery } from "@tanstack/react-query";

export const useDeposits = () => {
  const {
    data: deposits = [],
    isLoading: loading,
    error,
    refetch: fetchDeposits,
  } = useQuery<DepositData[]>({
    queryKey: ["deposits"],
    queryFn: depositApi.fetchDeposits,
    staleTime: 5 * 60 * 1000,
  });

  return {
    deposits,
    loading,
    error: error instanceof Error ? error.message : null,
    fetchDeposits,
  };
};