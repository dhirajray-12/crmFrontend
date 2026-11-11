import { useState, useEffect, useCallback } from "react";
import type {
  MasterAccount,
  Account,
  MasterSummary,
} from "@/types/MasterPage.type";
import { masterApi } from "@/services/MasterPage.service";
import { calculateSummary } from "@/utils/MasterPage.helper";

export const useMasters = () => {
  const [masters, setMasters] = useState<MasterAccount[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [summary, setSummary] = useState<MasterSummary>({
    totalMasters: 0,
    activeMasters: 0,
    totalCopiers: 0,
    totalProfit: 0,
    commissionEarned: 0,
    avgPerformance: 0,
    monthlyGrowth: 12.5,
  });

  const fetchData = useCallback(async () => {

    try {
      setLoading(true);
      const [mastersRes, accountsRes] = await Promise.all([
        masterApi.getMasters(),
        masterApi.getAllAccounts(),
      ]);

      setMasters(mastersRes.data || []);
      setAccounts(accountsRes.data || []);
      setSummary(calculateSummary(mastersRes.data || []));
      setError("");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch data";
      setError(errorMessage);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchData();
    setTimeout(() => setIsRefreshing(false), 1000);
  }, [fetchData]);

  useEffect(() => {
   
      fetchData();
  }, [ fetchData]);

  return {
    masters,
    accounts,
    loading,
    error,
    isRefreshing,
    summary,
    refresh,
    fetchData,
  };
};
