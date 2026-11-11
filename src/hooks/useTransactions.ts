import { useQuery, useQueryClient } from "@tanstack/react-query";
import { processTransactions } from "@/utils/processTransactions";
import { getTransactionExportRangeQueryOptions } from "@/hooks/transactionExportQueries";

export const useTransactions = (timePeriod: number) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["transactions", timePeriod],

    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timePeriod);

      const startDateStr = startDate.toISOString().split("T")[0];
      const endDateStr = endDate.toISOString().split("T")[0];

      const data = await queryClient.fetchQuery(
        getTransactionExportRangeQueryOptions(startDateStr, endDateStr),
      );

      const processedData = processTransactions(data, timePeriod);
      return processedData;
    },

    // 🔥 keeps previous chart data while fetching new data
    placeholderData: (previousData) => previousData,

    // data considered fresh for 10 minutes
    staleTime: 1000 * 60 * 10,

    // cache stored for 30 minutes
    gcTime: 1000 * 60 * 30,

    retry: 2,

    // prevent unnecessary refetches
    refetchOnWindowFocus: false,
  });
};
