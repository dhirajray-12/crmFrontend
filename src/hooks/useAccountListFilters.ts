import { useMemo, useState } from "react";
import type { Account } from "@/types/Accountlist.type";

const normalizeAccountType = (value: string) =>
  String(value || "").trim().toLowerCase();

export const useFilters = (accounts: Account[]) => {
  const [selectedAccountType, setSelectedAccountType] = useState<string>("All");
  const [showAccountTypeFilter, setShowAccountTypeFilter] = useState(false);

  const accountTypes = useMemo(() => {
    const uniqueTypes = new Set(
      accounts
        .map((account) => String(account.accountType || "").trim())
        .filter(Boolean),
    );
    return ["All", ...Array.from(uniqueTypes)];
  }, [accounts]);

  const filteredAccounts = useMemo(() => {
    if (selectedAccountType === "All") {
      return accounts;
    }

    return accounts.filter(
      (account) =>
        normalizeAccountType(account.accountType) ===
        normalizeAccountType(selectedAccountType),
    );
  }, [accounts, selectedAccountType]);

  return {
    selectedAccountType,
    showAccountTypeFilter,
    accountTypes,
    filteredAccounts,
    setSelectedAccountType,
    setShowAccountTypeFilter,
  };
};
