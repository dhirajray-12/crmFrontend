import { useMemo, useState } from "react";
import type { Transaction, FilterState } from "@/types/TransactionHistory.type";
import { isSameDay } from "@/utils/TransferHistoryHelper";

export const useFilters = (transactions: Transaction[]) => {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    filterType: "All",
    selectedDate: null,
  });

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    if (filters.search) {
      const searchValue = filters.search.toLowerCase();

      filtered = filtered.filter((tx) => {
        const description = tx.description?.toLowerCase?.() || "";
        const accountType = tx.accountType?.toLowerCase?.() || "";
        const status = tx.status?.toLowerCase?.() || "";

        return (
          description.includes(searchValue) ||
          accountType.includes(searchValue) ||
          status.includes(searchValue)
        );
      });
    }

    if (filters.filterType !== "All") {
      filtered = filtered.filter((tx) => tx.description === filters.filterType);
    }

    if (filters.selectedDate) {
      filtered = filtered.filter((tx) => {
        const sourceDate = tx.rawDate || tx.date;
        const txDate = new Date(sourceDate);
        return isSameDay(txDate, filters.selectedDate!);
      });
    }

    return filtered;
  }, [transactions, filters]);

  const updateSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  };

  const updateFilterType = (filterType: string) => {
    setFilters((prev) => ({ ...prev, filterType }));
  };

  const updateSelectedDate = (selectedDate: Date | null) => {
    setFilters((prev) => ({ ...prev, selectedDate }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      filterType: "All",
      selectedDate: null,
    });
  };

  return {
    filters,
    filteredTransactions,
    updateSearch,
    updateFilterType,
    updateSelectedDate,
    resetFilters,
  };
};