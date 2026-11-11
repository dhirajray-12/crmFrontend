import type {
  Account,
  AccountSummary,
} from "@/types/Accountlist.type";
import { accountApi } from "@/services/AccountList.service";
import { calculateSummary, formatAccountData } from "@/utils/AccountListHelper";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

export const useAccounts = () => {
  const {
    data: accounts = [],
    isLoading: loading,
    refetch: fetchAccounts,
  } = useQuery<Account[]>({
    // Distinct from useAccountsData's ["accounts"] — that key is shared
    // between two hooks that both cache the *raw* API response and apply
    // their transform via `select` (so sharing works correctly). This hook
    // bakes formatAccountData() into the queryFn itself, caching an
    // already-transformed shape — sharing the same key would mean whichever
    // hook's queryFn ran last silently overwrites the cache with a
    // different shape than the other's consumers expect (e.g. navigating
    // Dashboard -> My Accounts would show the wrong/broken account fields).
    queryKey: ["myAccountsList"],
    queryFn: async () => {
      const response = await accountApi.fetchAccounts();
      return formatAccountData(response.data);
    },
    staleTime: 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });

  const summary: AccountSummary = useMemo(() => {
    return calculateSummary(accounts);
  }, [accounts]);

  return {
    accounts,
    summary,
    loading,
    fetchAccounts,
  };
};
