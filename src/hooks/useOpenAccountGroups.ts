import type { AccountType, Group } from "@/types/OpenAccount.type";
import { accountApi } from "@/services/AccountList.service";
import { transformGroupsToAccountTypes } from "@/utils/OpenAccount.Helper";
import { useEffect, useState } from "react";

export const useGroups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const response = await accountApi.fetchGroups();

      if (response.success) {
        setGroups(response.data);
        setAccountTypes(transformGroupsToAccountTypes(response.data));
      } else {
        setError(response.message || "Failed to load account types");
      }
    } catch (err: any) {
      console.error("Error fetching groups:", err);
      setError("Failed to load account types. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return {
    groups,
    accountTypes,
    loading,
    error,
    fetchGroups,
  };
};
