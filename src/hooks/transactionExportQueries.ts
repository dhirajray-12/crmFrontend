import { getTransactionsForChart } from "@/API/clientApi";

export const getTransactionExportRangeQueryOptions = (
  startDate: string,
  endDate: string,
) => ({
  queryKey: ["transactionsExport", startDate, endDate] as const,
  queryFn: () => getTransactionsForChart(startDate, endDate),
  staleTime: 60 * 1000,
  refetchOnReconnect: true,
  refetchOnWindowFocus: false,
});
